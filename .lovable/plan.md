# Plan: Job Matching Pipeline — Mapbox switch + cron fix

## Status: ✅ Implemented and verified

The matching pipeline is fully wired. Geocoding now uses Mapbox, the two
verified companies have real coordinates, and the 5-minute backstop cron
authenticates correctly.

## What changed in this round

**Geocoding provider: OpenCage → Mapbox**
- `supabase/functions/geocode-address/index.ts` rewritten to call
  `https://api.mapbox.com/geocoding/v5/mapbox.places/{q}.json` and read
  `[lng, lat]` from `features[0].center`. Public contract unchanged
  (`{ address } → { latitude, longitude }`), so no callers needed updates.
- `MAPBOX_ACCESS_TOKEN` added as edge function secret.
- `index.html` CSP `connect-src` updated: `api.opencagedata.com` →
  `api.mapbox.com`.
- `opencage-api-client` npm dependency removed (was unused).

**Verified company coordinates fixed**
- ABC Moving Solutions LTD: `(51.619113, -0.15692)` — London EC1V.
- Buchi Ltd: `(52.16608, -0.54807)` — Bedford MK43.
- The existing trigger on `companies` filled their `location` PostGIS
  column automatically.

**Matching cron fixed**
- Old job 13 (broken — used unset `app.settings.service_role_key`)
  unscheduled.
- New job 14 (`process-matches-every-5-min`) inlines the public anon key
  in the Authorization header. The edge function still uses its own
  `SUPABASE_SERVICE_ROLE_KEY` for elevated DB access internally.

## Verified

- `geocode-address` returns 200 with valid coords for sample UK addresses.
- Both verified companies now have non-default lat/lng and populated
  `location` geometry.
- `process-matches` invocation returns 200 with the expected
  scanned/assigned/unmatched counters.
- New cron job is active on the `*/5 * * * *` schedule.

## Deferred (unchanged from previous round)

- Customer confirmation email + company "new job available" email — both
  parked under the email follow-up task.
- Coordinate audit for the 4 unverified companies still pointing at the
  Budapest centroid.

## Next live test

Submit a real move request through the form whose pickup or delivery is
within 25 miles of London EC1V (ABC) or Bedford MK43 (Buchi). The request
should:
1. Get populated `pickup_*`/`delivery_*` lat/lng + geometry on insert.
2. Generate a `move_assignments` row for the matched company.
3. Surface as a job on that company's dashboard.
