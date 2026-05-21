-- Reference copy of the PostGIS RPC used by notify-companies and process-matches.
-- Filters verified+active companies within `radius_miles` of `point`, and
-- (when `move_type` is provided) only companies whose service_areas.types
-- JSONB array contains that move type. Pass move_type=NULL to skip the
-- type filter (legacy behaviour).

CREATE OR REPLACE FUNCTION find_companies_within_radius(
  point geometry,
  radius_miles float,
  move_type text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  distance float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    companies.id,
    ST_Distance(
      companies.location::geography,
      point::geography
    ) * 0.000621371 AS distance -- meters to miles
  FROM companies
  WHERE ST_DWithin(
    companies.location::geography,
    point::geography,
    radius_miles * 1609.34  -- miles to meters
  )
  AND companies.is_verified = true
  AND companies.is_active = true
  AND (
    move_type IS NULL
    OR (companies.service_areas ? 'types' AND companies.service_areas->'types' ? move_type)
  )
  ORDER BY distance ASC;
END;
$$;
