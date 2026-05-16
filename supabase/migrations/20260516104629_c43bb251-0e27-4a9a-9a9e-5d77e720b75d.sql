ALTER TABLE public.registration_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view registration errors"
ON public.registration_errors
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));