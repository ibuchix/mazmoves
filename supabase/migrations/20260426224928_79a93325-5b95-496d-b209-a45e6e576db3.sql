
-- 1. Re-geocode the two verified companies with their real Mapbox-derived coordinates.
--    The existing trigger on companies will refresh the PostGIS `location` column.
UPDATE public.companies
SET latitude = 51.619113, longitude = -0.15692
WHERE id = 'ba93c985-7f1e-4974-b5dc-13911cf917d7'; -- ABC Moving Solutions LTD (London EC1V)

UPDATE public.companies
SET latitude = 52.16608, longitude = -0.54807
WHERE id = 'a44f98bb-e514-4a0b-9d2c-d4539e279607'; -- Buchi Ltd (Bedford MK43)

-- 2. Fix the broken matching cron job.
--    The old command used `current_setting('app.settings.service_role_key')`,
--    which is unset, so the Authorization header was empty and process-matches
--    rejected every call. Inline the public anon key instead — the edge
--    function authenticates to Supabase via its own SERVICE_ROLE env var.
SELECT cron.unschedule(13);

SELECT cron.schedule(
  'process-matches-every-5-min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://tcyulkuyfptlisfyefnn.supabase.co/functions/v1/process-matches',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeXVsa3V5ZnB0bGlzZnllZm5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5MTQ0MzYsImV4cCI6MjA1MDQ5MDQzNn0.BCfN7FMzY2hDp26NGOWqrV197j2EztDEoplL0CF5_gg'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
