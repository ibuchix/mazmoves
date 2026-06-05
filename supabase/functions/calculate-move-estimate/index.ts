// calculate-move-estimate edge function
// -------------------------------------
// Server-side proprietary move-cost estimator. Pricing runs inside the
// edge runtime so the browser cannot tamper with the numbers, and the
// result is returned alongside an HMAC-signed token the booking step
// re-verifies before persisting.
//
// Changes in this revision:
//   - Replaced flat base-by-size pricing with a labour + vehicle + fuel
//     + materials model that flexes with volume, distance and a live
//     demand factor (seasonal lift, day of week, short-notice lift).
//   - Range spread tightened to +/- 8% and rounded to the nearest £10.
//   - Breakdown now reports the cost components used so the UI panel
//     ("How we calculated this") stays meaningful.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://esm.sh/zod@3.23.8";
import { verifyOrigin, corsHeaders } from "../_shared/verify-origin.ts";
import {
  VOLUME_M3,
  COMMERCIAL_VOLUME_M3,
  TYPE_MULTIPLIER,
  MIN_BY_TYPE,
  MAX_BY_TYPE,
  HOURLY_RATE,
  FUEL_PER_MILE,
  MATERIALS_PER_M3,
  RANGE_SPREAD,
  INTERNATIONAL_CUSTOM_QUOTE_MILES,
  crewSizeForVolume,
  vehicleRateForVolume,
  totalHours,
  seasonalLift,
  dayOfWeekLift,
  noticeLift,
} from "./pricing-config.ts";
import { signEstimate } from "./signing.ts";
import { getDrivingDistanceMiles } from "./mapbox-distance.ts";

const coordsSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const commercialProfileSchema = z.object({
  premisesType: z.enum(["office", "retail", "warehouse", "industrial", "other"]),
  scale: z.enum(["small", "medium", "large", "enterprise"]),
});

const inputSchema = z.object({
  moveType: z.enum(["domestic", "commercial", "international"]),
  propertySize: z.string().min(1).max(20).optional(),
  commercialProfile: commercialProfileSchema.optional(),
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
}).refine(
  (v) =>
    v.moveType === "commercial"
      ? !!v.commercialProfile
      : !!v.propertySize,
  { message: "propertySize or commercialProfile is required for this move type" },
);

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

    // Resolve volume (and detect bespoke-quote cases).
    let volume: number | null = null;
    if (data.moveType === "commercial") {
      const { premisesType, scale } = data.commercialProfile!;
      const lookup = COMMERCIAL_VOLUME_M3[premisesType][scale];
      if (lookup === "custom") {
        return json(
          {
            success: true,
            requiresCustomQuote: true,
            message:
              "Enterprise commercial moves need a tailored quote. Book now and a specialist will be in touch.",
          },
          200,
        );
      }
      volume = lookup;
    } else {
      const v = VOLUME_M3[data.propertySize!];
      if (v === undefined) {
        return json({ error: "Unsupported property size for estimate" }, 400);
      }
      volume = v;
    }

    const distanceMiles = await getDrivingDistanceMiles(
      data.pickupCoords,
      data.deliveryCoords,
    );
    if (distanceMiles === null) {
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

    // Core cost components.
    const crew = crewSizeForVolume(volume);
    const hours = totalHours(volume, distanceMiles);
    const labour = crew * HOURLY_RATE * hours;
    const vehicle = vehicleRateForVolume(volume);
    const fuel = distanceMiles * 2 * FUEL_PER_MILE;
    const materials = volume * MATERIALS_PER_M3;
    const typeMult = TYPE_MULTIPLIER[data.moveType];
    const subtotal = (labour + vehicle + fuel + materials) * typeMult;

    // Live demand lifts.
    const moveDate = new Date(data.moveDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntil = Math.round((moveDate.getTime() - today.getTime()) / 86_400_000);
    const lifts = [
      noticeLift(daysUntil),
      dayOfWeekLift(moveDate.getDay()),
      seasonalLift(moveDate.getMonth()),
    ];
    const appliedSurcharges: Array<{ label: string; pct: number }> = [];
    let demand = 1;
    for (const l of lifts) {
      if (l.pct !== 0 && l.label) {
        demand += l.pct;
        appliedSurcharges.push({ label: l.label, pct: l.pct });
      }
    }

    let total = subtotal * demand;
    total = Math.max(MIN_BY_TYPE[data.moveType], Math.min(MAX_BY_TYPE[data.moveType], total));

    const round10 = (n: number) => Math.round(n / 10) * 10;
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
        propertySize: data.propertySize ?? null,
        commercialProfile: data.commercialProfile ?? null,
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
          // "base" here represents the combined labour + materials + vehicle
          // baseline before fuel and demand lifts, so the UI breakdown stays
          // intuitive without leaking the full proprietary model.
          base: Math.round(labour + vehicle + materials),
          distanceCost: Math.round(fuel),
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
