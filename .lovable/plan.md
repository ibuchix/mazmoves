# Mobile Hero Optimisation

## Problem (visible in screenshot)

On phones, the town hero (and homepage hero share the same pattern) looks broken in three ways:

1. **Headline overflows** — `text-4xl` ("House Removals in Colchester") is too wide for small screens; "Colchester" gets clipped on the right.
2. **Form card appears to "float" outside the slate panel** — the white form card uses the same horizontal space as the slate background (both are inset by the same `px-4`), so on narrow viewports the form looks edge-to-edge against the slate with no visual padding.
3. **Slate background ends before the content** — `bottom-16` on mobile is too short for the stacked (form-on-top, content-below) mobile layout; the headline/bullets visibly sit on the page background instead of the slate.

These affect both `HeroSection.tsx` (homepage) and `TownHero.tsx` (all 34 `/removals/:slug` pages), which share the exact same wrapper structure.

## Fix scope

**Only mobile breakpoints change.** All `md:` and `lg:` rules stay byte-identical, so desktop/tablet remain untouched.

### 1. `src/components/locations/TownHero.tsx`
- Headline: `text-4xl md:text-5xl` → `text-3xl sm:text-4xl md:text-5xl` and add `break-words` so long town names wrap cleanly.
- Section bottom inset: `bottom-16 md:bottom-24` → `bottom-8 md:bottom-24` so the slate fully contains the stacked mobile content.
- Inner content `py-12 md:py-20` → `py-8 md:py-20` to tighten mobile spacing.
- Add `px-2` (extra inner padding) inside the slate at mobile only so the form has visible breathing room against the slate edges.

### 2. `src/components/home/hero/HeroSection.tsx`
Same three mobile-only tweaks as above (bottom inset, py, inner padding). Headline lives in `HeroContent.tsx` and is already `text-2xl md:text-3xl lg:text-4xl`, so no change needed there.

### 3. `src/components/home/hero/HeroForm.tsx`
- Heading `text-2xl md:text-3xl` is fine; reduce form card padding on mobile from `p-6` to `p-5` to give the slate more visible margin around the card.

### 4. Quick audit pass
Spot-check the sections that render below the hero on town pages (`PriceExplainer`, `CommonRoutes`, `VariantSections`, `TrustPoints`, `TownFaq`, `NearbyTowns`) and the homepage (`HowItWorksSection`, `ServicesSection`, `TestimonialsSection`) for any obvious mobile overflow. **No design changes** — only fix actual overflow/clipping bugs if found, per the "do not change design unless instructed" project rule.

## Verification

Resize preview to 375px (iPhone SE), 390px (iPhone 14), and 414px (iPhone Plus):
- Homepage `/`
- `/removals/colchester` (the page in the screenshot)
- One other town page to confirm the shared component is fixed everywhere

Then check 768px (iPad) and 1280px (desktop) to confirm nothing regressed.

## What is NOT changing

- No design system colours, fonts, spacing tokens, or component restructures.
- No changes to desktop or tablet layouts.
- No changes to forms, tracking, routes, or business logic.
