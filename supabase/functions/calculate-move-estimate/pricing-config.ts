// pricing-config.ts
// -------------------------------------------------------------
// HouseMove proprietary "alive" move-cost estimation model.
//
// The price is composed from real cost drivers (crew labour, vehicle
// day rate, fuel, materials) and modulated by live demand signals
// (season, day of week, short notice). This replaces the old flat
// base-by-size lookup with something that scales naturally with the
// shape of the actual job.
//
// Changes in this revision:
//   - Removed flat BASE_BY_SIZE / COMMERCIAL_BASE numeric anchors.
//   - Added VOLUME_M3 + COMMERCIAL_VOLUME_M3 lookups.
//   - Added labour + vehicle + fuel + materials cost helpers.
//   - Added seasonal / day-of-week / short-notice lift helpers.
//   - Enterprise commercial moves still resolve to a bespoke quote.
//   - Range spread tightened to +/- 8%.
//
// All amounts are GBP.
// -------------------------------------------------------------

export type CommercialPremises = "office" | "retail" | "warehouse" | "industrial" | "other";
export type CommercialScale = "small" | "medium" | "large" | "enterprise";

// Estimated load volume (m3) per property size. Drives crew size,
// loading/unloading hours, vehicle class and materials cost.
export const VOLUME_M3: Record<string, number> = {
  "1": 18,
  "2": 30,
  "3": 45,
  "4": 60,
  "5+": 80,
  business: 60,
};

// Commercial volume by premises type x scale. "custom" forces a
// bespoke quote response (no auto price returned).
export const COMMERCIAL_VOLUME_M3: Record<
  CommercialPremises,
  Record<CommercialScale, number | "custom">
> = {
  office:     { small: 22, medium: 55,  large: 130, enterprise: "custom" },
  retail:     { small: 25, medium: 60,  large: 140, enterprise: "custom" },
  warehouse:  { small: 40, medium: 110, large: 240, enterprise: "custom" },
  industrial: { small: 45, medium: 120, large: 260, enterprise: "custom" },
  other:      { small: 25, medium: 65,  large: 150, enterprise: "custom" },
};

// Core cost inputs.
export const HOURLY_RATE = 28;            // per crew member per hour
export const FUEL_PER_MILE = 0.42;        // round-trip miles are factored separately
export const MATERIALS_PER_M3 = 1.2;

export const VEHICLE_DAY_RATE = {
  luton: 95,    // up to ~35 m3
  truck75: 160, // 7.5t, up to ~90 m3
  truck18: 240, // 18t, larger
} as const;

export function vehicleRateForVolume(volume: number): number {
  if (volume <= 35) return VEHICLE_DAY_RATE.luton;
  if (volume <= 90) return VEHICLE_DAY_RATE.truck75;
  return VEHICLE_DAY_RATE.truck18;
}

export function crewSizeForVolume(volume: number): number {
  // ~1 mover per ~18 m3 reflects real UK crew sizing more accurately
  // (e.g. 4-bed @ 60 m3 ~= 4 movers, not 5).
  return Math.min(5, Math.max(2, Math.ceil(volume / 18)));
}

// Hours model: load + unload + drive (round trip at ~30 mph avg).
// Tuned down from 0.10/0.08 per m3 so labour cost reflects realistic
// pace for an experienced crew on average-access properties.
export function totalHours(volume: number, distanceMiles: number): number {
  const load = volume * 0.09;
  const unload = volume * 0.07;
  const drive = (distanceMiles / 30) * 2;
  return Math.max(2, load + unload + drive);
}

export const TYPE_MULTIPLIER: Record<string, number> = {
  domestic: 1.0,
  commercial: 1.10,
  international: 1.85,
};

// Sanity bounds.
export const MIN_BY_TYPE: Record<string, number> = {
  domestic: 180,
  commercial: 320,
  international: 750,
};
export const MAX_BY_TYPE: Record<string, number> = {
  domestic: 6500,
  commercial: 18000,
  international: 35000,
};

// Demand lifts.
export const SURCHARGE_SHORT_NOTICE_DAYS = 2;
export const SURCHARGE_SHORT_NOTICE = 0.15;       // < 2 days out
export const SURCHARGE_NEAR_TERM = 0.05;          // 2..6 days out
export const SURCHARGE_NEAR_TERM_MAX_DAYS = 6;
export const SURCHARGE_WEEKEND = 0.05;            // Sat / Sun
export const SURCHARGE_FRIDAY = 0.02;
export const SURCHARGE_PEAK_SEASON = 0.05;        // Jun/Jul/Aug
export const DISCOUNT_OFF_PEAK = -0.03;           // Dec/Jan

export function seasonalLift(month: number): { pct: number; label?: string } {
  // month is 0..11
  if (month >= 5 && month <= 7) return { pct: SURCHARGE_PEAK_SEASON, label: "Peak season" };
  if (month === 11 || month === 0) return { pct: DISCOUNT_OFF_PEAK, label: "Off-peak discount" };
  return { pct: 0 };
}

export function dayOfWeekLift(dow: number): { pct: number; label?: string } {
  if (dow === 0 || dow === 6) return { pct: SURCHARGE_WEEKEND, label: "Weekend move" };
  if (dow === 5) return { pct: SURCHARGE_FRIDAY, label: "Friday move" };
  return { pct: 0 };
}

export function noticeLift(daysUntil: number): { pct: number; label?: string } {
  if (daysUntil < SURCHARGE_SHORT_NOTICE_DAYS) {
    return { pct: SURCHARGE_SHORT_NOTICE, label: `Short notice (under ${SURCHARGE_SHORT_NOTICE_DAYS} days)` };
  }
  if (daysUntil <= SURCHARGE_NEAR_TERM_MAX_DAYS) {
    return { pct: SURCHARGE_NEAR_TERM, label: "Near-term booking" };
  }
  return { pct: 0 };
}

export const RANGE_SPREAD = 0.08; // +/- 8% around the central estimate

// International distance beyond which we recommend a bespoke quote.
export const INTERNATIONAL_CUSTOM_QUOTE_MILES = 1000;
