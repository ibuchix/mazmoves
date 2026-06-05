// pricing-config.ts
// -------------------------------------------------------------
// Proprietary HouseMove move-cost estimation constants.
//
// Anchors were chosen to sit inside the typical UK removals market range
// reported by Compare My Move / reallymoving / AnyVan for 2025. The goal
// is an estimate that feels realistic to the customer and is unlikely to
// be drastically lower than what a vetted local mover will quote.
//
// All amounts are in GBP.
// -------------------------------------------------------------

export const BASE_BY_SIZE: Record<string, number> = {
  // Domestic
  "1": 280,
  "2": 380,
  "3": 520,
  "4": 700,
  "5+": 900,
  // Commercial
  office: 600,
  warehouse: 1200,
  retail: 700,
  // International falls back to bedroom keys + the international multiplier.
  business: 900,
};

export const TYPE_MULTIPLIER: Record<string, number> = {
  domestic: 1.0,
  commercial: 1.15,
  international: 2.2,
};

// Sanity bounds — prevent the formula from quoting absurd numbers.
export const MIN_BY_TYPE: Record<string, number> = {
  domestic: 220,
  commercial: 450,
  international: 900,
};
export const MAX_BY_TYPE: Record<string, number> = {
  domestic: 6500,
  commercial: 18000,
  international: 35000,
};

// Distance surcharges and weekend/short-notice modifiers.
export const SURCHARGE_SHORT_NOTICE = 0.15; // < 7 days out
export const SURCHARGE_WEEKEND = 0.10;       // Saturday or Sunday

export const RANGE_SPREAD = 0.10; // ±10% around the central estimate

// International distance beyond which we recommend a bespoke quote
// rather than the auto-estimate.
export const INTERNATIONAL_CUSTOM_QUOTE_MILES = 1000;

// Tiered per-mile cost. Earlier miles cost more per unit; the rate
// drops for long-distance moves where the per-mile cost in the
// market is lower.
export function distanceCostMiles(miles: number): number {
  if (miles <= 10) return miles * 8;
  if (miles <= 50) return 80 + (miles - 10) * 5;
  if (miles <= 150) return 80 + 200 + (miles - 50) * 3.5;
  return 80 + 200 + 350 + (miles - 150) * 2.5;
}
