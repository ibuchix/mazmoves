
-- Create security audit logs table
CREATE TABLE IF NOT EXISTS security_audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    action text NOT NULL,
    resource text NOT NULL,
    resource_id text,
    user_id uuid,
    ip_address text,
    user_agent text,
    details jsonb,
    severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_action ON security_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_resource ON security_audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at ON security_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_severity ON security_audit_logs(severity);

-- Enable RLS
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admin can view audit logs"
    ON security_audit_logs FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role = 'admin'
    ));

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
    ON security_audit_logs FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Create enhanced rate limiting function
CREATE OR REPLACE FUNCTION check_rate_limit_v2(
    p_identifier text,
    p_action text,
    p_max_attempts integer DEFAULT 5,
    p_window_minutes integer DEFAULT 60
)
RETURNS TABLE(allowed boolean, remaining integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count integer;
    v_remaining integer;
BEGIN
    -- Clean up old entries
    DELETE FROM auth_rate_limits 
    WHERE last_attempt_at < now() - (p_window_minutes || ' minutes')::interval;
    
    -- Count current attempts
    SELECT COUNT(*) INTO v_count
    FROM auth_rate_limits
    WHERE email = p_identifier
    AND last_attempt_at > now() - (p_window_minutes || ' minutes')::interval;
    
    v_remaining := GREATEST(0, p_max_attempts - v_count);
    
    RETURN QUERY SELECT 
        v_count < p_max_attempts as allowed,
        v_remaining as remaining;
END;
$$;

-- Create function to record rate limit attempts
CREATE OR REPLACE FUNCTION record_rate_limit_attempt(
    p_identifier text,
    p_action text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO auth_rate_limits (email, last_attempt_at)
    VALUES (p_identifier, now())
    ON CONFLICT (email) DO UPDATE 
    SET attempt_count = auth_rate_limits.attempt_count + 1,
        last_attempt_at = now();
END;
$$;

-- Grant necessary permissions
GRANT ALL ON security_audit_logs TO service_role;
GRANT SELECT ON security_audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit_v2(text, text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION record_rate_limit_attempt(text, text) TO authenticated;
