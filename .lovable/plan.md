# Plan: Trust badge + town page polish & content fusion

## 1. SSL trust badge under "Get Free Quotes"

**File:** `src/components/home/hero/HeroForm.tsx` (and reuse on town pages — `HeroForm` is already shared via `TownHero`, so one edit covers both).

Add a subtle row directly under the button:

```
[lock icon]  Your information is protected by 128-bit SSL encryption.
```

Styling: `flex items-center justify-center gap-2 mt-3 text-xs text-gray-500`, `Lock` icon from `lucide-react` at `w-3.5 h-3.5`. No background pill, no border — quiet and trustworthy. Matches existing brand tone.

## 2. Town page design polish (all 34 pages)

Goal: same content, same brand colours/fonts, but tighter rhythm, better alignment, more "finished" feel. Add a light motion layer.

### New dependency
- `framer-motion` (already widely used pattern; small, well-supported).

### Shared polish — `src/components/locations/*`
- **Consistent section wrapper:** introduce `src/components/locations/Section.tsx` — standardises `py-16 md:py-20`, `max-w-5xl mx-auto px-4 sm:px-6 lg:px-8`, optional `tone="default" | "muted"` (white vs `bg-gray-50/50`). Replace ad-hoc section wrappers in `PriceExplainer`, `CommonRoutes`, `TrustPoints`, `TownFaq`, `NearbyTowns`, `VariantBlocks`, and the intro block in `TownRemovals.tsx`.
- **SectionHeading component:** small eyebrow label (brand-green uppercase tracking-wide) + h2 + optional lede. Used across every section for visual rhythm.
- **Motion:** wrap each section in a `MotionSection` that does a `whileInView` fade + 8px rise, `viewport={{ once: true, margin: "-80px" }}`. Subtle, not flashy.
- **Cards & dividers:** upgrade `CommonRoutes` table with zebra rows, sticky-style header, rounded-2xl border, hover row tint. `PriceExplainer` worked-example card gets a softer shadow and a small `PoundSterling` icon.
- **TrustPoints:** convert from plain list to 2-col grid of icon + text tiles (`ShieldCheck`, `BadgeCheck`, `Truck`, `HeartHandshake`) — keeps copy unchanged but reads more polished.
- **TownFaq:** ensure single-column max-w-3xl, larger trigger padding, brand-slate triggers, gray-700 body, divider between items.
- **NearbyTowns:** uniform card grid, `ArrowRight` on hover, equal heights.
- **Breadcrumbs:** lift to `text-gray-500`, brand-slate hover, slightly more breathing room.
- **Intro paragraph:** wrap in `Section`, add subtle left brand-green accent bar to signal start of body content.

No colour or font changes — strictly slate / green / orange tokens and Montserrat/Roboto already in use.

## 3. Fuse the Removals Price Guide content (Hybrid)

### New shared section component
`src/components/locations/WhatAffectsYourQuote.tsx` — added to every town page between `PriceExplainer` and `CommonRoutes`.

Four compact tiles distilled from the write-up:
1. **BAR-approved vs Man & Van** — short paragraph explaining the difference and that all our movers carry proper insurance.
2. **Fixed price vs hourly** — when each makes sense.
3. **Free pre-move survey** — why to request one, what to flag (tight access, fragile items).
4. **Packing options** — full pack, fragile-only, self-pack; impact on cost.

Copy is shared across towns, with `{townName}` interpolated in the intro line ("Five things shape your quote in {townName}…") and in tile 3's example ("flag tight parking around {townName} town centre or stairs in older {areaHint} properties").

### Expand existing per-town content (1-2 bespoke lines each)

In `src/data/locations.ts` add two new optional fields per `Location`:

- `accessNote?: string` — one sentence about local access realities (e.g. "Loading bays around CMK shopping centre fill fast on weekends — most MK movers prefer a 7-9am start").
- `surveyTip?: string` — one sentence tying the survey advice to the town (e.g. "Many Cambridge college-area moves involve narrow staircases and permit-only streets; a free survey avoids day-of surprises.").

These are surfaced inside `WhatAffectsYourQuote` (survey tile) and `PriceExplainer` (appended as a final sentence) so each page reads distinctly.

### Expand FAQs (shared scaffold)
Append 2 new FAQ entries to every town via a `sharedFaqs(townName)` helper merged into the existing `faqs` array at render time in `TownFaq`:
- "Are HouseMove's {townName} movers insured?" — public liability + goods-in-transit.
- "Should I get a fixed price or hourly quote?" — short guidance from the write-up.

Existing town-specific FAQs stay untouched and render first.

### TrustPoints addition
Add one shared trust line: "All movers carry public liability and goods-in-transit insurance" — already partially present in `baseTrust`, keep but ensure it renders as its own iconified tile.

## 4. Out of scope
- No colour palette changes.
- No font changes.
- No copy rewrites of existing intros, worked examples, or town FAQs (only additions).
- No changes to routing, SEO meta, JSON-LD, or backend.

## Technical notes
- New files: `src/components/locations/Section.tsx`, `SectionHeading.tsx`, `MotionSection.tsx`, `WhatAffectsYourQuote.tsx`.
- Edited: `HeroForm.tsx`, `TownRemovals.tsx`, `PriceExplainer.tsx`, `CommonRoutes.tsx`, `TrustPoints.tsx`, `TownFaq.tsx`, `NearbyTowns.tsx`, `VariantBlocks.tsx`, `src/data/locations.ts` (additive fields + 2 bespoke lines per town, ~68 short sentences total).
- Install: `framer-motion`.
- Verification: visit `/` (check badge), `/removals/milton-keynes`, `/removals/cambridge`, and 2 more towns in preview to confirm rhythm, motion, and per-town variance.
