-- 1. Matching function: returns verified, active companies within radius of a point
CREATE OR REPLACE FUNCTION public.find_companies_within_radius(
  point geometry,
  radius_miles float
)
RETURNS TABLE (
  id uuid,
  distance float
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    companies.id,
    (ST_Distance(
      companies.location::geography,
      point::geography
    ) * 0.000621371)::float AS distance -- meters -> miles
  FROM companies
  WHERE companies.location IS NOT NULL
    AND ST_DWithin(
      companies.location::geography,
      point::geography,
      radius_miles * 1609.34  -- miles -> meters
    )
    AND companies.is_verified = true
    AND companies.is_active = true
  ORDER BY distance ASC;
END;
$$;

-- 2. Trigger function: keep move_requests.pickup_location / delivery_location in sync with lat/lng
CREATE OR REPLACE FUNCTION public.update_move_request_location()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.pickup_latitude IS NOT NULL AND NEW.pickup_longitude IS NOT NULL THEN
    NEW.pickup_location := ST_SetSRID(ST_MakePoint(NEW.pickup_longitude, NEW.pickup_latitude), 4326);
  ELSE
    NEW.pickup_location := NULL;
  END IF;

  IF NEW.delivery_latitude IS NOT NULL AND NEW.delivery_longitude IS NOT NULL THEN
    NEW.delivery_location := ST_SetSRID(ST_MakePoint(NEW.delivery_longitude, NEW.delivery_latitude), 4326);
  ELSE
    NEW.delivery_location := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_move_request_location ON public.move_requests;

CREATE TRIGGER trg_update_move_request_location
BEFORE INSERT OR UPDATE OF pickup_latitude, pickup_longitude, delivery_latitude, delivery_longitude
ON public.move_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_move_request_location();

-- 3. Backfill: any rows that already have lat/lng but a missing location geometry
UPDATE public.move_requests
SET pickup_latitude = pickup_latitude  -- no-op, fires the trigger
WHERE (pickup_latitude IS NOT NULL AND pickup_location IS NULL)
   OR (delivery_latitude IS NOT NULL AND delivery_location IS NULL);