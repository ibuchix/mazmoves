## Goal
Get the customer move-request confirmation email (and other existing Resend-powered emails) working again on the new verified `housemove.co` domain — by **modifying existing edge functions only**, not creating new ones.

## Findings
Resend is currently used in 4 edge functions, all hardcoded to the old `mazmoves.com` brand:

| File | Current From / Recipient | Issue |
|---|---|---|
| `supabase/functions/send-confirmation-email/index.ts` | `MAZ Moves <notifications@mazmoves.com>` | **This is the move-request email the user is talking about.** Domain not verified on Resend → sends fail. |
| `supabase/functions/send-welcome-email/index.ts` | `MAZ Moves <notifications@mazmoves.com>` | Same domain issue. |
| `supabase/functions/verify-company/index.ts` | `MazMoves <onboarding@resend.dev>` | Sandbox sender, off-brand. |
| `supabase/functions/send-verification-email/index.ts` | `MazMoves <onboarding@resend.dev>` | Sandbox sender, off-brand. |
| `supabase/functions/handle-data-request/index.ts` | internal recipient `ask@mazmoves.com` | Stale internal address. |

Also stale: `supabase/functions/_shared/verify-origin.ts` allowlist references `mazmoves.com` / `app.mazmoves.com` — the live domain is now `housemove.co` / `www.housemove.co` (plus the lovable preview already listed). The frontend invokes `send-confirmation-email` from the browser, so origin verification matters.

## Changes

1. **Rotate Resend secret**
   - Update the existing `RESEND_API_KEY` secret with the new key the user generated (no new secret name, no code rename).

2. **Update sender across all 4 Resend functions** to:
   - From: `HouseMove <notifications@housemove.co>`
   - Update the brand string in the HTML bodies (`MAZ Moves` / `MazMoves` → `HouseMove`) and tweak the inline brand colour from old navy `#040480` to the current brand slate so emails match the new look.
   - Files: `send-confirmation-email/index.ts`, `send-welcome-email/index.ts`, `verify-company/index.ts`, `send-verification-email/index.ts`.

3. **Update `handle-data-request/index.ts`**
   - Change internal `to` from `ask@mazmoves.com` → `help@housemove.co`.

4. **Update `_shared/verify-origin.ts` allowlist**
   - Replace `https://mazmoves.com` and `https://app.mazmoves.com` with `https://housemove.co` and `https://www.housemove.co`.
   - Keep existing localhost + lovable preview entries.
   - This unblocks `send-confirmation-email` (and `send-welcome-email`) on the live custom domain, where they currently 403.

5. **Deploy** the touched edge functions and **verify**:
   - `curl` test of `send-confirmation-email` with a real test address to confirm 200 + Resend message id.
   - Check edge function logs for `Email sent successfully` and absence of "RESEND_API_KEY not configured" / origin errors.

## Out of scope
- No new edge functions, no Lovable Email infra migration, no template restructuring, no React Email rewrite — purely credential + branding swap inside the existing functions, as requested.
- Auth/Supabase-managed emails (signup, password reset) are not touched — those are configured in Supabase Auth, not in these functions.
