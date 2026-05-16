# Security findings 1–3: status & fix plan

## 1. `registration_errors` RLS — already fixed, just confirm

Verified live state:
- `pg_class.relrowsecurity = true` on `public.registration_errors`.
- Policies present: `Admins can view registration errors` (SELECT, admin-only via `is_admin(auth.uid())`).
- No INSERT / UPDATE / DELETE policies → with RLS on, anon and authenticated roles get **zero** access.
- All writes happen from edge functions using `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS.

The scanner finding is stale (it was generated against the old "RLS disabled" state). **No code or DB change required.** Action: mark `reg_errors_no_rls` as fixed in the security tracker.

The related warn-level finding (`registration_errors_client_ip_exposure` — no explicit deny policy for writes) is also already covered, because RLS-on + no policy = deny by default for non-service-role callers. Optional belt-and-braces: add explicit no-op policies, but it adds noise without changing behaviour. Recommend: leave as-is, mark fixed.

## 2. Backup edge functions — add a shared-secret guard

Affected: `perform-database-backup`, `perform-incremental-backup`, `backup-storage`, `monitor-backups`.

These are **only invoked by pg_cron** (confirmed via `cron.job`) — never from the React app or any user-facing flow. The current cron jobs already pass `Authorization: Bearer <service_role_key>`. The risk is that the endpoints are *also* reachable by anonymous HTTP callers because there's no in-function check.

Fix (minimal, zero behavioural change for cron):

1. Add a new project secret `CRON_SECRET` (random string, generated once).
2. At the top of each of the 4 functions, immediately after the CORS preflight, require either:
   - `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`, **or**
   - `x-cron-secret: <CRON_SECRET>`
   Reject with 401 otherwise. Use constant-time comparison.
3. Update the pg_cron jobs that hit these endpoints to add the `x-cron-secret` header (keeps things working even if the inline service-role-key approach ever rotates).

This keeps cron working unchanged today (it already sends the service role bearer) and blocks anonymous HTTP callers. No customer/company app code touches these functions, so the frontend is unaffected.

## 3. `process-matches` — same shared-secret guard

The cron job for `process-matches-every-5-min` currently passes the **anon** key, not the service role. So we can't use "require service role bearer" alone. Apply the `CRON_SECRET` header pattern from #2:

1. Update the cron job command to include `'x-cron-secret', '<CRON_SECRET>'` in its `jsonb_build_object` headers.
2. In `supabase/functions/process-matches/index.ts`, after CORS preflight, require `x-cron-secret` to equal `Deno.env.get('CRON_SECRET')`. Reject with 401 otherwise.

No React or other edge function calls `process-matches`, so this is a safe lockdown.

## Why nothing in the customer/company app breaks

- None of these 5 functions are invoked from `src/` or from any other edge function — confirmed by repo-wide search. They are 100% cron-driven.
- The matching flow that companies actually depend on (`notify-companies` running synchronously on move submission) is untouched.
- `registration_errors` is written by edge functions using the service role key, which bypasses RLS — already working today.

## Steps

1. Add `CRON_SECRET` via the secrets tool (one new secret).
2. Single migration: update the 5 cron job commands to include `x-cron-secret` header. (Stored in pg_cron with the project's own secret value — no other project sees it.)
3. Edit the 5 edge function `index.ts` files to require the secret (or service-role bearer for the 4 backup fns) immediately after the OPTIONS handler.
4. Mark these security findings as fixed: `reg_errors_no_rls`, `backup_endpoints_no_auth`, `process_matches_no_auth`. Update security memory with the new invariant: "All cron-only edge functions require `x-cron-secret` or service-role bearer."
