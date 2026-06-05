// calculate-move-estimate edge function
// -------------------------------------
// Server-side proprietary move-cost estimator. Runs all pricing math
// (constants + formula) inside the edge runtime so the calculation
// cannot be tampered with from the browser. Returns a price range plus
// an HMAC-signed token the booking step verifies before persisting.
//
// Inputs are validated with zod; distance is recomputed server-side
// from coordinates (we do not trust a client-supplied distance).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://esm.sh/zod@3.23.8";
import { verifyOrigin, corsHeaders } from "../_shared/verify-origin.ts";
import {
  BASE_BY_SIZE,
  TYPE_MULTIPLIER,
  MIN_BY_TYPE,
  MAX_BY_TYPE,
  SURCHARGE_SHORT_NOTICE,
  SURCHARGE_WEEKEND,
  RANGE_SPREAD,
  INTERNATIONAL_CUSTOM_QUOTE_MILES,
  distanceCostMiles,
} from "./pricing-config.ts";
import { signEstimate } from "./signing.ts";
import { getDrivingDistanceMiles } from "./mapbox-distance.ts";

const coordsSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const inputSchema = z.object({
  moveType: z.enum(["domestic", "commercial", "international"]),
  propertySize: z.string().min(1).max(20),
  pickupCoords: coordsSchema,
  deliveryCoords: coordsSchema,
  moveDate: z.string().refine((v) => {
    const d = new Date(v);
    if (isNaN(d.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yearAhead = new Date();
    yearAhead.setFullYear(yearAhead.getFullYear() + 1);
    return d >= today && d <= yearAhead;
  }, "Move date must be between today and 12 months ahead"),
});

const round10 = (n: number) => Math.round(n / 10) * 10;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    if (!verifyOrigin(req)) return json({ error: "Invalid origin" }, 403);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    const parsed = inputSchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }, 400);
    }
    const data = parsed.data;

    const secret = Deno.env.get("MOVE_ESTIMATE_SIGNING_SECRET");
    if (!secret) {
      console.error("MOVE_ESTIMATE_SIGNING_SECRET is not set");
      return json({ error: "Server misconfigured" }, 500);
    }

    const base = BASE_BY_SIZE[data.propertySize];
    if (base === undefined) {
      return json({ error: "Unsupported property size for estimate" }, 400);
    }

    const distanceMiles = await getDrivingDistanceMiles(
      data.pickupCoords,
      data.deliveryCoords,
    );
    if (distanceMiles === null) {
      // No drivable route (e.g. sea crossing for an international move).
      // Refuse to quote rather than fall back to a misleading straight-line.
      return json(
        {
          success: true,
          requiresCustomQuote: true,
          message:
            "We can't auto-price this route. A specialist will follow up with a bespoke quote.",
        },
        200,
      );
    }
    const distCost = distanceCostMiles(distanceMiles);
    const typeMult = TYPE_MULTIPLIER[data.moveType];

    const subtotal = (base + distCost) * typeMult;

    const moveDate = new Date(data.moveDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntil = Math.round((moveDate.getTime() - today.getTime()) / 86_400_000);
    const dow = moveDate.getDay(); // 0 Sun, 6 Sat
    const isWeekend = dow === 0 || dow === 6;
    const isShortNotice = daysUntil < 7;

    let surcharge = 0;
    const appliedSurcharges: Array<{ label: string; pct: number }> = [];
    if (isShortNotice) {
      surcharge += SURCHARGE_SHORT_NOTICE;
      appliedSurcharges.push({ label: "Short notice (under 7 days)", pct: SURCHARGE_SHORT_NOTICE });
    }
    if (isWeekend) {
      surcharge += SURCHARGE_WEEKEND;
      appliedSurcharges.push({ label: "Weekend move", pct: SURCHARGE_WEEKEND });
    }

    let total = subtotal * (1 + surcharge);
    total = Math.max(MIN_BY_TYPE[data.moveType], Math.min(MAX_BY_TYPE[data.moveType], total));

    const low = round10(total * (1 - RANGE_SPREAD));
    const high = round10(total * (1 + RANGE_SPREAD));

    const requiresCustomQuote =
      data.moveType === "international" && distanceMiles > INTERNATIONAL_CUSTOM_QUOTE_MILES;

    const issuedAt = Date.now();
    const token = await signEstimate(
      {
        low,
        high,
        moveType: data.moveType,
        propertySize: data.propertySize,
        pickupLat: data.pickupCoords.latitude,
        pickupLng: data.pickupCoords.longitude,
        deliveryLat: data.deliveryCoords.latitude,
        deliveryLng: data.deliveryCoords.longitude,
        moveDate: data.moveDate,
        distanceMiles: Math.round(distanceMiles * 100) / 100,
        issuedAt,
      },
      secret,
    );

    return json(
      {
        success: true,
        low,
        high,
        distanceMiles: Math.round(distanceMiles * 10) / 10,
        breakdown: {
          base: Math.round(base),
          distanceCost: Math.round(distCost),
          typeMultiplier: typeMult,
          surcharges: appliedSurcharges,
        },
        requiresCustomQuote,
        estimateToken: token,
        issuedAt,
      },
      200,
    );
  } catch (err) {
    console.error("calculate-move-estimate error:", err);
    return json({ error: err instanceof Error ? err.message : "Unexpected error" }, 500);
  }
});
