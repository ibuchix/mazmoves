# Fix: Prevent users from escalating their own `role` to `admin`

## The finding
The `users` table has two UPDATE policies that allow a user to update their own row (`auth.uid() = id`) with **no restriction on the `role` column**. A signed-in customer or company user can run:

```ts
supabase.from('users').update({ role: 'admin' }).eq('id', myUid)
```

…and instantly become an admin (`is_admin()` returns true), gaining access to every company, invoice, and admin endpoint.

## What I verified
- Current policies on `public.users`:
  - `Users can update own data` — USING + WITH CHECK only check `auth.uid() = id`. **Allows role change.**
  - `admin_all_access` (FOR ALL) — USING + WITH CHECK is `(is_admin(auth.uid()) OR id = auth.uid())`. **Same flaw — a non-admin self-update passes the OR.**
  - `Admin can update all users` — correctly gated by `is_admin(auth.uid())`. Keep as-is.
- Code audit: searched `src/` and `supabase/functions/` for any `.update()` against the `users` table that touches `role`. **None found.** The app never legitimately changes a user's role from the client. Role is set once at signup by the `handle_new_user` webhook (service role).

## Proposed fix
Two complementary changes in a single migration. Both are needed because the existing `admin_all_access` policy is too permissive and a trigger gives defense-in-depth against any future policy mistake.

### 1. Tighten RLS policies
- Drop the redundant/dangerous `admin_all_access` policy (its admin half is already covered by `Admin can update all users` + `Admin can view all users`; its self half is covered by `Users can update own data` + `Users can view own data`).
- Replace `Users can update own data` with a version whose `WITH CHECK` forbids role mutation by comparing to the row's current role via a `SECURITY DEFINER` helper (avoids RLS recursion).

### 2. Add a hard guard trigger
A `BEFORE UPDATE OF role` trigger on `public.users` that raises an exception unless the session is the service role or the caller is an admin. This catches any update path — direct SQL, future policy changes, accidental admin client misuse — not just RLS-governed REST calls.

```sql
-- helper (SECURITY DEFINER, search_path locked)
CREATE OR REPLACE FUNCTION public.get_user_role(_uid uuid)
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.users WHERE id = _uid $$;

-- policy replacement
DROP POLICY "admin_all_access" ON public.users;
DROP POLICY "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data (no role change)"
  ON public.users FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = public.get_user_role(auth.uid()));

-- defense-in-depth trigger
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND current_setting('role', true) <> 'service_role'
     AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can change a user role';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_prevent_role_self_escalation
  BEFORE UPDATE OF role ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_escalation();
```

## Why this won't break the app
- **Customers**: Don't register and don't have rows in `public.users` they update via the client. Move-request submission writes to `move_requests`, not `users`. Unaffected.
- **Companies**: The codebase has zero `.update()` calls against `public.users` from the company app. Profile data lives in `companies`. Unaffected.
- **Admins**: `Admin can update all users` policy remains; admins can still change any user's role. The new trigger explicitly allows `is_admin(auth.uid())` and the service role.
- **Edge functions / webhooks**: All run with the service role key, which bypasses RLS and is whitelisted in the trigger. `handle_new_user` (sets role at signup) continues to work.
- **All other columns** (`full_name`, `phone`, `address`, etc.): users can still self-update them — the policy only blocks changes to `role`.

## Notes
- The `handle_new_user_role_metadata` finding (role assigned from user-supplied `user_metadata`) is a separate, related issue. This plan does not fix it. After this plan ships, even if that webhook accepts `user_metadata.role`, the user cannot later flip themselves to admin — but the webhook should still be hardened in a follow-up.

## Steps
1. Run the migration above.
2. Mark the `users_table_role_self_update_no_check` finding as fixed.
3. Update security memory with the new invariant: "Role mutation requires admin or service role — enforced by trigger."
