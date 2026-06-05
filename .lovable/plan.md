# Calculator: Commercial Rework, Surcharge Fixes & Copy Cleanup

The Mapbox driving-distance fix is already shipped. This plan picks up the remaining items from the earlier plan that did not get implemented.

## 1. Commercial move profile (replace single radio)

Today commercial is a single choice of `office | warehouse | retail` with one base price each. That can't tell the difference between a small shop and a 10,000 sq ft warehouse, which is why the 7-mile commercial move came back at £950.

Replace the single picker with **two questions** when `moveType === "commercial"`:

- **Premises type:** Office, Retail, Warehouse, Industrial / Storage, Other
- **Move scale:**
  - Small — up to ~5 staff / ~500 sq ft / van-load
  - Medium — ~6–20 staff / ~500–2,000 sq ft / Luton or 7.5t
  - Large — ~21–75 staff / ~2,000–8,000 sq ft / 18t or multi-vehicle
  - Enterprise — 75+ staff / 8,000+ sq ft / multi-day project

Server-side base pricing becomes a `COMMERCIAL_BASE[premisesType][scale]` table tuned to typical UK commercial removals (anchors below in Technical section). **Enterprise always returns `requiresCustomQuote: true`** with no auto price — the UI shows a "book to receive a bespoke quote" CTA instead of a range.

Domestic and international flows are unchanged.

## 2. Surcharge corrections

- Short-notice premium window: **< 2 days** out (was < 7). Value stays 15%.
- Weekend premium: **5%** (was 10%).

Surcharge labels in the breakdown update to match ("Short notice (under 2 days)", "Weekend move (5%)").

## 3. Em-dash sweep

Replace every `—` with a comma, period, or regular hyphen (`-`) across the calculator surface and the supporting edge function comments/strings the customer can see. Confirmed occurrences:

- `src/pages/MoveCalculator.tsx` (4 lines)
- `src/components/move-calculator/CalculatorWizard.tsx` (1 line)
- `src/components/move-calculator/BookEstimateDialog.tsx` (1 line)
- `supabase/functions/calculate-move-estimate/pricing-config.ts` (1 comment)
- `supabase/functions/submit-move-request/index.ts` (4 comments)

Code comments get the same treatment for consistency.

## 4. Out of scope

- No DB migration. The existing nullable estimate columns already cover the new shape; we only persist `low / high / distanceMiles` (plus `null` when bespoke).
- The legacy `estimated_value` column stays untouched — the calculator writes to `estimated_price_low/high` as it does now.
- Driving-distance / Mapbox work — already done.

---

## Technical section

### Files

- `supabase/functions/calculate-move-estimate/pricing-config.ts`
  - Remove `office | warehouse | retail | business` from `BASE_BY_SIZE`.
  - Add:
    ```ts
    export type CommercialPremises = "office" | "retail" | "warehouse" | "industrial" | "other";
    export type CommercialScale = "small" | "medium" | "large" | "enterprise";
    export const COMMERCIAL_BASE: Record<CommercialPremises, Record<CommercialScale, number | "custom">> = {
      office:     { small: 650,  medium: 1400, large: 3200, enterprise: "custom" },
      retail:     { small: 700,  medium: 1500, large: 3400, enterprise: "custom" },
      warehouse:  { small: 900,  medium: 2200, large: 5200, enterprise: "custom" },
      industrial: { small: 950,  medium: 2400, large: 5600, enterprise: "custom" },
      other:      { small: 700,  medium: 1600, large: 3600, enterprise: "custom" },
    };
    ```
  - `SURCHARGE_SHORT_NOTICE_DAYS = 2`, `SURCHARGE_WEEKEND = 0.05`.

- `supabase/functions/calculate-move-estimate/index.ts`
  - Input schema: when `moveType === "commercial"`, expect `commercialProfile: { premisesType, scale }` and ignore `propertySize`. Domestic/international keep `propertySize` as today.
  - Base lookup branches on move type. If commercial scale is `enterprise` (or COMMERCIAL_BASE lookup returns `"custom"`), short-circuit and return `requiresCustomQuote: true` with no price.
  - Replace short-notice check with `daysUntil < 2`.
  - Token payload includes `commercialProfile` (or `propertySize`) so verify can re-derive base.

- `supabase/functions/calculate-move-estimate/signing.ts` + `submit-move-request/estimate-verify.ts`
  - Extend the signed payload shape with optional `commercialProfile`. Verify recomputes base using the same branching logic.

- `supabase/functions/_shared/move-request-validation.ts`
  - Loosen / split: `propertySize` only required for domestic + international; commercial gets the new `commercialProfile` object validated with a zod discriminated union.

- `src/types/move-request.ts`
  - Add `CommercialPremises`, `CommercialScale`, `CommercialProfile` types. Keep existing `PropertySize` for domestic/international.

- `src/components/move-calculator/CalculatorWizard.tsx`
  - Step 2 becomes either the existing `PropertySizeStep` (domestic/international) or a new inline two-field `CommercialProfileStep` (premises + scale dropdowns/radio).
  - `canProceed(2)` checks the right field.
  - Payload sent to `use-calculate-estimate` and (later) `submit-move-request` includes whichever field is set.

- `src/hooks/use-calculate-estimate.ts`
  - Input type widened with optional `commercialProfile`. Pass through to the edge function.

- `src/components/move-calculator/EstimateResult.tsx`
  - When `requiresCustomQuote && !low`, render the bespoke-quote variant (already partly there) with copy: "We'll prepare a tailored quote for this move. Book now and a specialist will be in touch."

- `src/components/move-calculator/BookEstimateDialog.tsx`
  - When the estimate is bespoke (no price), submit still works; we send `null` for `estimated_price_low/high` and include the commercial profile in the move request payload.

### Validation checks after build

- 7-mile commercial Small Office now lands in a sane £650 + distance band, not £950.
- 7-mile commercial Large Warehouse lands in the multi-thousand range.
- Move date 5 days out: no short-notice surcharge. 1 day out: 15% applies.
- Saturday move: 5% surcharge, not 10%.
- Em-dash grep returns zero hits in the listed files.
