DROP POLICY IF EXISTS "Enable registration attempts for all" ON public.registration_attempts;

CREATE POLICY "Admins can view registration attempts"
  ON public.registration_attempts
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));