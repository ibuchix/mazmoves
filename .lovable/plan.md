# Plan: Geocoding Pipeline — Mapbox + Address Object Fix

## Status: ✅ Implemented (backend) — UI follow-ups deferred to other repos

This is the **customer app**. The shared Supabase backend has been fully
patched. Form / admin UI work belongs in the company app and admin app
repos respectively.

## What changed in this round

### 1. `register-company-v2/company.ts` — address handling
The internal `geocodeAddress()` helper now accepts either a string or an
address object. When given an object it builds a single comma-separated
string `"{street}, {city}, {state} {zipCode}, {country ?? 'United
Kingdom'}"` before calling `geocode-address`. No fallback on failure —
registration throws so the company app surfaces it.

### 2. `verify-company` — coordinate guard
Before flipping `is_verified = true`, the function now checks that the
target company has non-NULL `latitude`, `longitude`, and `location`.
Missing coords → 400 with a clear message instructing admin to re-geocode.

### 3. Backfill — 4 stuck companies fixed
The four companies sitting on the Budapest centroid
(`47.5033354, 19.0488299`) were re-geocoded via Mapbox and updated:

| Company        | Postcode | New coords              |
|----------------|----------|-------------------------|
| Phantom Moves  | MK40 2BJ | 52.13016, -0.33991      |
| JOHN LTD       | MK40 2BJ | 52.13016, -0.33991      |
| KRIS LTD       | MK43 7QG | 52.16608, -0.54807      |
| buch ltd       | MK43 7QG | 52.16608, -0.54807      |

PostGIS `location` was refreshed automatically by the existing trigger.

## Verified

- `geocode-address` returns clean Bedford coords for both postcodes.
- All 4 backfilled rows now show populated `location` geometry.
- Verified production companies (ABC, Buchi) remain untouched and active.

## Deferred to other repos

**Company app:**
- Add a Country field to the registration form (default United Kingdom).
- Validate UK postcode format on the form.
- Surface a clearer toast/error when geocoding fails server-side.

**Admin app:**
- "Re-geocode address" button on the company-detail view (will need a
  small admin-only edge function added when that work happens).

## Live test

Submit a customer move request whose pickup or delivery is within 25 mi
of any of London (ABC), Bedford (Buchi/KRIS/buch — note these 4 are still
unverified), and confirm assignments populate on the matched company's
dashboard.
