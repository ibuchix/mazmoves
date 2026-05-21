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
    ) * 0.000621371 AS distance
  FROM companies
  WHERE ST_DWithin(
    companies.location::geography,
    point::geography,
    radius_miles * 1609.34
  )
  AND companies.is_verified = true
  AND companies.is_active = true
  AND (
    move_type IS NULL
    OR NOT (companies.service_areas ? 'types')
    OR jsonb_typeof(companies.service_areas->'types') <> 'array'
    OR jsonb_array_length(companies.service_areas->'types') = 0
    OR companies.service_areas->'types' ? move_type
  )
  ORDER BY distance ASC;
END;
$$;