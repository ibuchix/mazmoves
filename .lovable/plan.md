# Delete the unused `handle-data-request` edge function

## Why

The security scanner flagged `handle-data-request` as a critical issue: it uses the service role key but never validates who's calling it, meaning anyone on the internet could submit GDPR-style deletion or export requests for any user ID.

After inspecting the codebase, this function is **dead code**:

- Nothing calls it — not the customer app, not the companies app, not the admin app, not any other edge function.
- It tries to write to a `data_requests` table that doesn't exist in the database, so any call would fail anyway.
- The Privacy Policy page directs users to email `help@housemove.co` to exercise their data rights — it does not invoke this function.

The simplest, safest fix is to delete the function. That eliminates the vulnerability with zero impact on any app feature.

## What changes

- Delete the folder `supabase/functions/handle-data-request/`.
- Remove the deployed function from Supabase so the public URL no longer responds.
- Mark the security finding as fixed.

## What does NOT change

- No frontend code changes (nothing imports it).
- No database changes.
- GDPR data-request handling continues via the existing `help@housemove.co` email channel documented in the Privacy Policy.
- All other edge functions, the admin login flow, and admin account creation remain untouched.

## Technical notes

- Use `code--exec rm -rf supabase/functions/handle-data-request` to remove source.
- Use `supabase--delete_edge_functions` with `["handle-data-request"]` to undeploy.
- Use `security--manage_security_finding` with `mark_as_fixed` for `agent_security` / `handle_data_no_auth`.
