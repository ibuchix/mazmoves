// mcp-server edge function
// ------------------------
// Internal MCP (Model Context Protocol) endpoint for AI agents to book moves.
// Reached ONLY through the public `agent-bridge` proxy. Direct calls without
// the shared-secret header are rejected with 403.
//
// Hardening (vs previous revision):
//   - Requires X-Agent-Bridge-Auth shared secret on every request.
//   - Prefers X-Agent-Bridge-Client-IP (set by the proxy) over x-forwarded-for.
//   - Per-IP, per-email, per-phone, and global hourly submission caps —
//     ALL filter on source='mcp' so they never interfere with human/web rows
//     written by submit-move-request.
//   - MCP inserts are flagged pending_review=true and DO NOT trigger
//     notify-companies. Admin clears the flag to release the row to the
//     normal matcher/notification path. Human submissions (source='web',
//     pending_review default false) are unaffected.

import { Hono } from "npm:hono@4.6.14";
import { McpServer, StreamableHttpTransport } from "npm:mcp-lite@^0.10.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { moveRequestSchema, sanitizeInstructions } from "../_shared/move-request-validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, accept, mcp-session-id, x-agent-bridge-auth, x-agent-bridge-client-ip",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// --- Abuse caps ---------------------------------------------------------
const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const MAX_SUBMISSIONS_PER_IP_PER_DAY = 2;
const MAX_SUBMISSIONS_PER_EMAIL_PER_DAY = 2;
const MAX_SUBMISSIONS_PER_PHONE_PER_DAY = 2;
const MAX_MCP_SUBMISSIONS_PER_HOUR_GLOBAL = 20;
const MAX_TOOL_CALLS_PER_IP_PER_DAY = 30;

const AGENT_BRIDGE_SECRET = Deno.env.get("AGENT_BRIDGE_SECRET") ?? "";

const toolCallCounter = new Map<string, { count: number; windowStart: number }>();

function getClientIp(req: Request): string {
  const proxied = req.headers.get("x-agent-bridge-client-ip");
  if (proxied) return proxied.split(",")[0].trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") ?? req.headers.get("x-real-ip") ?? "unknown";
}

function verifyBridgeAuth(req: Request): boolean {
  if (!AGENT_BRIDGE_SECRET) return false;
  return req.headers.get("x-agent-bridge-auth") === AGENT_BRIDGE_SECRET;
}

function bumpToolCall(ip: string): { allowed: boolean } {
  const now = Date.now();
  const entry = toolCallCounter.get(ip);
  if (!entry || now - entry.windowStart > DAY_MS) {
    toolCallCounter.set(ip, { count: 1, windowStart: now });
    return { allowed: true };
  }
  entry.count += 1;
  return { allowed: entry.count <= MAX_TOOL_CALLS_PER_IP_PER_DAY };
}

// --- Supabase client (service role) -------------------------------------
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

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
        street: { type: "string" }, city: { type: "string" }, state: { type: "string" },
        zipCode: { type: "string" }, country: { type: "string" },
      },
    },
    deliveryAddress: {
      type: "object",
      required: ["street", "city", "zipCode"],
      properties: {
        street: { type: "string" }, city: { type: "string" }, state: { type: "string" },
        zipCode: { type: "string" }, country: { type: "string" },
      },
    },
    moveDate: { type: "string", description: "ISO date (YYYY-MM-DD), today or later" },
    fullName: { type: "string" },
    email: { type: "string", format: "email" },
    phone: { type: "string", description: "8+ digits, may include spaces, dashes, parens, +" },
    specialInstructions: { type: ["string", "null"] },
  },
} as const;

const mcpServer = new McpServer({ name: "housemove-mcp", version: "1.0.0" });

mcpServer.tool("get_required_fields", {
  description:
    "Returns the JSON schema of fields required to submit a UK house-move request via submit_move_request. Call this first so you know what to collect from the user.",
  inputSchema: { type: "object", properties: {} },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(REQUIRED_FIELDS_SCHEMA, null, 2) }],
  }),
});

mcpServer.tool("submit_move_request", {
  description:
    "Submits a UK house-move request on behalf of a human user. HouseMove will match the request to nearby moving companies who will then contact the user directly. Returns the request id and matching status.",
  inputSchema: REQUIRED_FIELDS_SCHEMA,
  handler: async (input: unknown, ctx: { request?: Request } | undefined) => {
    const req = ctx?.request as Request | undefined;
    const ip = req ? getClientIp(req) : "unknown";

    // Validate first so we have email/phone for per-identity caps.
    const parsed = moveRequestSchema.safeParse(input);
    if (!parsed.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ error: "validation_failed", details: parsed.error.flatten().fieldErrors }),
        }],
        isError: true,
      };
    }
    const data = parsed.data;

    const daySinceIso = new Date(Date.now() - DAY_MS).toISOString();
    const hourSinceIso = new Date(Date.now() - HOUR_MS).toISOString();

    // All cap queries are SCOPED to source='mcp' so human (source='web')
    // submissions never count against agent quotas and vice-versa.
    const [ipRes, emailRes, phoneRes, globalRes] = await Promise.all([
      supabase.from("move_requests").select("id", { count: "exact", head: true })
        .eq("source", "mcp").eq("ip_origin", ip).gte("created_at", daySinceIso),
      supabase.from("move_requests").select("id", { count: "exact", head: true })
        .eq("source", "mcp").eq("customer_email", data.email).gte("created_at", daySinceIso),
      supabase.from("move_requests").select("id", { count: "exact", head: true })
        .eq("source", "mcp").eq("customer_phone", data.phone).gte("created_at", daySinceIso),
      supabase.from("move_requests").select("id", { count: "exact", head: true })
        .eq("source", "mcp").gte("created_at", hourSinceIso),
    ]);

    if ((ipRes.count ?? 0) >= MAX_SUBMISSIONS_PER_IP_PER_DAY) {
      return rateLimited("Per-IP daily limit reached.");
    }
    if ((emailRes.count ?? 0) >= MAX_SUBMISSIONS_PER_EMAIL_PER_DAY) {
      return rateLimited("Per-email daily limit reached.");
    }
    if ((phoneRes.count ?? 0) >= MAX_SUBMISSIONS_PER_PHONE_PER_DAY) {
      return rateLimited("Per-phone daily limit reached.");
    }
    if ((globalRes.count ?? 0) >= MAX_MCP_SUBMISSIONS_PER_HOUR_GLOBAL) {
      return rateLimited("Global hourly limit reached, please retry later.");
    }

    const [pickupCoords, deliveryCoords] = await Promise.all([
      geocode(data.pickupAddress),
      geocode(data.deliveryAddress),
    ]);

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
        pending_review: true,
      }])
      .select("id, status")
      .single();

    if (insertError || !inserted) {
      console.error("MCP insert failed:", insertError);
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "insert_failed", message: insertError?.message }) }],
        isError: true,
      };
    }

    // IMPORTANT: do NOT call notify-companies here. MCP rows are held for
    // admin review (pending_review=true). The human submission path is
    // unchanged — submit-move-request still calls notify-companies directly.

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: true,
          requestId: inserted.id,
          status: "pending_review",
          message:
            "Move request received and queued for review. Once approved, HouseMove will match it to nearby movers who will contact the user directly.",
        }),
      }],
    };
  },
});

function rateLimited(message: string) {
  return {
    content: [{ type: "text", text: JSON.stringify({ error: "rate_limited", message }) }],
    isError: true,
  };
}

// --- HTTP transport via Hono --------------------------------------------
const app = new Hono();
const transport = new StreamableHttpTransport();
const httpHandler = transport.bind(mcpServer);

app.options("/*", () => new Response(null, { headers: corsHeaders }));

app.all("/*", async (c) => {
  // Reject anything not coming through agent-bridge.
  if (!verifyBridgeAuth(c.req.raw)) {
    return new Response(
      JSON.stringify({ jsonrpc: "2.0", error: { code: -32001, message: "Forbidden" }, id: null }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const ip = getClientIp(c.req.raw);
  const gate = bumpToolCall(ip);
  if (!gate.allowed) {
    return new Response(
      JSON.stringify({ jsonrpc: "2.0", error: { code: -32000, message: "Rate limit exceeded" }, id: null }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  const res = await httpHandler(c.req.raw);
  const merged = new Headers(res.headers);
  for (const [k, v] of Object.entries(corsHeaders)) merged.set(k, v);
  return new Response(res.body, { status: res.status, headers: merged });
});

Deno.serve(app.fetch);
