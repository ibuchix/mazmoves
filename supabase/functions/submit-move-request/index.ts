// submit-move-request edge function
// ----------------------------------
// Server-mediated insert path for anonymous customer move requests.
// Replaces direct anon INSERTs into `move_requests` so the table can be
// locked down by RLS. Pipeline:
//   1. Origin check (reuses _shared/verify-origin.ts).
//   2. Soft IP/email rate limit — max 5 requests / hour for the same
//      customer email, max 20 / hour from the same IP. Counts existing
//      rows in move_requests; no new infra required.
//   3. Strict zod validation + HTML stripping for special_instructions.
//   4. Service-role insert with the same column set the frontend used
//      to write directly. Trigger derives PostGIS columns. Matching
//      pipeline (notify-companies / process-matches) is unaffected
//      because it runs with the service role and reads by id.
//
// Phase 2 will slot Cloudflare Turnstile verification in between
// origin check and rate limit.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { verifyOrigin, corsHeaders } from "../_shared/verify-origin.ts";
import { moveRequestSchema, sanitizeInstructions } from "./validation.ts";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_EMAIL = 5;

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

    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    const parsed = moveRequestSchema.safeParse(
      (payload as { moveRequest?: unknown })?.moveRequest,
    );
    if (!parsed.success) {
      console.error("Validation failed:", parsed.error.flatten());
      return json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        400,
      );
    }
    const data = parsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Rate limit by customer email — simple count of recent rows.
    const sinceIso = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count, error: countError } = await supabase
      .from("move_requests")
      .select("id", { count: "exact", head: true })
      .eq("customer_email", data.email)
      .gte("created_at", sinceIso);

    if (countError) {
      console.error("Rate limit check failed:", countError);
      // Fail open — don't block legitimate users on a count failure.
    } else if ((count ?? 0) >= MAX_PER_EMAIL) {
      return json(
        { error: "You've submitted too many requests recently. Please try again later." },
        429,
      );
    }

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
        pickup_latitude: data.pickupCoords?.latitude ?? null,
        pickup_longitude: data.pickupCoords?.longitude ?? null,
        delivery_latitude: data.deliveryCoords?.latitude ?? null,
        delivery_longitude: data.deliveryCoords?.longitude ?? null,
      }])
      .select("id")
      .single();

    if (insertError || !inserted) {
      console.error("Insert failed:", insertError);
      return json({ error: insertError?.message ?? "Failed to save move request" }, 500);
    }

    // Fire notify-companies server-side so it always runs (browser
    // fire-and-forget calls were being lost on navigation / JWT verify).
    // Kept alive past the response via EdgeRuntime.waitUntil when available.
    const notifyPromise = supabase.functions
      .invoke("notify-companies", { body: { moveRequestId: inserted.id } })
      .then(({ error }) => {
        if (error) {
          console.error("notify-companies invocation error (non-blocking):", error);
        }
      })
      .catch((err) => {
        console.error("notify-companies threw (non-blocking):", err);
      });

    // @ts-ignore — EdgeRuntime is provided by Supabase Edge Runtime
    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime?.waitUntil) {
      // @ts-ignore
      EdgeRuntime.waitUntil(notifyPromise);
    }

    return json({ success: true, id: inserted.id }, 200);
  } catch (err) {
    console.error("submit-move-request unexpected error:", err);
    return json({ error: err instanceof Error ? err.message : "Unexpected error" }, 500);
  }
});
