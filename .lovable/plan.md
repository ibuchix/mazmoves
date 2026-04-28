
# Plan: Fix Geocoding Pipeline (Customer-App / Shared Backend Scope)

## Scope clarification

This is the **customer app**. The company registration form lives in the
**company app** (separate repo) and the admin UI lives in the **admin
app** (separate repo). All three apps share the same Supabase project,
so edge functions, database tables, and PostGIS data are shared.

From here we'll fix everything that lives in the shared backend. Form
changes (company app) and admin UI buttons (admin app) are explicitly
out of scope.

## Root cause recap

`register-company-v2/company.ts` calls the `geocode-address` edge
function with the `business_address` **object** instead of a string. The
geocode function expects a string. Mapbox now correctly rejects this,
but 4 companies that registered earlier under the old OpenCage logic
still have wrong (Budapest centroid) coordinates.

## What we'll fix from this repo

### 1. Harden `register-company-v2` edge function

In `supabase/functions/register-company-v2/company.ts`, update the
`geocodeAddress(address)` helper to:

- Accept either a string or an address object.
- When given an object, build a comma-separated string:
  `"{street}, {city}, {state} {zipCode}, {country ?? 'United Kingdom'}"`.
- Pass that string to the `geocode-address` function.
- Throw a clear error (no fallback) if geocoding fails — registration
  fails loudly and the company app surfaces the error.

This means new registrations from the existing company app form (which
doesn't yet collect country) will geocode correctly by defaulting
country to "United Kingdom", matching the project's UK focus. If the
company app later adds a country field, it'll flow through automatically.

### 2. Verification guard in `verify-company`

Update `supabase/functions/verify-company/index.ts` to refuse
verification when the target company has NULL `latitude`, `longitude`,
or `location`. Return 400 with a clear message. This prevents bad/missing
coords from silently entering the matching pool.

### 3. Backfill the 4 stuck companies

One-off cleanup, run from this repo as a script step:

- Query `companies` for the rows sitting on the Budapest centroid
  (≈ `47.5033354, 19.0488299`).
- For each, build the proper UK address string from `business_address`
  and call the `geocode-address` edge function.
- Update `latitude`/`longitude` via a migration or scripted update
  (the existing trigger refreshes `location`).
- Verify each result lands in the correct UK city.

### 4. Smoke test the full pipeline

- Submit a customer move request with pickup or delivery within 25 mi
  of London (ABC) or Bedford (Buchi) — confirm a `move_assignments`
  row is created and shows on the company dashboard.
- Submit one outside both radii — confirm no false-positive assignment.

### 5. Update `.lovable/plan.md`

Reflect completion and list the deferred follow-ups for the other repos.

## Explicitly NOT in this plan

**Company app (separate repo):**
- Add a Country field to the registration form (default "United
  Kingdom").
- Validate postcode format on the form.
- Surface a clearer toast/error when geocoding fails.

**Admin app (separate repo):**
- "Re-geocode address" button on the company-detail view (will need a
  small admin-only edge function when built; we'll add that alongside
  the admin-app work, not now).

## Technical notes

- No schema changes — `companies.latitude/longitude` and the `location`
  trigger already exist.
- No new secrets — `MAPBOX_ACCESS_TOKEN` is already configured.
- Per project rules: no fallbacks on geocoding failure; the function
  throws and the caller surfaces the error.
- `geocode-address` itself is unchanged — it already works with a
  proper string input.

## Order of work

1. Update `register-company-v2/company.ts` (object → string conversion,
   default country = United Kingdom).
2. Add coord-presence guard to `verify-company`.
3. Backfill the 4 stuck companies and verify their new coords.
4. Smoke-test matching with a real move request.
5. Update `.lovable/plan.md`.
