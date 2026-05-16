# Secure Stripe billing + admin verify-company endpoints

## Context

None of the six flagged edge functions (`create-subscription`, `process-payment`, `generate-invoice`, `report-usage`, `create-stripe-customer`, `verify-company`) are called from this customer-side codebase. They are invoked from the admin app and from internal billing flows. So we can safely add JWT + role checks without breaking any UI in this repo.

The `verify-company` finding **is** relevant even though it lives in the customer-side codebase: the function is deployed in the shared Supabase project and is reachable by anyone on the internet. Today it only checks `Origin`, and `*.lovable.app` / `*.lovableproject.com` are whitelisted, so any Lovable project can flip `is_verified=true` on any company. We must lock it to admins.

## What changes

### 1. `verify-company` — admin only
- Require `Authorization: Bearer <jwt>` and validate with `supabase.auth.getUser`.
- Look up caller in `public.users` and require `role = 'admin'` (or `has_role(uid,'admin')`).
- Keep the existing geocode guard and Resend email logic untouched.
- Keep `verifyOrigin` as a secondary defense (not the only one).
- Admin app already sends the user's session JWT via `supabase.functions.invoke`, so no admin-app change is needed.

### 2. `create-stripe-customer` — company-owner or admin
- Require JWT.
- Load `companies` row by `companyId` using the service role key.
- Allow only if `companies.auth_user_id === user.id` OR caller is admin.
- Switch internal Supabase client from anon key to service role (needed once RLS is honoring auth).

### 3. `create-subscription` — company-owner or admin
- Require JWT.
- Derive `company_id` from `companies.auth_user_id = user.id` rather than trusting the body (admin path may pass an explicit `company_id` and we validate admin role for that branch).
- Switch to service role for the internal company lookup/update.

### 4. `process-payment` — company-owner or admin
- Require JWT.
- Load invoice + company; allow only invoice's company owner or admin.
- Switch to service role internally.

### 5. `generate-invoice` — cron (service role) or admin
- **How it works today:** monthly pg_cron job `process-monthly-billing` runs `process_billing_cycle()` on the 1st of each month. That SECURITY DEFINER SQL function opens a new `billing_cycles` row and POSTs to `/generate-invoice` with `Authorization: Bearer <SERVICE_ROLE_KEY>` and `{ billingCycleId }`. The edge function then aggregates every completed `move_assignment` in the cycle and creates the Stripe invoice plus DB rows. Companies and admins do not trigger it manually.
- **After the change:** accept the request if EITHER the bearer token is the project's service role key (cron path) OR the caller is an authenticated admin (manual re-run from admin app). Reject everyone else.
- Service role detection: decode the JWT and require `role === 'service_role'`, or compare to `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` directly. No DB call needed for the cron path.
- Existing cron + admin flows continue to work unchanged — the monthly invoice still runs automatically on day 1.

### 6. `report-usage` — cron/service role or admin
- Called server-side when an assignment completes; not from the public site.
- Same dual-auth as `generate-invoice`: allow service role bearer (internal callers) or admin JWT.
- Anonymous calls rejected.

## Shared helper

Add `supabase/functions/_shared/require-admin.ts` that:
- Reads `Authorization` header, calls `supabase.auth.getUser(token)`.
- Looks up `public.users.role` (or uses `has_role`) and returns `{ user, isAdmin }` or a 401/403 `Response`.
- Used by `verify-company`, `generate-invoice`, `report-usage`.

Add `supabase/functions/_shared/require-company-owner.ts` that:
- Validates JWT, loads the target `companies` row by id with service role, returns 403 unless `auth_user_id === user.id` or caller is admin.
- Used by `create-stripe-customer`, `create-subscription`, `process-payment`.

## Technical details

- All functions keep `OPTIONS`/CORS handling and existing response shapes — no breaking changes for callers that already send a valid session JWT.
- `supabase.functions.invoke` from both customer and admin apps automatically attaches the user's session JWT, so existing UI flows continue to work.
- No DB migrations needed for this plan.
- No changes to `stripe-webhook` here (separate finding, can be addressed next).

## Out of scope (will flag separately)

- Plaintext `password`/`password_hash` columns on `companies`
- `handle_new_user` role-from-metadata escalation
- `users` table `system_insert` public INSERT policy
- `stripe-webhook` using anon key
- `send-welcome-email` / `send-verification-email` / `send-confirmation-email` / `geocode-address` / `check-move-distance` hardening
- Supabase linter warnings (function search_path, leaked password protection, OTP expiry, etc.)
