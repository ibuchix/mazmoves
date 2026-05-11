## Goal
Enhance the existing `notify-companies` edge function so that, in addition to inserting `move_assignments` rows, it sends one email to each unique matched company (within the 25-mile radius of pickup OR delivery) using the same Resend setup already working for `send-confirmation-email`.

## Scope
- Modify only `supabase/functions/notify-companies/index.ts` (and a small new helper file alongside it for the email send, to keep `index.ts` tidy).
- No DB schema changes. No new edge function. No client changes.
- Reuse the existing `RESEND_API_KEY` secret and the verified sender `HouseMove <notifications@housemove.co>`.

## Changes

1. **Add a small helper `supabase/functions/notify-companies/send-company-email.ts`**
   - Single `sendCompanyJobEmail({ to, companyName, moveRequest, distanceMiles, side })` function.
   - Direct `fetch` to `https://api.resend.com/emails` (same pattern as `send-confirmation-email`), `from: HouseMove <notifications@housemove.co>`.
   - Subject: `New move job available near you`.
   - HTML body (HouseMove branded, slate `#334155` accent) including: company name greeting, pickup town/postcode, delivery town/postcode, move date if present, property size / move type if present, approximate distance from their base, and a CTA button linking to `https://housemove.co` (their dashboard) to view & accept the job.
   - Returns `{ ok: boolean, id?: string, error?: string }` — never throws.

2. **Update `notify-companies/index.ts`**
   - After the `upsert` into `move_assignments` succeeds and before updating the move request status, loop through the deduped `matches` array and call `sendCompanyJobEmail` for each company that has a `contact_email`.
   - Run sends with `Promise.allSettled` so one failed send doesn't block the rest.
   - Log per-company outcome (`emailed`, `skipped_no_email`, `failed` + error) and include an `emailsSent` / `emailsFailed` summary in the JSON response and console log.
   - Email failures must NOT change the function's success status or the move request status — assignments are still valid even if email delivery fails.

3. **Extend the `MoveRequest` type** in `notify-companies/types.ts` with the optional fields the email body needs (e.g. `pickup_postcode`, `delivery_postcode`, `pickup_town`, `delivery_town`, `move_date`, `property_size`, `move_type`) — all typed as optional/nullable so existing logic is unaffected. Update the `select("*")` (already `*`, so no query change needed) and just type-narrow.

4. **Verification**
   - Deploy `notify-companies`.
   - `curl` the function with a recent real `moveRequestId` from the DB and confirm:
     - 200 response with `companiesMatched`, `emailsSent`, `emailsFailed`.
     - Edge function logs show one Resend message id per matched company.
     - `move_assignments` rows still created exactly as before.

## Out of scope
- No retry queue, no `email_send_log` table, no unsubscribe links — purely add the Resend send to the existing flow, matching the simplicity of the other working email functions.
- No changes to `process-matches`, `_shared/verify-origin.ts`, or any other function.
- No changes to matching logic or the 25-mile radius (already in `RADIUS_MILES`).

## Confirmation
Yes, the requirement is clear: keep everything `notify-companies` already does, and additionally fire one HouseMove-branded Resend email per uniquely matched company (union of pickup + delivery 25-mile radius) using the existing verified domain and `RESEND_API_KEY`. Shall I proceed with this plan?
