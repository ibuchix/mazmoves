
-- Add registration tracking fields
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS registration_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS registration_completed_at TIMESTAMPTZ;

-- Create registration attempts logging
CREATE TABLE IF NOT EXISTS registration_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    client_ip TEXT,
    attempt_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to log registration attempts
CREATE OR REPLACE FUNCTION log_registration_attempt(
    email TEXT,
    client_ip TEXT,
    attempt_data JSONB
) RETURNS VOID AS $$
BEGIN
    INSERT INTO registration_attempts (email, client_ip, attempt_data)
    VALUES (email, client_ip, attempt_data);
END;
$$ LANGUAGE plpgsql;

-- Create transaction helper functions
CREATE OR REPLACE FUNCTION begin_transaction()
RETURNS VOID AS $$
BEGIN
    -- Start a new transaction
    BEGIN;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION commit_transaction()
RETURNS VOID AS $$
BEGIN
    COMMIT;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION rollback_transaction()
RETURNS VOID AS $$
BEGIN
    ROLLBACK;
END;
$$ LANGUAGE plpgsql;
