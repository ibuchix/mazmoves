## Goal

Launch 34 location landing pages plus a `/removals` hub to capture local "removals in [town]" / "man and van [town]" search demand — built deep enough to avoid Google's doorway/thin-content classification.

## Towns (34)

Milton Keynes, Peterborough, Cambridge, St Neots, Wisbech, Huntingdon, Ely, St Ives, **Norwich** (replacing "Norfolk"), Great Yarmouth, King's Lynn, Thetford, Wymondham, Dereham, Attleborough, Ipswich, Lowestoft, Bury St Edmunds, Haverhill, **Felixstowe** (corrected spelling), Newmarket, Stowmarket, Southend-on-Sea, Colchester, Chelmsford, Basildon, Harlow, Braintree, Brentwood, Luton, Bedford, Dunstable, Ampthill, Leighton Buzzard.

> Confirm the two corrections (Norfolk → Norwich, Felixtowe → Felixstowe) before build, or tell me to keep your spellings.

## URL & Routing

- `/removals` — hub page (grid of all 34 towns, grouped by county/region).
- `/removals/:slug` — per-town page (e.g. `/removals/milton-keynes`).
- Unknown slugs → redirect to `/removals`.
- Both routes lazy-loaded and added to `src/config/routes.tsx`.

## Per-Town Content Depth (~500 words each, not 300)

Every town record in `src/data/locations.ts` will carry:

1. **Intro paragraph (60-90 words)** — town-specific: population, county, what kind of moves dominate (commuter, student, family, retirement, coastal).
2. **Pricing explainer** — your exact framing: prices vary by size, item intricacy (e.g. piano example), mileage, access difficulty, day of week. Plus a *worked example* per town (e.g. "1-bed flat Bedford → London ≈ £470-£650; add a piano and it can jump £150-£250").
3. **Common routes (3-5 per town)** — realistic destinations from that town with indicative bands (e.g. Bedford → London, Bedford → Milton Keynes, Bedford → Cambridge).
4. **Local context block** — varies per town type (see "Section variation" below).
5. **Why use HouseMove from [town]** — 3-4 town-flavoured trust points.
6. **FAQs (4-6, unique per town)** — no shared question text across towns. Examples:
   - Luton: "Do you cover student moves around the University of Bedfordshire campus?"
   - Southend: "Can movers handle seafront access restrictions on Marine Parade?"
   - Cambridge: "Do movers know college access rules for student moves?"
   - Milton Keynes: "How do movers handle the grid road system for large vans?"
   - Peterborough: "Any specific access notes for the Cathedral Quarter?"
7. **Internal links** — 3-5 nearby towns linked at the bottom; hub page link.

## Section Variation Per Page (anti-duplicate signal)

Not every page renders the same blocks in the same order. The page template reads a `sections` array on each town record and renders accordingly. Variants:

- **Coastal towns** (Southend-on-Sea, Felixstowe, Great Yarmouth, Lowestoft) → "Coastal access & parking" block, "Moving inland from the coast" routes.
- **Commuter belt** (Luton, Bedford, MK, Brentwood, Basildon, Harlow, Chelmsford, Leighton Buzzard) → "Long-distance to London" block with M1/A1/A12 corridor pricing notes.
- **University towns** (Cambridge, Luton, Bedford, Colchester) → "Student & academic moves" block with term-time tips.
- **Market towns** (Bury St Edmunds, Newmarket, Stowmarket, Ely, St Ives, Ampthill, Wymondham, Dereham) → "Historic centre access" block (narrow streets, conservation areas).
- **Larger cities** (Peterborough, Norwich, Ipswich, Cambridge, MK) → "Cross-city moves & high-rise" block.
- **Fenland/rural** (Wisbech, Thetford, King's Lynn, Huntingdon, Attleborough, Haverhill) → "Rural & long driveway access" block.

A town can carry 2-3 variant blocks (e.g. Luton = commuter + student). This produces materially different page templates across the 34, not a single shared template with a town name swapped in.

## Hub Page (`/removals`)

- H1: "Removals across the East of England & Home Counties"
- Short intro (60-80 words) explaining the marketplace + free-to-mover model.
- Grid of 34 towns grouped by county (Bedfordshire, Cambridgeshire, Essex, Norfolk, Suffolk, Buckinghamshire).
- Each card: town name, county, 1-line summary, link.
- Hero form (same as homepage) at top.

## SEO Implementation (per page)

Via `SeoHead` / react-helmet-async on each town page:
- `<title>`: "House Removals in {Town} — Free Quotes from Verified Movers | HouseMove" (varied — some "Man and Van in {Town}" for towns where that intent dominates)
- `<meta description>`: town-specific, 140-160 chars, includes "free", "no obligation", local hook
- `<link rel="canonical">`: `https://housemove.co/removals/{slug}`
- OG/Twitter tags
- JSON-LD: `Service` + `LocalBusiness` (areaServed = town) + `FAQPage` (the unique FAQs) + `BreadcrumbList`

## Sitemap

`scripts/generate-sitemap.ts` (or static `public/sitemap.xml` — whichever is in use) extended with:
- `/removals` (priority 0.7, monthly)
- 34 `/removals/{slug}` entries (priority 0.7, monthly)
- Fix the existing malformed `<url>` block flagged earlier.

## Form Behaviour (no DB changes)

Form on town pages is **identical to the homepage** — same component, same submission, no town field added. Matching keeps using postcode/geocoding. The town context lives only in marketing copy, FAQs, and schema. Zero risk to the existing move-request flow.

## File Plan

**New:**
- `src/data/locations.ts` — 34 town records with all fields above
- `src/pages/Removals.tsx` — hub page
- `src/pages/TownRemovals.tsx` — dynamic town page
- `src/components/locations/TownHero.tsx`
- `src/components/locations/PriceExplainer.tsx`
- `src/components/locations/CommonRoutes.tsx`
- `src/components/locations/TownFaq.tsx`
- `src/components/locations/LocationsGrid.tsx`
- `src/components/locations/variants/CoastalBlock.tsx`
- `src/components/locations/variants/CommuterBlock.tsx`
- `src/components/locations/variants/StudentBlock.tsx`
- `src/components/locations/variants/HistoricCentreBlock.tsx`
- `src/components/locations/variants/RuralAccessBlock.tsx`
- `src/components/locations/variants/CityMoveBlock.tsx`

**Edited:**
- `src/config/routes.tsx` — add two lazy routes
- `src/components/layout/Footer.tsx` (or nav) — add link to `/removals`
- `public/sitemap.xml` or `scripts/generate-sitemap.ts` — add entries + fix malformed block

**Not touched:** move-request form/component, submission edge function, DB schema, matching logic, design tokens, admin side.

## Design

Reuses existing brand system only:
- Slate gradient hero inset (same as homepage)
- Montserrat headings (#040480 / #1f3dd2), Roboto body (#333333)
- Orange (#d2491f) primary CTAs, lime (#84d21f) success ticks
- Existing Card, Accordion, Button components — no new tokens, no design changes.

## What I will NOT do

- No DB schema changes, no town field on move requests
- No touching the move-request submission flow
- No new design tokens or colour additions
- No AI-generated filler copy — every town gets real local hooks (areas, roads, landmarks, common move types)

## Estimated certainty vs doorway-page risk

With 500-word town pages, varied section blocks, unique FAQs, real local route data, and tiered launch via sitemap: **~80-85%** these index and rank without doorway flags. The remaining risk is purely whether the local hooks ring true — which is fixable per-page after launch.

Approve and I'll build it.
