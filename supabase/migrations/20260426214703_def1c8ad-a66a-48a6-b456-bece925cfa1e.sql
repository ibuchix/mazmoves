-- Make sure the cron + http extensions are available (they already are in this project)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Replace any prior schedule for this job, then create a fresh one (every 5 minutes).
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'process-matches-every-5-min';

SELECT cron.schedule(
  'process-matches-every-5-min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://tcyulkuyfptlisfyefnn.supabase.co/functions/v1/process-matches',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Sanity check: the trigger should populate pickup_location/delivery_location.
DO $$
DECLARE
  test_id uuid;
  pickup_filled boolean;
  delivery_filled boolean;
BEGIN
  INSERT INTO public.move_requests (
    move_type, estimated_size,
    pickup_address, delivery_address,
    requested_date,
    customer_name, customer_email, customer_phone,
    pickup_latitude, pickup_longitude,
    delivery_latitude, delivery_longitude
  ) VALUES (
    'domestic', '2',
    '{"street":"Trigger Test","city":"Budapest","state":"BU","zipCode":"1011"}'::jsonb,
    '{"street":"Trigger Test 2","city":"Budapest","state":"BU","zipCode":"1052"}'::jsonb,
    CURRENT_DATE + INTERVAL '7 days',
    'Trigger Test', 'trigger-test@example.com', '+36123456789',
    47.5033, 19.0488,
    47.4979, 19.0402
  )
  RETURNING id INTO test_id;

  SELECT pickup_location IS NOT NULL, delivery_location IS NOT NULL
  INTO pickup_filled, delivery_filled
  FROM public.move_requests
  WHERE id = test_id;

  IF NOT pickup_filled OR NOT delivery_filled THEN
    RAISE EXCEPTION 'move_requests location trigger did not populate geometry columns (pickup=%, delivery=%)', pickup_filled, delivery_filled;
  END IF;

  -- Clean up the test row so no test data persists.
  DELETE FROM public.move_requests WHERE id = test_id;

  RAISE NOTICE 'Trigger sanity check passed.';
END;
$$;