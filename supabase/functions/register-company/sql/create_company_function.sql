CREATE OR REPLACE FUNCTION create_company_bypass_rls(company_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
BEGIN
  INSERT INTO companies (
    name,
    registration_number,
    contact_email,
    contact_phone,
    business_address,
    manager_name,
    insurance_docs,
    latitude,
    longitude,
    auth_user_id,
    registration_status
  )
  SELECT
    (company_data->>'name')::text,
    (company_data->>'registration_number')::text,
    (company_data->>'contact_email')::text,
    (company_data->>'contact_phone')::text,
    (company_data->>'business_address')::jsonb,
    (company_data->>'manager_name')::text,
    (company_data->>'insurance_docs')::jsonb,
    (company_data->>'latitude')::numeric,
    (company_data->>'longitude')::numeric,
    (company_data->>'auth_user_id')::uuid,
    (company_data->>'registration_status')::text;

  -- Ignore any errors from the dashboard refresh
  BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY admin_dashboard_mv;
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the transaction
    RAISE NOTICE 'Failed to refresh dashboard: %', SQLERRM;
  END;
END;
$$;

-- Grant execute permission to the service role
GRANT EXECUTE ON FUNCTION create_company_bypass_rls TO service_role;