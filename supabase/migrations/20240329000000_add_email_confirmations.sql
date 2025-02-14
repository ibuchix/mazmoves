
-- Create email confirmation token type
CREATE TYPE public.token_status AS ENUM ('pending', 'used', 'expired');

-- Create email_confirmations table
CREATE TABLE IF NOT EXISTS public.email_confirmations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    token text NOT NULL,
    status token_status DEFAULT 'pending',
    expires_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    confirmed_at timestamptz,
    ip_address text
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_email_confirmations_company_id ON email_confirmations(company_id);
CREATE INDEX IF NOT EXISTS idx_email_confirmations_token ON email_confirmations(token);
CREATE INDEX IF NOT EXISTS idx_email_confirmations_status ON email_confirmations(status);

-- Add timestamps trigger
CREATE TRIGGER update_email_confirmations_updated_at
    BEFORE UPDATE ON email_confirmations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE public.email_confirmations ENABLE ROW LEVEL SECURITY;

-- Allow companies to view their own confirmation tokens
CREATE POLICY "Companies can view their own confirmation tokens"
    ON public.email_confirmations
    FOR SELECT
    TO authenticated
    USING (auth.uid() IN (
        SELECT auth_user_id 
        FROM companies 
        WHERE companies.id = email_confirmations.company_id
    ));

-- Allow the service role to manage all tokens
CREATE POLICY "Service role can manage all tokens"
    ON public.email_confirmations
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON TABLE email_confirmations TO service_role;
GRANT SELECT ON TABLE email_confirmations TO authenticated;

-- Add columns to companies table for email verification status
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS email_verification_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS email_verified_at timestamptz;

-- Create function to check token validity
CREATE OR REPLACE FUNCTION check_confirmation_token(token_param text)
RETURNS TABLE (
    is_valid boolean,
    company_id uuid,
    status token_status,
    message text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
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
            WHEN token_check.id IS NULL THEN 'Invalid token'
            WHEN token_check.status != 'pending' THEN 'Token already used'
            WHEN token_check.expires_at < now() THEN 'Token expired'
            ELSE 'Valid token'
        END as message
    FROM token_check;
END;
$$;
