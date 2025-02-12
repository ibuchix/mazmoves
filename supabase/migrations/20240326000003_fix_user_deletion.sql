
-- First drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Create a more robust handle_deleted_user function
CREATE OR REPLACE FUNCTION public.handle_deleted_user()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER 
AS $$
BEGIN
    -- Delete related records from companies table
    DELETE FROM companies WHERE auth_user_id = OLD.id;
    
    -- Delete from public.users table
    DELETE FROM public.users WHERE id = OLD.id;
    
    -- Delete any related move requests
    DELETE FROM move_requests WHERE customer_id = OLD.id;
    
    -- Return the OLD record to complete the trigger
    RETURN OLD;
END;
$$;

-- Recreate the trigger with proper permissions
CREATE TRIGGER on_auth_user_deleted
    BEFORE DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_deleted_user();

-- Set up cascade deletes for move_assignments
ALTER TABLE IF EXISTS move_assignments
    DROP CONSTRAINT IF EXISTS move_assignments_company_id_fkey,
    ADD CONSTRAINT move_assignments_company_id_fkey 
    FOREIGN KEY (company_id) 
    REFERENCES companies(id) 
    ON DELETE CASCADE;

-- Set up cascade deletes for company related tables
ALTER TABLE IF EXISTS company_payments
    DROP CONSTRAINT IF EXISTS company_payments_company_id_fkey,
    ADD CONSTRAINT company_payments_company_id_fkey 
    FOREIGN KEY (company_id) 
    REFERENCES companies(id) 
    ON DELETE CASCADE;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;
