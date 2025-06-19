
-- Remove plaintext password columns from companies table
ALTER TABLE companies 
DROP COLUMN IF EXISTS password,
DROP COLUMN IF EXISTS password_hash;

-- Remove the password check trigger since we're using Supabase auth
DROP TRIGGER IF EXISTS check_company_password_trigger ON companies;
DROP FUNCTION IF EXISTS check_company_password();

-- Add proper RLS policies for email_confirmations table
DROP POLICY IF EXISTS "Allow insert for pending confirmations" ON email_confirmations;
DROP POLICY IF EXISTS "Allow delete for expired confirmations" ON email_confirmations;

CREATE POLICY "Allow insert for pending confirmations"
    ON email_confirmations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IN (
        SELECT auth_user_id 
        FROM companies 
        WHERE companies.id = email_confirmations.company_id
    ));

CREATE POLICY "Allow delete for expired confirmations"
    ON email_confirmations FOR DELETE
    TO authenticated
    USING (auth.uid() IN (
        SELECT auth_user_id 
        FROM companies 
        WHERE companies.id = email_confirmations.company_id
    ) OR expires_at < now());

-- Add missing RLS policies for other sensitive tables
ALTER TABLE registration_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view registration attempts"
    ON registration_attempts FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role = 'admin'
    ));

-- Add rate limiting table policies
ALTER TABLE auth_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits"
    ON auth_rate_limits FOR SELECT
    TO authenticated
    USING (email = auth.email());

CREATE POLICY "Service role can manage rate limits"
    ON auth_rate_limits FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Remove overly permissive public grants
REVOKE ALL ON companies FROM public;
REVOKE ALL ON users FROM public;
REVOKE ALL ON move_requests FROM public;

-- Ensure proper grants for authenticated users only
GRANT SELECT ON companies TO authenticated;
GRANT SELECT ON users TO authenticated;
GRANT SELECT, INSERT ON move_requests TO authenticated;
GRANT SELECT, INSERT ON move_requests TO anon; -- Only for public move request submission
