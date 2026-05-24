
-- Drop the vulnerable policy
DROP POLICY IF EXISTS "Users can update own data (no role change)" ON public.users;

-- Recreate self-update policy WITHOUT relying on role check in WITH CHECK.
-- Role tampering is blocked by trigger below (which compares OLD vs NEW).
CREATE POLICY "Users can update own data"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Trigger function: block non-admins from changing the role column
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Permission denied: cannot modify role';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_role_self_escalation_trg ON public.users;
CREATE TRIGGER prevent_role_self_escalation_trg
BEFORE UPDATE OF role ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_self_escalation();
