// Centralised brand colour tokens for the customer app.
// Single source of truth — import from here OR use the matching Tailwind tokens
// defined in tailwind.config.ts (brand.slate, brand.slateLight, brand.green, brand.orange).
// NOTE: Blue has been retired in favour of slate grey across the app.

export const BRAND_COLORS = {
  // Primary brand colour (replaces the old navy blue #334155)
  slate: "#334155",       // slate-700
  // Secondary slate (replaces the old royal blue #475569) — used for hovers, gradients, secondary accents
  slateLight: "#475569",  // slate-600
  // Accent green — success states, highlights, star ratings
  green: "#84d21f",
  // Accent orange — alerts, secondary CTAs
  orange: "#d2491f",
} as const;

export type BrandColor = keyof typeof BRAND_COLORS;
