# Phase 1: Lock down move_requests inserts via edge function

## Goal
Stop the RLS toast error on customer submissions and close the public anon INSERT hole on `move_requests`, **without breaking** the submission flow or the matching pipeline. Turnstile is deferred to Phase 2.

## Why this is safe for matching
The matching pipeline is completely decoupled from how a row gets inserted:
- `notify-companies` runs with the **service role**, loads the row by ID, finds nearby companies via PostGIS, and inserts `move_assignments`.
- The DB trigger that derives `pickup_location` / `delivery_location` from `pickup_latitude` / `pickup_longitude` fires on every insert, regardless of caller.
- The `process-matches` backstop cron also uses the service role.

As long as the new edge function inserts the same columns (including lat/lng) and the frontend still invokes `notify-companies` with the returned `id`, matching behaves identically.

## Implementation

### 1. New edge function: `submit-move-request`
Files:
- `supabase/functions/submit-move-request/index.ts`
- `supabase/functions/submit-move-request/validation.ts`
- `supabase/functions/submit-move-request/config.toml` (`verify_jwt = false`)

Flow inside the function:
1. CORS preflight + `verifyOrigin` (reuse `_shared/verify-origin.ts`).
2. Parse JSON body: `{ moveRequest }` (Turnstile token will slot in here in Phase 2).
3. **IP rate limit** — read `x-forwarded-for`, call the existing `check_rate_limit` RPC keyed on IP (hourly bucket, same pattern as `use-rate-limit.ts`). On limit: return 429.
4. **Zod validation** — strict schema mirroring `validate-move-request`:
   - `moveType` enum, `propertySize` enum
   - `fullName` 2–100 chars, `email` valid + ≤255, `phone` regex + ≤32
   - `moveDate` not in the past
   - `pickupAddress` / `deliveryAddress` required objects
   - `specialInstructions` optional, ≤500, HTML stripped
   - lat/lng: optional numbers within valid ranges
5. **Insert** with the service-role client — same column set the frontend uses today.
6. Return `{ success: true, id }`.
7. Errors return JSON with clear messages (400 validation, 429 rate limit, 500 unexpected).

### 2. Frontend wiring (`src/hooks/use-submit-move-request.tsx`)
Single change inside `insertMoveRequest`:
- Replace `supabase.from("move_requests").insert(...)` with `supabase.functions.invoke("submit-move-request", { body: { moveRequest: { ...data, pickupCoords, deliveryCoords } } })`.
- Read `id` from the response and return it unchanged so the rest of the hook (matching trigger + confirmation email) works as-is.
- Surface server validation errors via the existing toast.

Nothing else in the form, geocoding, matching, or email flow changes.

### 3. Database migration — lock down `move_requests`
- Drop public INSERT policies: `Anyone can create move requests`, `Anyone can create requests`, `Enable insert for all users`.
- Keep `Users can create their own move requests` (authenticated, email-scoped) as-is.
- Add CHECK constraints as defence-in-depth:
  - `length(customer_name) BETWEEN 2 AND 100`
  - `length(customer_email) <= 255`
  - `length(customer_phone) <= 32`
  - `coalesce(length(special_instructions), 0) <= 500`
  - `move_type IN ('domestic','commercial','international')`
- Service role bypasses RLS, so `submit-move-request`, `notify-companies`, and `process-matches` all keep working.

## Order of operations (so nothing breaks mid-deploy)
1. Deploy `submit-move-request` edge function.
2. Ship the frontend change to call the new function.
3. Verify a real submission works end-to-end on preview.
4. **Then** run the migration that drops the public INSERT policies.

Doing the migration last guarantees there's no window where the form is broken.

## Verification checklist
- Submit a move request from the live form → row appears in `move_requests`, status flips to `assigned` after `notify-companies`, confirmation email arrives.
- `move_assignments` rows created for matched companies (matching pipeline unaffected).
- Direct browser-console attempt: `supabase.from('move_requests').insert({...})` is rejected by RLS.
- Submitting >N requests/hour from one IP returns 429.
- Oversized fields rejected with a clear validation message.

## Out of scope (Phase 2)
- Cloudflare Turnstile widget + server-side token verification (slot-in once credentials exist).
- Removing the deprecated `validate-move-request` edge function.
