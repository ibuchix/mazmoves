# Filter company matching by move_type

Companies now opt in to which move types they want to receive via `companies.service_areas.types` (array of `"domestic" | "commercial" | "international"`). The customer-side matching pipeline currently ignores this — it filters only by radius, `is_verified`, and `is_active`. We need to add a move-type filter so a company only receives a request whose `move_type` is in their `service_areas.types`.

## What changes

Two matching paths run the same PostGIS RPC and need the same filter:

1. **`notify-companies`** — inline matching at submission time.
2. **`process-matches`** — cron backstop sweep over pending requests.

Both call `find_companies_within_radius(point, radius_miles)`. We extend that RPC with a `move_type` parameter and apply the filter in SQL, so the two paths stay consistent and the database does the work.

## Database (migration)

Update `find_companies_within_radius` to accept and apply `move_type`:

```text
find_companies_within_radius(point, radius_miles, move_type text)
  where ... AND (
    move_type IS NULL                      -- legacy/safety: no filter
    OR service_areas->'types' ? move_type  -- JSONB array contains move_type
  )
```

Passing `NULL` preserves current behaviour for any caller that hasn't been updated; passing `"domestic" | "commercial" | "international"` enforces the opt-in.

## Edge function changes

- `supabase/functions/notify-companies/company-finder.ts` — pass `request.move_type ?? null` into the RPC call.
- `supabase/functions/process-matches/index.ts` — load `move_type` from `move_requests` alongside `pickup_location` / `delivery_location`, and pass it into the RPC call in `matchOne`.

No change to assignment insertion, status transitions, or email sending.

## Behaviour for edge cases

- **`move_requests.move_type` is `NULL`** (legacy rows or rows submitted before the field was set): no type filter is applied — they continue to match every nearby company, same as today. This avoids retroactively stranding old pending requests.
- **A company's `service_areas.types` is missing or empty**: the company will not match any request that has a `move_type`. This is the intended opt-in semantics from the company-side feature.
- **Pickup vs delivery search**: both calls in `notify-companies` use the same `move_type`, so the union/dedupe logic is unchanged.

## Out of scope

- No UI changes on the customer side.
- No change to `service_areas.radius_miles` or `daily_capacity` handling.
- No backfill of `move_type` on existing rows.

## Files touched

- `supabase/functions/sql/find_companies_within_radius.sql` (reference copy)
- New migration updating the RPC in the database
- `supabase/functions/notify-companies/company-finder.ts`
- `supabase/functions/process-matches/index.ts`
