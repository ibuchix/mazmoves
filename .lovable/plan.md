# Delete unused `check-move-distance` edge function

## Why this is safe

- `check-move-distance` only **deletes** `move_assignments` rows where the company is > 25 miles from pickup. It never returns mileage to a caller, so it cannot be what powers any "distance to job" display in the companies app.
- Distance shown to companies is a read operation. The two places distance is actually computed in this project are:
  - `find_companies_within_radius` PostGIS RPC (used by `process-matches` and `notify-companies/company-finder.ts`) — returns `distance` per company.
  - `notify-companies/distance.ts` Haversine helper.
  Either of those is what a companies-app dashboard would read from; deleting the edge function does not touch them.
- Confirmed earlier: no code references, no DB trigger, no Database Webhook, zero invocation logs. The function has never run.
- The 25-mile cap is already enforced **upfront** in matching — companies outside 25 miles are never assigned in the first place, so the "delete after the fact" cleanup is redundant even in theory.

## Changes

1. Delete the directory `supabase/functions/check-move-distance/` (removes `index.ts`).
2. Call `supabase--delete_edge_functions` with `["check-move-distance"]` to remove the deployed function from Supabase.
3. Leave `supabase/functions/_shared/require-webhook-secret.ts` in place — it's a small, generic helper that's useful for future DB-webhook-triggered functions. No other file imports it yet, but keeping it costs nothing and avoids re-creating it later.

## Not changed

- No DB migrations.
- No frontend changes.
- No changes to `process-matches`, `notify-companies`, `find_companies_within_radius`, billing, or invoicing.
- No new secrets required. `MOVE_ASSIGNMENT_WEBHOOK_SECRET` was never added, so nothing to clean up there either.

## Follow-up after merge

- In Supabase Security scan, mark the `check-move-distance` finding as resolved (the function no longer exists).
