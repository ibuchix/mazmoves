// mcp-server edge function
// ------------------------
// Public MCP (Model Context Protocol) endpoint for AI agents to book moves.
// Mirrors the human submission flow (validation, geocoding, matching) but is
// transport-agnostic — agents speak JSON-RPC over Streamable HTTP.
//
// Tools exposed:
//   - get_required_fields   : returns the JSON schema agents must fill
//   - submit_move_request   : validates + geocodes + inserts + notifies
//
// Abuse model: 2 successful submissions / IP / 24h, 30 tool calls / IP / 24h.
// Per-IP submission cap counts existing move_requests rows with source='mcp'
// from the same ip_origin (stored alongside source). Tool-call cap is in-memory
// (best-effort, resets on cold start — acceptable for a low-traffic endpoint).
//
// New rows are tagged source='mcp' for admin visibility.

import { Hono } from "npm:hono@4.6.14";
import { McpServer, StreamableHttpTransport } from "npm:mcp-lite@^0.10.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { moveRequestSchema, sanitizeInstructions } from "../submit-move-request/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// --- Abuse caps ---------------------------------------------------------
const SUBMISSION_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_SUBMISSIONS_PER_IP_PER_DAY = 2;
const MAX_TOOL_CALLS_PER_IP_PER_DAY = 30;

// In-memory tool-call counter, keyed by IP -> { count, windowStart }
const toolCallCounter = new Map<string, { count: number; windowStart: number }>();

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") ?? req.headers.get("x-real-ip") ?? "unknown";
}

function bumpToolCall(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = toolCallCounter.get(ip);
  if (!entry || now - entry.windowStart > SUBMISSION_WINDOW_MS) {
    toolCallCounter.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_TOOL_CALLS_PER_IP_PER_DAY - 1 };
  }
  entry.count += 1;
  return {
    allowed: entry.count <= MAX_TOOL_CALLS_PER_IP_PER_DAY,
    remaining: Math.max(0, MAX_TOOL_CALLS_PER_IP_PER_DAY - entry.count),
  };
}

// --- Supabase client (service role) -------------------------------------
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

// --- Geocode helper (calls existing geocode-address function) -----------
async function geocode(address: {
  street: string;
  city: string;
  state?: string;
  zipCode: string;
  country?: string;
}): Promise<{ latitude: number; longitude: number } | null> {
  const parts = [address.street, address.city, address.state, address.zipCode, address.country]
    .filter((p) => p && p.trim())
    .join(", ");
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/geocode-address`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({ address: parts }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (typeof data.latitude === "number" && typeof data.longitude === "number") {
      return { latitude: data.latitude, longitude: data.longitude };
    }
    return null;
  } catch (err) {
    console.error("geocode failed:", err);
    return null;
  }
}

// --- Required-fields schema (JSON Schema mirror of moveRequestSchema) ---
const REQUIRED_FIELDS_SCHEMA = {
  type: "object",
  required: ["moveType", "propertySize", "pickupAddress", "deliveryAddress", "moveDate", "fullName", "email", "phone"],
  properties: {
    moveType: { type: "string", enum: ["domestic", "commercial", "international"] },
    propertySize: { type: "string", enum: ["1", "2", "3", "4", "5+", "office", "warehouse", "retail"] },
    pickupAddress: {
      type: "object",
      required: ["street", "city", "zipCode"],
      properties: {
        street: { type: "string" },
        city: { type: "string" },
        state: { type: "string" },
        zipCode: { type: "string" },
        country: { type: "string" },
      },
    },
    deliveryAddress: {
      type: "object",
      required: ["street", "city", "zipCode"],
      properties: {
        street: { type: "string" },
        city: { type: "string" },
        state: { type: "string" },
        zipCode: { type: "string" },
        country: { type: "string" },
      },
    },
    moveDate: { type: "string", description: "ISO date (YYYY-MM-DD), today or later" },
    fullName: { type: "string" },
    email: { type: "string", format: "email" },
    phone: { type: "string", description: "8+ digits, may include spaces, dashes, parens, +" },
    specialInstructions: { type: ["string", "null"] },
  },
} as const;

// --- MCP server setup ---------------------------------------------------
const mcpServer = new McpServer({
  name: "housemove-mcp",
  version: "1.0.0",
});

mcpServer.tool({
  name: "get_required_fields",
  description:
    "Returns the JSON schema of fields required to submit a UK house-move request via submit_move_request. Call this first so you know what to collect from the user.",
  inputSchema: { type: "object", properties: {} },
  handler: async () => {
    return {
      content: [{ type: "text", text: JSON.stringify(REQUIRED_FIELDS_SCHEMA, null, 2) }],
    };
  },
});

mcpServer.tool({
  name: "submit_move_request",
  description:
    "Submits a UK house-move request on behalf of a human user. HouseMove will match the request to nearby moving companies who will then contact the user directly. Returns the request id and matching status.",
  inputSchema: REQUIRED_FIELDS_SCHEMA,
  handler: async (input: unknown, ctx: { request?: Request } | undefined) => {
    const req = ctx?.request as Request | undefined;
    const ip = req ? getClientIp(req) : "unknown";

    // Per-IP daily submission cap (counted from DB to survive cold starts).
    const sinceIso = new Date(Date.now() - SUBMISSION_WINDOW_MS).toISOString();
    const { count: ipCount } = await supabase
      .from("move_requests")
      .select("id", { count: "exact", head: true })
      .eq("source", "mcp")
      .eq("ip_origin", ip)
      .gte("created_at", sinceIso);

    if ((ipCount ?? 0) >= MAX_SUBMISSIONS_PER_IP_PER_DAY) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: "rate_limited",
            message: `Maximum ${MAX_SUBMISSIONS_PER_IP_PER_DAY} submissions per IP per 24 hours reached.`,
          }),
        }],
        isError: true,
      };
    }

    // Validate
    const parsed = moveRequestSchema.safeParse(input);
    if (!parsed.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: "validation_failed",
            details: parsed.error.flatten().fieldErrors,
          }),
        }],
        isError: true,
      };
    }
    const data = parsed.data;

    // Geocode (best-effort; backstop matcher retries later if missing)
    const [pickupCoords, deliveryCoords] = await Promise.all([
      geocode(data.pickupAddress),
      geocode(data.deliveryAddress),
    ]);

    // Insert
    const { data: inserted, error: insertError } = await supabase
      .from("move_requests")
      .insert([{
        move_type: data.moveType,
        estimated_size: data.propertySize,
        pickup_address: data.pickupAddress as never,
        delivery_address: data.deliveryAddress as never,
        requested_date: data.moveDate,
        customer_name: data.fullName,
        customer_email: data.email,
        customer_phone: data.phone,
        special_instructions: sanitizeInstructions(data.specialInstructions),
        pickup_latitude: pickupCoords?.latitude ?? null,
        pickup_longitude: pickupCoords?.longitude ?? null,
        delivery_latitude: deliveryCoords?.latitude ?? null,
        delivery_longitude: deliveryCoords?.longitude ?? null,
        source: "mcp",
        ip_origin: ip,
      }])
      .select("id, status")
      .single();

    if (insertError || !inserted) {
      console.error("MCP insert failed:", insertError);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ error: "insert_failed", message: insertError?.message }),
        }],
        isError: true,
      };
    }

    // Trigger matching (fire-and-forget — same pattern as web flow)
    fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/notify-companies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({ moveRequestId: inserted.id }),
    }).catch((err) => console.error("notify-companies dispatch failed:", err));

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: true,
          requestId: inserted.id,
          status: "submitted",
          message:
            "Move request submitted. HouseMove will match it to nearby movers and the user will be contacted by interested companies.",
        }),
      }],
    };
  },
});

// --- HTTP transport via Hono --------------------------------------------
const app = new Hono();
const transport = new StreamableHttpTransport();

app.options("/*", (c) => new Response(null, { headers: corsHeaders }));

app.all("/*", async (c) => {
  const ip = getClientIp(c.req.raw);
  const gate = bumpToolCall(ip);
  if (!gate.allowed) {
    return new Response(
      JSON.stringify({ jsonrpc: "2.0", error: { code: -32000, message: "Rate limit exceeded" }, id: null }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  const res = await transport.handleRequest(c.req.raw, mcpServer);
  // Merge CORS headers into MCP response
  const merged = new Headers(res.headers);
  for (const [k, v] of Object.entries(corsHeaders)) merged.set(k, v);
  return new Response(res.body, { status: res.status, headers: merged });
});

Deno.serve(app.fetch);
