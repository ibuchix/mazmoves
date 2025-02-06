-- Drop the duplicate trigger
DROP TRIGGER IF EXISTS handle_country_registration_trigger ON companies;

-- Drop the associated function since it's redundant
DROP FUNCTION IF EXISTS handle_country_registration();