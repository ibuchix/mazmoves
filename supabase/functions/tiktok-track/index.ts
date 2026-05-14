// tiktok-track edge function
// --------------------------
// Server-side counterpart to the TikTok Pixel. Receives an event from
// the browser (with a shared event_id for dedup) and forwards it to
// TikTok Events API: https://business-api.tiktok.com/open_api/v1.3/event/track/
//
// Why server-side: pixel-only events are increasingly blocked by ad
// blockers, iOS ITP, and cookie restrictions. Server events fire
// reliably and are deduped against the pixel using event_id.
//
// Scope (matches src/utils/tracking/tiktok.ts):
//   - ViewContent, InitiateCheckout, CompleteRegistration, PlaceAnOrder
//
// PII (email, phone, external_id) is SHA-256 hashed here regardless of
// what the client sent — defence in depth.
//
// Tracking failures must NEVER break UX: this endpoint always returns
// { success: true } with HTTP 200 once the request is well-formed.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://esm.sh/zod@3.23.8";
import { verifyOrigin, corsHeaders } from "../_shared/verify-origin.ts";

const TIKTOK_ENDPOINT =
  "https://business-api.tiktok.com/open_api/v1.3/event/track/";

const ALLOWED_EVENTS = [
  "ViewContent",
  "ClickButton",
  "InitiateCheckout",
  "SubmitForm",
  "CompleteRegistration",
] as const;

const bodySchema = z.object({
  event: z.enum(ALLOWED_EVENTS),
  event_id: z.string().min(1).max(128),
  event_time: z.number().int().positive().optional(),
  url: z.string().url().optional(),
  content: z
    .object({
      id: z.string().min(1).max(128),
      type: z.enum(["product", "product_group"]),
      name: z.string().min(1).max(256),
    })
    .optional(),
  value: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  search_string: z.string().max(256).optional(),
  user: z
    .object({
      // Values may arrive pre-hashed (64-char SHA-256 hex) or raw, so
      // limits must accommodate the hashed length plus headroom.
      email: z.string().max(320).optional(),
      phone: z.string().max(128).optional(),
      external_id: z.string().max(256).optional(),
      ttclid: z.string().max(512).optional(),
      ttp: z.string().max(512).optional(),
    })
    .optional(),
});

const sha256Hex = async (input: string): Promise<string> => {
  const normalised = input.trim().toLowerCase();
  const buf = new TextEncoder().encode(normalised);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// If the value already looks like a 64-char hex SHA-256 digest, keep it.
// Otherwise hash it. Lets the client pre-hash without us double-hashing.
const ensureHashed = async (value?: string): Promise<string | undefined> => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (/^[a-f0-9]{64}$/i.test(trimmed)) return trimmed.toLowerCase();
  return await sha256Hex(trimmed);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    if (!verifyOrigin(req)) {
      return json({ error: "Invalid origin" }, 403);
    }

    const accessToken = Deno.env.get("TIKTOK_EVENTS_ACCESS_TOKEN");
    const pixelId = Deno.env.get("TIKTOK_PIXEL_ID");
    if (!accessToken || !pixelId) {
      console.error("Missing TIKTOK_EVENTS_ACCESS_TOKEN or TIKTOK_PIXEL_ID");
      // Don't leak config issues to the client; pretend success.
      return json({ success: true }, 200);
    }

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      console.error("tiktok-track validation failed:", parsed.error.flatten());
      return json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        400,
      );
    }
    const data = parsed.data;

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    const user: Record<string, string> = {};
    if (ip) user.ip = ip;
    if (userAgent) user.user_agent = userAgent;
    const hashedEmail = await ensureHashed(data.user?.email);
    const hashedPhone = await ensureHashed(data.user?.phone);
    const hashedExt = await ensureHashed(data.user?.external_id);
    if (hashedEmail) user.email = hashedEmail;
    if (hashedPhone) user.phone = hashedPhone;
    if (hashedExt) user.external_id = hashedExt;
    if (data.user?.ttclid) user.ttclid = data.user.ttclid;
    if (data.user?.ttp) user.ttp = data.user.ttp;

    const properties: Record<string, unknown> = {
      currency: data.currency ?? "GBP",
      value: data.value ?? 0,
    };
    if (data.content) {
      properties.contents = [
        {
          content_id: data.content.id,
          content_type: data.content.type,
          content_name: data.content.name,
        },
      ];
    }
    if (data.search_string) properties.search_string = data.search_string;

    const testEventCode = Deno.env.get("TIKTOK_TEST_EVENT_CODE");

    const tiktokPayload: Record<string, unknown> = {
      event_source: "web",
      event_source_id: pixelId,
      data: [
        {
          event: data.event,
          event_time: data.event_time ?? Math.floor(Date.now() / 1000),
          event_id: data.event_id,
          user,
          properties,
          page: data.url ? { url: data.url } : undefined,
        },
      ],
    };
    if (testEventCode) tiktokPayload.test_event_code = testEventCode;

    const ttRes = await fetch(TIKTOK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": accessToken,
      },
      body: JSON.stringify(tiktokPayload),
    });

    const ttBody = await ttRes.text();
    let ttCode: number | undefined;
    try {
      ttCode = (JSON.parse(ttBody) as { code?: number }).code;
    } catch { /* ignore */ }

    if (!ttRes.ok) {
      console.error(
        `tiktok-track ${data.event} event_id=${data.event_id} HTTP ${ttRes.status}:`,
        ttBody,
      );
    } else if (ttCode && ttCode !== 0) {
      console.error(
        `tiktok-track ${data.event} event_id=${data.event_id} TikTok code=${ttCode}:`,
        ttBody,
      );
    } else {
      console.log(
        `tiktok-track ${data.event} event_id=${data.event_id} ok${testEventCode ? " (test)" : ""}`,
      );
    }

    return json({ success: true }, 200);
  } catch (err) {
    console.error("tiktok-track unexpected error:", err);
    // Still 200 — never break the calling UI for an analytics failure.
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
