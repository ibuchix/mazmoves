DROP POLICY IF EXISTS "Admin can delete requests" ON public.move_requests;

CREATE POLICY "Admin can delete requests"
ON public.move_requests
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'::user_role
  )
);