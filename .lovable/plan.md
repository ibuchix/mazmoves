## Context

Your last test submission (Bedford → Croydon) confirmed the matching pipeline works end-to-end:
- Geocoding succeeded for both addresses
- The move request was saved with all four coordinates
- `notify-companies` matched **Buchi Ltd** (Bedford) and created a `move_assignments` row with `status='active'`

So the pipeline is alive. Two gaps remain.

## Problem 1 — Matching only searches the second location if the first finds nothing

Today, `notify-companies` and `process-matches` do this:

```text
1. Search companies within 25 mi of PICKUP
2. If 0 found → search within 25 mi of DELIVERY
3. Otherwise stop
```

That's why only Buchi (near Bedford pickup) matched and **ABC Moving (near Croydon delivery, ~13 mi) did not**. Your spec is "match companies within 25 mi of *either* pickup *or* delivery" — that's a UNION, not a fallback.

### Fix

Change both functions to always run both searches and de-duplicate by `company_id`.

**`supabase/functions/notify-companies/index.ts`**
- Call `findNearbyCompanies(supabase, request, false)` (pickup) AND `findNearbyCompanies(supabase, request, true)` (delivery), regardless of the pickup result.
- Merge the two assignment lists into a `Map<companyId, Assignment>` so a company near both endpoints isn't duplicated.
- Track per-company which side matched (for logging only): `"pickup" | "delivery" | "both"`.
- Insert one `move_assignments` row per unique company_id (existing logic).
- Return `companiesMatched: total, breakdown: { pickup: n, delivery: n, both: n }` for transparency.

**`supabase/functions/process-matches/index.ts`**
- Same change in the `matchOne` helper: run both `tryPoint(pickup)` and `tryPoint(delivery)`, union the resulting `companyIds`, dedupe.

No DB changes needed — the existing unique constraint pattern (one assignment per request+company) is already implicit in how rows are inserted.

## Problem 2 — Confirmation email returns 500

`send-confirmation-email` returns:
> `The mazmoves.com domain is not verified. Please, add and verify your domain on https://resend.com/domains`

This is **not a code issue** — the customer record was still saved and matching still ran (the email is non-blocking). To fix, the `mazmoves.com` domain must be verified at resend.com (DNS records added). That's an account-level action you do in the Resend dashboard, not something I can fix in code. I'll flag this clearly in chat after implementation; no changes to the email function itself.

## Out of scope (deferred to other repos)

- Verifying the 4 backfilled companies (Phantom / JOHN / KRIS / buch) — that's an admin-app action. They'll start receiving matches automatically the moment an admin flips `is_verified = true` for them.
- Adding a Country field to company registration (company app).

## Files to edit

- `supabase/functions/notify-companies/index.ts` — replace pickup-then-fallback with pickup-AND-delivery union + dedupe.
- `supabase/functions/notify-companies/company-finder.ts` — minor: keep the helper as-is, just call it twice from `index.ts`.
- `supabase/functions/process-matches/index.ts` — same union-and-dedupe change inside `matchOne`.

## Verification after implementation

1. Submit a fresh move request whose pickup is in Bedford and delivery is in London.
2. Expect **both** Buchi Ltd (Bedford, near pickup) **and** ABC Moving (London, near delivery) to receive `move_assignments` rows.
3. Confirm `notify-companies` response shows `companiesMatched: 2`.
