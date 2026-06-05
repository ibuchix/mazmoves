# Move Calculator — Dedicated Page

A new `/move-calculator` page that mirrors the multi-step "Start Your Move" experience, but ends in a transparent low–high price estimate. Clicking **Book this move** carries the captured details into the existing move request flow and writes them — plus the estimate — into `move_requests`, where they continue through the normal matching pipeline.

---

## 1. Page & UX

**Route:** `/move-calculator` (added to `src/config/routes.tsx`, linked from navbar, hero secondary CTA, and Removals/town page CTAs).

**Hero:** Same slate rounded-rectangle treatment as Home/Removals/Town pages for consistency. Title: *"Estimate your move in 60 seconds — free, no signup."* Trust strip below (SSL badge, no spam, instant result).

**Wizard steps** (reuses styling of `MoveRequestFormContent`):
1. Move type (domestic / commercial / international)
2. Property size
3. Pickup address (with Mapbox geocode)
4. Delivery address (with Mapbox geocode)
5. Move date

After step 5 the user clicks **Calculate my estimate** → a loading state ("Crunching distance, date and demand…") → an **EstimateResult** panel.

**EstimateResult panel** (low–high range + breakdown):
- Large headline: `£480 – £580` with "Estimated total" label.
- Expandable breakdown: Base (property size), Distance (X miles × rate), Surcharges applied (badges: "Weekend +10%", "Short notice +15%"), and a "Why a range?" tooltip.
- Reassurance microcopy: *"Final price confirmed by your matched mover. This estimate reflects typical UK market rates."*
- Primary CTA: **Book this move at this estimate** → opens a compact contact step (name, email, phone, optional notes) → submits as a normal `move_request` with the estimate attached.
- Secondary: **Recalculate** (re-opens wizard pre-filled).

Section below the result on the page: 3 trust cards ("How we calculate", "Why estimates can vary", "What happens next"), and an FAQ accordion (5 items reusing `TownFaq` patterns where sensible).

---

## 2. Pricing algorithm (proprietary, edge-function gated)

All math runs server-side in a new edge function `calculate-move-estimate` so the formula and constants are never exposed to the browser. The frontend only sends inputs and receives `{ low, high, breakdown, estimateToken }`.

**Inputs:** moveType, propertySize, pickupCoords, deliveryCoords, moveDate.

**Formula (v1, all constants in one config block, easy to tune):**

```text
distanceMiles = haversine(pickup, delivery)   // already geocoded client-side via Mapbox

// 1. Base by property size (anchored to UK market reference points)
base = BASE_BY_SIZE[propertySize]              // e.g. 1-bed 280, 2-bed 380, 3-bed 520, 4-bed 700, 5+ 900,
                                                // office 600, warehouse 1200, retail 700

// 2. Distance, tiered (diminishing rate per mile as distance grows)
if distance <= 10:      distanceCost = distance * 8
elif distance <= 50:    distanceCost = 80 + (distance-10) * 5
elif distance <= 150:   distanceCost = 80 + 200 + (distance-50) * 3.5
else:                   distanceCost = 80 + 200 + 350 + (distance-150) * 2.5

// 3. Move-type multiplier
typeMult = { domestic: 1.0, commercial: 1.15, international: 2.2 }

subtotal = (base + distanceCost) * typeMult

// 4. Surcharges (additive multipliers)
surcharge = 0
daysUntil = days_between(today, moveDate)
if daysUntil < 7:                     surcharge += 0.15   // short notice
if moveDate.weekday in (Sat, Sun):    surcharge += 0.10   // weekend

total = subtotal * (1 + surcharge)

// 5. Sanity clamp so we never quote absurd numbers
total = clamp(total, MIN_BY_TYPE[moveType], MAX_BY_TYPE[moveType])

// 6. Range — ±10% around total, rounded to nearest £10
low  = round10(total * 0.90)
high = round10(total * 1.10)
```

**International** uses the same shape but with a higher base table and a flag in the response (`requiresCustomQuote: true` when distance > 1000mi) that swaps the CTA to "Request a custom international quote".

Constants live in `supabase/functions/calculate-move-estimate/pricing-config.ts` so they can be tuned without touching logic. A short doc comment explains the reasoning behind each anchor so future-you can re-calibrate against real company data once we have a sample of accepted moves.

**Accuracy guardrails:**
- Server recomputes distance with haversine from coords sent by client (we do NOT trust a client-supplied distance).
- Coords are validated (lat/lng bounds, both addresses present, same planet).
- Date validated (not in past, not >365 days out).
- MIN/MAX clamp prevents formula extremes.

---

## 3. Security: estimate token (anti-tampering)

To prevent the user from editing the estimate in DevTools before submitting, the edge function returns a signed token:

```ts
estimateToken = base64( HMAC_SHA256(SECRET, JSON.stringify({
  low, high, moveType, propertySize,
  pickupCoords, deliveryCoords, moveDate,
  issuedAt
})))
```

When the user clicks **Book this move**, the frontend posts to the existing-pattern `submit-move-request` edge function with the token + the original estimate payload + contact fields. `submit-move-request`:
1. Verifies HMAC and `issuedAt` (<30 min old).
2. Re-runs the calculation server-side and confirms low/high match.
3. Inserts the move request with `estimated_price_low`, `estimated_price_high`, and `source = 'calculator'`.

Secret: `MOVE_ESTIMATE_SIGNING_SECRET` (added via secrets tool, never exposed to client).

---

## 4. Database changes

One migration adds optional estimate columns to `move_requests` (nullable — typed move requests from the existing form remain unaffected):

```sql
ALTER TABLE public.move_requests
  ADD COLUMN estimated_price_low  numeric(10,2),
  ADD COLUMN estimated_price_high numeric(10,2),
  ADD COLUMN estimate_distance_miles numeric(8,2),
  ADD COLUMN estimate_issued_at timestamptz;
```

`source` already exists and currently defaults to `'web'`; calculator submissions set `source = 'calculator'`. No new table needed. No RLS changes (existing policies cover the new columns automatically).

Admin views that list move requests will show the estimate when present, otherwise show "—".

---

## 5. Edge functions

**New:** `supabase/functions/calculate-move-estimate/`
- `index.ts` — origin check, zod-validated input, runs formula, returns `{ low, high, breakdown, estimateToken, requiresCustomQuote }`.
- `pricing-config.ts` — tunable constants.
- `signing.ts` — HMAC helpers (Deno `crypto.subtle`).

**Updated:** `supabase/functions/submit-move-request/`
- Accepts optional `estimate` block with token.
- Verifies token + recomputes; persists `estimated_price_*` columns when valid.
- Existing non-calculator flow is unchanged (no estimate fields → behaves as today).

**Secret to add:** `MOVE_ESTIMATE_SIGNING_SECRET` (random 32-byte hex, generated by us and added via the secrets tool before deploy).

---

## 6. Files to create / edit

**New:**
- `src/pages/MoveCalculator.tsx` — page shell, SEO head, hero, wizard, result panel, trust + FAQ sections.
- `src/components/move-calculator/CalculatorWizard.tsx` — reuses MoveType/PropertySize/Address step components.
- `src/components/move-calculator/EstimateResult.tsx` — range, breakdown, book CTA.
- `src/components/move-calculator/BookEstimateDialog.tsx` — contact step (name/email/phone/notes) → submit.
- `src/hooks/use-calculate-estimate.ts` — calls `calculate-move-estimate` edge function.
- `src/hooks/use-book-estimate.ts` — wraps existing submit flow with estimate payload.
- `supabase/functions/calculate-move-estimate/{index.ts, pricing-config.ts, signing.ts}`
- One migration for the four nullable columns.

**Edited:**
- `src/config/routes.tsx` — register `/move-calculator`.
- `src/components/layout/Navbar.tsx` — add "Move Calculator" link.
- `src/components/home/hero/HeroContent.tsx` — secondary CTA "Estimate your move".
- `src/pages/Removals.tsx` + `src/pages/TownRemovals.tsx` — calculator CTA card.
- `supabase/functions/submit-move-request/{index.ts, validation.ts}` — accept + verify estimate.
- `src/integrations/supabase/types.ts` regenerates automatically after migration.

---

## 7. What I will NOT change

- Existing "Start Your Move" wizard, `useMoveRequestForm`, or any current submit/matching/notify pipeline.
- Pricing for any submission that doesn't come through the calculator (estimate columns stay null).
- Design tokens, colors, or fonts — calculator inherits the established brand system.

---

## Open question I'll resolve during build

Initial constants in `pricing-config.ts` will be seeded from public UK removals price benchmarks (Compare My Move, reallymoving, AnyVan averages for 2025). I'll add a comment block citing the reference ranges so you can spot-check and tune. Once we have ~20 real accepted moves through the system we can recalibrate against actuals.
