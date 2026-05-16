# Remove the public-role "Companies can update during registration" policy

## The issue

The `companies` table currently has this policy:

```
Companies can update during registration
  role:        public  (includes unauthenticated)
  command:     UPDATE
  USING:       contact_email = jwt.email  OR  auth_user_id = auth.uid()
  WITH CHECK:  same
```

Because it's bound to the `public` role, an attacker can craft a JWT that puts any email in the `email` claim and update **that company's row** — including `stripe_customer_id`, `billing_status`, `is_verified`, and `auth_user_id`. The JWT does not need to come from Supabase Auth; only RLS evaluates the claim.

## Why it can be removed safely

Registration on the company app is handled by the `register-company-v2` edge function using the **service role key**, which bypasses RLS entirely. No client-side update is needed during signup.

Once a company is registered and signs in, the existing policy

```
Companies can only view and edit their own data
  role:   authenticated
  USING:  auth_user_id = auth.uid() OR is_admin(auth.uid())
```

already gives them full read/update access to their own row from the company dashboard (documents, profile, etc.). Admins keep their existing policies.

So the public-role policy is pure attack surface — nothing legitimate depends on it.

## Change (single migration)

```sql
DROP POLICY IF EXISTS "Companies can update during registration" ON public.companies;
```

That's it. No code changes in either app are needed.

## What stays the same

- Company registration via `register-company-v2` (service role — bypasses RLS).
- Authenticated companies updating their own row from the company dashboard.
- Admin updates to any company.
- Customer-side move requests (untouched).
- Admin login and admin creation flows (untouched).

## Out of scope

Other findings on `companies` (`update_own_verification_status` also being on `public`, the still-present `password`/`password_hash` columns, etc.) are separate and tracked individually — not addressed here.
