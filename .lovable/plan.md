## What's actually broken

The `notify-companies` edge function itself is healthy — I manually invoked it just now against your most recent move request (`ec5c5f0e-…`) and it sent 5 emails successfully (`emailsSent: 5, emailsFailed: 0`). Resend, the email template, the matching RPC, and the `companies` data are all fine.

The real issue is that `notify-companies` is **never being invoked from the browser anymore** after a customer submits a move request. Analytics shows zero edge-log entries for `notify-companies` — every recent move request has its status flipped to `assigned` by the `process-matches` cron (which runs every ~5 min as a backstop), and that backstop explicitly does NOT send emails:

```ts
// supabase/functions/process-matches/index.ts (top comment)
// Email notifications are intentionally NOT sent here — deferred to the
// follow-up email task.
```

So assignments show up on the company dashboard (cron handled it), but the "new job near you" email never goes out.

### Why the inline call from the browser stopped working

In `src/hooks/use-submit-move-request.tsx`, after the request is saved the client does:

```ts
if (pickupCoords || deliveryCoords) {
  void triggerMatching(moveRequestId);   // fire-and-forget
}
```

That's a fire-and-forget `supabase.functions.invoke("notify-companies", …)` that races with:
- the confirmation-email await,
- TikTok/Google Ads tracking,
- `setShowSuccess(true)` + eventual `navigate("/")`.

Most likely the request is either being cancelled on navigation, or rejected by JWT verification (`notify-companies` does NOT have `verify_jwt = false` in `supabase/functions/config.toml` — only `register-company` does). The recent security work didn't touch this function's code, but a Supabase signing-key rotation in that same period would silently break anon-key-authed calls to any function that still requires JWT verification. Either way, the browser call is the weak link.

## Fix

Move the `notify-companies` invocation **server-side** so it always runs, with service-role auth, before the HTTP response returns to the browser. This removes the dependency on the browser staying alive and on JWT/origin checks. Also harden the function's config so it can still be called by anon clients if needed.

### Changes

1. **`supabase/functions/submit-move-request/index.ts`** — after the successful insert (and before returning `{ success: true, id }`), fire `notify-companies` using the service-role client already created in the function. Use `EdgeRuntime.waitUntil(...)` (Deno deploy) or `void fetch(...)` so the customer doesn't wait on it, but the runtime keeps the request alive until it completes. Pass `{ moveRequestId: inserted.id }`. Errors are logged only — the customer-facing flow never fails because of email.

2. **`src/hooks/use-submit-move-request.tsx`** — remove the client-side `triggerMatching(moveRequestId)` call (and the unused `triggerMatching` helper) so we don't double-trigger. Keep the success dialog / navigation flow exactly as it is.

3. **`supabase/functions/config.toml`** — add `verify_jwt = false` for `notify-companies` (it already enforces `verifyOrigin` and only accepts a move-request UUID, so this matches the existing pattern used by `submit-move-request`). This is belt-and-braces in case anything else ever invokes it from the browser.

4. **Redeploy** `submit-move-request` and `notify-companies`.

### Verification

- Submit a test move request from the preview.
- Check `notify-companies` edge logs — they should now show one invocation per submission with `emailsSent > 0`.
- Confirm the nb movers test account receives the "New move job available near you" email within a few seconds of submission (not 5 min later).
- `move_assignments` rows should still appear on the dashboard exactly as today (no duplicate inserts thanks to the existing `(request_id, company_id)` unique constraint + `ignoreDuplicates`).

### What I will NOT touch

- `process-matches` cron — stays as a backstop, still no emails (any change there risks double-emailing companies for the same job).
- `sendCompanyJobEmail`, the email template, or Resend config — verified working.
- RLS / GRANTs on `users`, `companies`, `move_assignments`, `move_requests` — the recent security fixes are correct and unrelated to this regression.
