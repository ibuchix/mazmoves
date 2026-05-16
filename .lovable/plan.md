# Lock down `registration_attempts` RLS

## The issue

`registration_attempts` currently has one policy:

```
Enable registration attempts for all — role: anon, ALL, USING true, WITH CHECK true
```

This means any unauthenticated visitor can `SELECT` every row in the table, exposing every registering company's email and IP address.

## Why we can safely tighten it

- Inserts are written by the `register-company-v2` edge function via `supabase.rpc('log_registration_attempt', ...)`. The edge function uses the **service role key**, which bypasses RLS, and the RPC is `SECURITY DEFINER`. Neither path needs an anon INSERT policy.
- Nothing in `src/` reads from this table. Only admins should ever need to see it (for abuse review), which matches the rest of the admin-only logging tables (`validation_failures`, `auth_rate_limits`).
- Customer move-request submission does not touch this table at all, so anonymous customers are unaffected.
- Admin signup is unaffected — admins are created via the admin app, not the public registration flow.

## Change (single migration)

```sql
-- Remove the over-permissive anon ALL policy
DROP POLICY IF EXISTS "Enable registration attempts for all" ON public.registration_attempts;

-- Admin-only SELECT, consistent with other logging tables
CREATE POLICY "Admins can view registration attempts"
  ON public.registration_attempts
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));
```

No INSERT/UPDATE/DELETE policies are added: service-role writes from the edge function continue to work, and no other role should be writing to this table.

## What stays the same

- Company registration via `register-company-v2` — still logs attempts through the service role.
- Customer move-request submission — does not use this table.
- Admin creation flow — unchanged.
- Frontend code — no changes needed; `src/integrations/supabase/types.ts` regenerates from the schema automatically.

## Out of scope

The security view lists many other unrelated findings (plaintext passwords on `companies`, unauthenticated edge functions, privilege-escalation policies on `users`, etc.). Those are tracked separately and not addressed here.
