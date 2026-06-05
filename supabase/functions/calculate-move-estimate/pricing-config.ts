// pricing-config.ts
// -------------------------------------------------------------
// Proprietary HouseMove move-cost estimation constants.
//
// Anchors sit inside the typical UK removals market range
// (Compare My Move / reallymoving / AnyVan 2025). The goal is an
// estimate that feels realistic and is unlikely to be drastically
// lower than what a vetted local mover will quote.
//
// Changes in this revision:
//   - Commercial pricing is now a two-dimensional table
//     (premises type x scale) instead of a single per-type value.
//   - Enterprise commercial moves always require a bespoke quote.
//   - Short-notice surcharge window dropped from 7 days to 2 days.
//   - Weekend surcharge dropped from 10% to 5%.
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
  // International business uses the same per-room scale plus the
  // international multiplier; "business" is the catch-all key.
  business: 900,
};

export type CommercialPremises = "office" | "retail" | "warehouse" | "industrial" | "other";
export type CommercialScale = "small" | "medium" | "large" | "enterprise";

// Commercial base price by premises type and move scale.
// "custom" forces a bespoke-quote response (no auto price returned).
export const COMMERCIAL_BASE: Record<
  CommercialPremises,
  Record<CommercialScale, number | "custom">
> = {
  office:     { small: 650, medium: 1400, large: 3200, enterprise: "custom" },
  retail:     { small: 700, medium: 1500, large: 3400, enterprise: "custom" },
  warehouse:  { small: 900, medium: 2200, large: 5200, enterprise: "custom" },
  industrial: { small: 950, medium: 2400, large: 5600, enterprise: "custom" },
  other:      { small: 700, medium: 1600, large: 3600, enterprise: "custom" },
};

export const TYPE_MULTIPLIER: Record<string, number> = {
  domestic: 1.0,
  commercial: 1.15,
  international: 2.2,
};

// Sanity bounds, prevent the formula from quoting absurd numbers.
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

// Surcharge windows and modifiers.
export const SURCHARGE_SHORT_NOTICE_DAYS = 2;  // < 2 days out triggers the premium
export const SURCHARGE_SHORT_NOTICE = 0.15;    // 15%
export const SURCHARGE_WEEKEND = 0.05;         // 5% on Saturday / Sunday

export const RANGE_SPREAD = 0.10; // +/- 10% around the central estimate

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
