
# Job Matching System — Gap Analysis & Recovery Plan

## 1. How it was designed to work (intended flow)

```text
Customer submits form
        │
        ▼
Insert into move_requests
        │  (pickup_address, delivery_address as JSON only)
        ▼
Geocode each address (OpenCage via geocode-address edge fn)
        │  → fills pickup_latitude/longitude + delivery_latitude/longitude
        ▼
DB trigger converts lat/lng → pickup_location / delivery_location (PostGIS geometry)
        │
        ▼
notify-companies edge fn called with the new request id
        │  uses RPC find_companies_within_radius(point, 25 miles)
        ▼
Fallback: if no companies near pickup, retry with delivery point
        │
        ▼
Insert rows into move_assignments (one per matched company)
        │  → job appears in each matched company's dashboard
        ▼
[Email notifications — DEFERRED to a separate task]
```

Backstop: a `process-matches` edge fn was meant to sweep `pending` requests in batches of 50 and create assignments later (e.g. via cron).

## 2. What the code/DB actually shows today

I queried the live database and read every relevant file. The findings:

### a. Move requests are saved with NO coordinates
`src/hooks/use-submit-move-request.tsx` only inserts the JSON addresses. It never calls `geocode-address`, never sets `pickup_latitude/longitude`, and never invokes `notify-companies` afterwards.

DB confirms it — every row is empty:
```text
total = 2  |  missing_pickup_lat = 2  |  missing_pickup_loc = 2
```

### b. The matching RPC does not exist in the database
`supabase/functions/sql/find_companies_within_radius.sql` exists in the repo but was never applied. `pg_proc` shows only `update_company_location`. So even if coordinates were filled in, the RPC call inside `notify-companies` and `process-matches` would fail.

### c. No DB trigger to keep `*_location` (PostGIS) in sync with lat/lng on move_requests
`update_company_location` exists for `companies`, but there is no equivalent for `move_requests`. Even if we wrote lat/lng into the row, the geometry columns the RPC needs would stay null.

### d. `notify-companies` is never called and is internally broken
- Not invoked from the client after insert.
- `index.ts` calls `findNearbyCompanies(moveRequest.pickup_latitude, moveRequest.pickup_longitude)` — two scalar args — but the helper signature is `(supabase, request, useDeliveryLocation)`. Mismatch would throw at runtime.
- Inserts `notification_sent` and `status: 'pending'` columns into `move_assignments` that don't exist on the table (it has `status` of enum `assignment_status` defaulting to `'active'`, no `notification_sent` column).
- No fallback to delivery location (the helper supports it, the wrapper doesn't use it).
- Also calls `send-verification-email` per matched company — **out of scope here, deferred to the email task**.

### e. `process-matches` cron is not scheduled
`cron.job` shows backups, billing, dashboard refresh, registration cleanup — nothing that calls `process-matches` or `notify-companies`. The safety net is also off.

### f. Companies have suspicious shared coordinates
All companies show identical lat/lng `47.5033354, 19.0488299` (Budapest centroid). They likely fell back to a default geocode result during registration. Will produce wrong distances and should be flagged for a separate audit.

### g. Outcome
`move_assignments` has 0 rows total. Matching has never run successfully, so nothing has ever appeared on a company dashboard.

## 3. The gap, summarised

| Required | Present? | Notes |
|---|---|---|
| Client geocodes pickup & delivery on submit | No | Submit hook bypasses `geocode-address` entirely |
| `move_requests.pickup_latitude/longitude` populated | No | Always null |
| Trigger to derive `pickup_location`/`delivery_location` geometry | No | Only companies has one |
| `find_companies_within_radius` RPC deployed in DB | No | SQL file exists in repo but never applied |
| Client invokes `notify-companies` after insert | No | Never called |
| `notify-companies` wrapper passes correct args | No | Calls helper with wrong signature |
| `move_assignments` insert matches schema | No | Uses non-existent columns |
| Fallback to delivery location when pickup has no matches | No | Logic exists in helper but unused |
| Backstop cron for unmatched pending requests | No | `process-matches` never scheduled |
| Companies have real coordinates | Partial | All sharing same Budapest coord — separate audit |

## 4. Scope of THIS fix (matching pipeline only)

Goal: a customer submits → coordinates land in the DB → matching companies get an assignment row → the job appears in those companies' dashboards.

**Explicitly out of scope** (handled in a follow-up task alongside the customer confirmation email):
- Sending the "new job available" email to matched companies.
- Re-enabling/repairing the customer confirmation email.
- Any Resend domain re-verification.

### Steps, in order

1. **Create the PostGIS RPC** `find_companies_within_radius(point geometry, radius_miles float)` via migration (the SQL in the repo file, with `is_verified = true AND is_active = true` filters).
2. **Add a trigger on `move_requests`** that, on INSERT/UPDATE of `pickup_latitude/longitude` or `delivery_latitude/longitude`, sets `pickup_location` / `delivery_location` using `ST_SetSRID(ST_MakePoint(lng, lat), 4326)`. Mirror the existing companies trigger.
3. **Update `use-submit-move-request.tsx`** to:
   - Call `geocode-address` for both pickup and delivery before/after insert (drive `isGeocodingPickup` / `isGeocodingDelivery` so the spinner already wired into `AddressStep` actually animates).
   - Either insert with lat/lng included, or `update` the row with lat/lng immediately after insert.
   - Geocode failure should not hard-block submission, but should be clearly logged so the backstop cron can retry.
4. **Fix `notify-companies/index.ts`** to:
   - Pass `(supabase, moveRequest)` to `findNearbyCompanies`.
   - Insert assignments using only real columns (`request_id`, `company_id`; let `status` default to `active`).
   - On zero pickup matches, retry with `useDeliveryLocation = true`.
   - Update `move_requests.status` to `assigned` when at least one assignment is created, otherwise `no_companies_found`.
   - **Remove or comment out the `send-verification-email` loop** so it doesn't break the function. It will be reinstated in the follow-up email task with the correct dedicated function.
5. **Invoke `notify-companies` from the client** right after a successful insert+geocode, fire-and-forget. Failure only logs; the success dialog still shows.
6. **Schedule a backstop cron** (every 5–10 min) calling `process-matches`, and patch `process-matches` to use the same fallback + status-update logic. This catches any request whose inline matching failed.
7. **Verify on the company side** that the dashboard query reads `move_assignments` joined to `move_requests` and surfaces the new job — no email required for visibility.

## 5. Follow-up task (not in this plan)

A separate task will:
- Audit `send-verification-email` vs. a new dedicated `notify-company-new-job` function.
- Re-enable the customer confirmation email.
- Resolve the Resend sender/domain situation so both emails actually land.
- Re-add the email step into `notify-companies` and into the customer submit hook as non-blocking calls.

## Technical details (for implementer)

- Geometry SRID is 4326 throughout (matches existing `update_company_location` pattern).
- `move_requests.status` enum already includes `pending`, `assigned`, `no_companies_found`, `cancelled` — no enum change needed.
- `move_assignments.status` is enum `assignment_status` defaulting to `'active'` — do NOT pass `'pending'`.
- `notify-companies` runs with the service role key, so RLS is bypassed for the assignment inserts.
- Frontend should call edge fns via `supabase.functions.invoke(...)`, not raw fetch.
- Matching radius constant lives in `notify-companies/distance.ts` (`RADIUS_MILES = 25`) — reuse it instead of the magic `25` in `company-finder.ts`.
- Service role key stays server-side only.
