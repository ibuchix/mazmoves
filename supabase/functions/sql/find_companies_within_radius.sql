CREATE OR REPLACE FUNCTION find_companies_within_radius(
  point geometry,
  radius_miles float
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
    ) * 0.000621371 AS distance -- Convert meters to miles
  FROM companies
  WHERE ST_DWithin(
    companies.location::geography,
    point::geography,
    radius_miles * 1609.34  -- Convert miles to meters
  )
  AND companies.is_verified = true
  AND companies.is_active = true
  ORDER BY distance ASC;
END;
$$;