
-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.check_confirmation_token(text);

-- Recreate the function with proper return type
CREATE OR REPLACE FUNCTION public.check_confirmation_token(token_param text)
RETURNS TABLE (
    is_valid boolean,
    company_id uuid,
    status public.token_status,
    message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH token_check AS (
        SELECT 
            id,
            company_id,
            status,
            expires_at
        FROM email_confirmations
        WHERE token = token_param
        ORDER BY created_at DESC
        LIMIT 1
    )
    SELECT
        CASE 
            WHEN token_check.id IS NULL THEN false
            WHEN token_check.status != 'pending' THEN false
            WHEN token_check.expires_at < now() THEN false
            ELSE true
        END as is_valid,
        token_check.company_id,
        token_check.status,
        CASE 
            WHEN token_check.id IS NULL THEN 'Invalid token'::text
            WHEN token_check.status != 'pending' THEN 'Token already used'::text
            WHEN token_check.expires_at < now() THEN 'Token expired'::text
            ELSE 'Valid token'::text
        END as message
    FROM token_check;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_confirmation_token(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_confirmation_token(text) TO service_role;
