# Plan: Job Matching Pipeline — Implemented

The matching pipeline is now wired end-to-end. Submissions get geocoded,
written to `move_requests` with coordinates, converted to PostGIS geometry
by a trigger, and matched against verified+active companies — producing
`move_assignments` rows that surface as jobs on the company dashboard.

## What was changed

**Database (migration applied)**
- `find_companies_within_radius(point geometry, radius_miles float)` RPC
  added — returns verified, active companies within the radius, ordered
  by distance.
- `update_move_request_location` trigger added on `move_requests` — fills
  `pickup_location` / `delivery_location` (SRID 4326) whenever lat/lng are
  inserted or updated.
- Backfill ran for any existing rows that had lat/lng but missing geometry.
- A `process-matches-every-5-min` cron job (pg_cron + pg_net) is scheduled
  as the matching backstop.

**Edge functions (deployed)**
- `notify-companies` rewritten: correct helper signature, real schema
  columns only, fallback from pickup → delivery, status updated to
  `assigned` or `no_companies_found`. Email send removed (deferred).
- `process-matches` rewritten: same matching + fallback + status logic,
  per-row updates, no cross-folder imports.
- `notify-companies/company-finder.ts` rewritten to call the RPC and
  hydrate companies in one batch query.

**Client**
- `src/hooks/use-submit-move-request.tsx` now: (1) geocodes pickup +
  delivery via `geocode-address` (driving the existing spinner flags),
  (2) inserts with lat/lng, (3) fire-and-forget invokes
  `notify-companies`. Geocoding/matching failures are non-blocking — the
  backstop cron will retry.

## Verified

- Trigger sanity check (insert with lat/lng → both geometry columns
  populated) passed inside the migration.
- `notify-companies` invoked against an existing pending request returned
  200 with `success: true, companiesMatched: 0, status: "no_companies_found"`,
  and the row's `status` column was updated correctly.
- Cron job 13 (`process-matches-every-5-min`) is active.

## Why companies are not matching today

There are 6 companies in the DB, but **0 are `is_verified = true AND is_active = true`**,
so the matching RPC correctly returns zero results. As soon as a company
is verified through the existing admin flow, future requests in their
25-mile service area will automatically generate assignments and appear
on their dashboard.

A separate concern flagged for follow-up: every existing company shares
the same coordinates (`47.5033354, 19.0488299` — Budapest centroid),
which suggests the registration-time geocoding fell back to a default.
Worth auditing before going live.

## Deferred to a separate task

- Customer confirmation email (Resend domain re-verification).
- Company "new job available" email — `notify-companies` will get the
  email step added back once the email infrastructure is fixed.
- Company-coordinates audit.
