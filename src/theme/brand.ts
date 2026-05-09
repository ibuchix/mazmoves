// Centralised brand colour tokens for the customer app.
// Single source of truth for hex values. Mirrored as Tailwind tokens
// (brand.slate, brand.slateLight, brand.slateMuted, brand.slateSoft, brand.green, brand.orange)
// in tailwind.config.ts and as CSS variables in index.css (--brand-*).
// NOTE: Blue has been retired in favour of slate grey across the app.

export const BRAND_COLORS = {
  slate: "#334155",       // primary text/CTA (slate-700)
  slateLight: "#475569",  // hovers, gradients, secondary accents (slate-600)
  slateMuted: "#64748b",  // muted body copy (slate-500)
  slateSoft: "#94a3b8",   // soft dividers / faint gradients (slate-400)
  green: "#84d21f",       // success, highlights, ratings
  orange: "#d2491f",      // alerts, secondary CTAs
} as const;

export type BrandColor = keyof typeof BRAND_COLORS;
