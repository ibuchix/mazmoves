## Why matching still isn't producing assignments

Even though both ABC Moving Solutions LTD and Buchi Ltd are now verified + active, no jobs are landing on their dashboards. From the live database and edge function logs:

1. **Geocoding is silently failing on every submission.** The `geocode-address` edge function expects an `OPENCAGE_API_KEY` secret. That secret is not configured, so every call throws and returns 500. The submission hook treats geocoding failure as non-blocking, so requests are saved with `pickup_latitude`, `pickup_longitude`, `delivery_latitude`, `delivery_longitude` all NULL.
2. **No coordinates → no PostGIS points → nothing for the matching RPC to query.** The most recent move request shows exactly this: NULL lat/lng on both ends, both geometry columns empty, status = `no_companies_found`.
3. **The verified companies share the Budapest centroid** (`47.5033354, 19.0488299`) — same root cause from registration time. They need to be re-geocoded with their real addresses.
4. **The 5-minute backstop cron is broken.** Job 13 calls `process-matches` with `Authorization: Bearer ' || current_setting('app.settings.service_role_key')`, but that GUC is unset, so the header is `Bearer ` and the function rejects it.

## What we'll do — switch to Mapbox + repair data + fix cron

You've created a Mapbox account, so we'll use the Mapbox Geocoding API instead of OpenCage. Mapbox is reliable, globally capable, and has a generous free tier (100,000 requests/month).

### 1. Replace OpenCage with Mapbox Geocoding

The OpenCage footprint is small — only one edge function, one CSP entry, and an unused npm package.

Files to change:
- **`supabase/functions/geocode-address/index.ts`** — rewrite to call Mapbox's geocoding endpoint:
  - Endpoint: `https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json?access_token={MAPBOX_ACCESS_TOKEN}&limit=1`
  - Read coordinates from `features[0].center` (returns `[longitude, latitude]`)
  - Read `MAPBOX_ACCESS_TOKEN` from `Deno.env.get('MAPBOX_ACCESS_TOKEN')`
  - Keep the same response shape (`{ latitude, longitude }`) so no caller needs changes
  - Keep current CORS, error handling, and 500 on failure (no fallbacks per project rules)
- **`index.html`** — update the CSP `connect-src` to swap `https://api.opencagedata.com` for `https://api.mapbox.com`. (The edge function calls Mapbox from the server, but updating CSP keeps it consistent and future-proof.)
- **`package.json`** + lockfiles — remove the unused `opencage-api-client` dependency (nothing in `src/` imports it).
- All other code paths (`src/hooks/move-request/use-geocoding.ts`, `src/hooks/use-submit-move-request.tsx`, `src/utils/address.ts`, `src/utils/geocoding.ts`, `supabase/functions/register-company-v2/company.ts`) call `geocode-address` via `supabase.functions.invoke` and consume `{ latitude, longitude }` — no changes needed.

### 2. Add the Mapbox access token as a secret

Add `MAPBOX_ACCESS_TOKEN` as an edge-function secret. We'll prompt you for it at implementation time. You can find it in your Mapbox account dashboard under **Tokens** — the default public token (starts with `pk.`) works for geocoding.

### 3. Re-geocode the two verified companies

Run a one-off admin script that re-fetches accurate coordinates for ABC Moving Solutions LTD and Buchi Ltd from their registered business addresses (via the now-working `geocode-address` function), and updates `companies.latitude` / `companies.longitude`. The existing trigger on `companies` will refresh `companies.location` automatically.

### 4. Fix the matching cron job

Replace the broken cron command with one that uses the project's anon key inlined in the SQL (it's a public key), so `process-matches` actually runs every 5 minutes as the safety net. The function will keep authenticating to Supabase via its own `SUPABASE_SERVICE_ROLE_KEY` env var as it already does.

### 5. End-to-end verification

After the fixes:
- Submit a real move request through the form whose pickup or delivery falls within 25 mi of either company.
- Confirm the request row has populated lat/lng + geometry columns.
- Confirm a `move_assignments` row was inserted for the matching company.
- Confirm the job appears on that company's dashboard.
- Manually invoke `process-matches` once to confirm the cron path works too.

## Out of scope (already deferred)

- Customer confirmation email and the company "new job available" email — both still parked under the email follow-up task.
- Broader audit/cleanup of the 4 unverified companies' coordinates.

## Technical notes

- `geocode-address` keeps its public contract (`{ address: string } → { latitude, longitude }`) so no frontend or other edge-function changes are needed.
- Mapbox returns coordinates as `[lng, lat]` in the `center` field — we map them to `{ latitude, longitude }` before responding.
- We won't change the matching radius (25 mi) or the pickup-then-delivery fallback logic.
- For the cron fix, the anon key is inlined in the cron SQL (it's a public key); the edge function authenticates via its own service-role env var.
- Per project rules, no fallbacks — if Mapbox fails, the function returns 500 and the request is saved without coordinates for the backstop cron to retry.
