# Confirm prior fixes and harden `check-move-distance`

## Verification of previously fixed findings

After reading the current code, three of the four findings the scanner is still showing are **already fixed in the codebase**. The scanner results are stale and should be marked resolved.

### 1. `create-stripe-customer` — FIXED
`supabase/functions/create-stripe-customer/index.ts` calls `requireCompanyOwnerOrAdmin(req, companyId, …)` before any Stripe work. The shared helper:
- Requires `Authorization: Bearer <jwt>`.
- Verifies the JWT with `supabase.auth.getUser`.
- Loads the target `companies` row with the service role key.
- Returns 403 unless `companies.auth_user_id === user.id` OR caller is admin.

### 2. `verify-company` — FIXED
`supabase/functions/verify-company/index.ts` runs `verifyOrigin` AND `requireAdmin` before flipping `is_verified=true`. `requireAdmin` enforces a valid JWT and `public.users.role = 'admin'`.

### 3. `create-subscription` / `process-payment` / `generate-invoice` / `report-usage` — FIXED
- `create-subscription` and `process-payment` → `requireCompanyOwnerOrAdmin`.
- `generate-invoice` and `report-usage` → `requireAdminOrService`, which accepts either the project service-role bearer (so the monthly `process_billing_cycle()` cron and the `report-usage` server-to-server callers keep working) or an authenticated admin JWT.

No changes needed for these three findings beyond marking them fixed.

## Finding 4 — `check-move-distance` is still vulnerable

### How it works today
- The function is not invoked anywhere in this codebase. It is wired up as a **Supabase Database Webhook on `move_assignments` (AFTER INSERT)** — the request body shape `{ record: { request_id, company_id, id } }` is exactly the standard Supabase webhook payload.
- It only calls `verifyOrigin(req)`, then trusts every field in `record` and deletes `move_assignments` where `id = record.id`.
- Because `*.lovable.app` and `*.lovableproject.com` are in the origin allowlist, any caller can spoof the `Origin` header, point `record.id` at any assignment row, and pair it with a `request_id`/`company_id` that are naturally > 25 miles apart. The function will then delete the targeted assignment.

### What we will change
Goal: keep the existing database-webhook behavior intact (assignments outside 25 miles get deleted automatically) while preventing arbitrary deletion.

1. **Require a webhook secret.** Add a new Supabase secret `MOVE_ASSIGNMENT_WEBHOOK_SECRET`. The edge function will require it on every call. Two acceptance modes:
   - Header `x-webhook-secret: <secret>` (preferred for the DB webhook — set in the Supabase webhook config).
   - OR `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>` (so an authenticated admin/service caller can still trigger it manually).

   Any request that has neither is rejected with 401. `verifyOrigin` is removed as the sole guard.

2. **Validate `record.id` actually links `record.request_id` to `record.company_id`.** Before any delete, load the assignment row and confirm:
   - `move_assignments.id = record.id`
   - `move_assignments.request_id = record.request_id`
   - `move_assignments.company_id = record.company_id`
   - `move_assignments.status` is one of the statuses the matcher actually creates (e.g. `active`/`pending`) — so we never delete a completed/invoiced assignment even if the distance check is somehow re-run.

   If the row doesn't exist or any field mismatches, return 200 with `{ skipped: true }` and do nothing.

3. **No behavioral change for the legitimate webhook path.** The Supabase DB webhook fires once per new `move_assignments` insert, the function recomputes distance from pickup vs company coordinates (unchanged Haversine logic), and deletes only if > 25 miles. Matching accuracy, the notify/assign pipeline, billing, and any downstream UI are unaffected because:
   - The set of rows that get deleted is the same set today's logic would delete for legitimate inserts.
   - We only added preconditions that reject *forged* calls; legitimate webhook calls always satisfy them.

### Operational follow-up the user does after merge
- In the Supabase dashboard → Database → Webhooks, open the existing `move_assignments` webhook that targets `check-move-distance` and add an HTTP header `x-webhook-secret` = the value of the new secret.
- Add the `MOVE_ASSIGNMENT_WEBHOOK_SECRET` secret in Supabase → Edge Functions → Secrets (we will use `add_secret` to request the value during implementation).

## Files touched

- `supabase/functions/check-move-distance/index.ts` — replace `verifyOrigin` guard with the secret-or-service-role guard, add the integrity check on `record`.
- (Optional) `supabase/functions/_shared/require-webhook-secret.ts` — small helper so we don't repeat the secret comparison logic if other webhooks need it later.

No DB migrations. No frontend changes. No changes to matching, billing, invoicing, or any other edge function.

## Out of scope (separate findings still to address later)

- `notify-companies`, `send-verification-email`, `send-confirmation-email`, `send-welcome-email`, `geocode-address` open-endpoint findings.
- `stripe-webhook` anon key.
- `handle_new_user` role-from-metadata.
- `companies` and `users` RLS INSERT policies, plaintext `password`/`password_hash` columns.
- Supabase linter warnings (function search_path, leaked password protection, OTP expiry, etc.).
