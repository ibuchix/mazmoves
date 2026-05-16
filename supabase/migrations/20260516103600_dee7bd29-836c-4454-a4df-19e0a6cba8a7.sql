DROP POLICY IF EXISTS "Admin Access to Backup Bucket" ON storage.objects;

CREATE POLICY "Admin Access to Backup Bucket"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'database_backups' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'database_backups' AND public.is_admin(auth.uid()));