# Phase 1: Restore customer move-request submissions safely

## Goal
Stop the RLS toast error on customer submissions and close the public anon INSERT hole on `move_requests`, without breaking the form or the matching pipeline. Cloudflare Turnstile is deferred to Phase 2.

## Why matching is unaffected
- `notify-companies` runs with the service role, loads the row by ID, finds nearby companies via PostGIS, and inserts `move_assignments`. It does not care who inserted the move request.
- The DB trigger that derives `pickup_location` / `delivery_location` from `pickup_latitude` / `pickup_longitude` fires on every insert regardless of caller.
- The `process-matches` backstop cron also uses the service role.

As long as the new edge function inserts the same columns (including lat/lng) and the frontend still invokes `notify-companies` with the returned `id`, matching behaves identically.

## Changes

### 1. New edge function: `submit-move-request`
Files:
- `supabase/functions/submit-move-request/index.ts`
- `supabase/functions/submit-move-request/validation.ts`
- `supabase/functions/submit-move-request/config.toml` with `verify_jwt = false`

Flow:
1. CORS preflight + `verifyOrigin` (reuse `_shared/verify-origin.ts`).
2. Parse JSON body: `{ moveRequest }`. (Turnstile token slot is reserved for Phase 2.)
3. IP rate limit — read `x-forwarded-for`, call the existing `check_rate_limit` RPC with hourly bucket. On limit return 429.
4. Zod validation, strict, mirroring `validate-move-request`:
   - `moveType` enum, `propertySize` enum
   - `fullName` 2–100 chars, `email` valid + ≤255, `phone` regex + ≤32
   - `moveDate` not in the past
   - `pickupAddress` / `deliveryAddress` required objects with required street/city/zipCode
   - `specialInstructions` optional, ≤500, HTML stripped
   - lat/lng optional, numeric ranges checked
5. Insert with the service-role client — same column set the frontend uses today.
6. Return `{ success: true, id }`.
7. Error responses: 400 validation, 429 rate limit, 403 origin, 500 unexpected — all with clear JSON messages and CORS headers.

### 2. Frontend wiring
File: `src/hooks/use-submit-move-request.tsx`

Single change inside `insertMoveRequest`:
- Replace the direct `supabase.from("move_requests").insert(...)` call with `supabase.functions.invoke("submit-move-request", { body: { moveRequest: { ...data, pickupCoords, deliveryCoords } } })`.
- Read `id` from the response and return it unchanged so the rest of the hook (matching trigger + confirmation email + success dialog) works as-is.
- Surface server validation/rate-limit errors via the existing toast.

Nothing else in the form, geocoding, matching, or email flow changes.

### 3. Database migration — lock down `move_requests`
- Drop the public INSERT policies: `Anyone can create move requests`, `Anyone can create requests`, `Enable insert for all users`.
- Keep `Users can create their own move requests` (authenticated, email-scoped) untouched for any future signed-in flows.
- Add CHECK constraints as defence-in-depth:
  - `length(customer_name) BETWEEN 2 AND 100`
  - `length(customer_email) <= 255`
  - `length(customer_phone) <= 32`
  - `coalesce(length(special_instructions), 0) <= 500`
  - `move_type IN ('domestic','commercial','international')`
- Service role bypasses RLS, so `submit-move-request`, `notify-companies`, and `process-matches` all keep working.

## Order of operations (no broken windows)
1. Deploy `submit-move-request` edge function.
2. Ship the frontend change to call the new function.
3. Verify a real submission works end-to-end on preview.
4. Then run the migration that drops the public INSERT policies.

## Verification checklist
- Submit a move request from the live form → row appears in `move_requests`, status flips to `assigned` after `notify-companies`, confirmation email arrives.
- `move_assignments` rows created for matched companies (matching pipeline unaffected).
- Direct browser-console attempt `supabase.from('move_requests').insert({...})` is rejected by RLS.
- Submitting more than the configured hourly limit from one IP returns 429.
- Oversized or malformed fields rejected with a clear validation message.

## Out of scope (Phase 2)
- Cloudflare Turnstile widget + server-side token verification (slot-in once Cloudflare credentials exist).
- Removing the now-redundant `validate-move-request` edge function.