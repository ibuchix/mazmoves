
-- Create email_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    email_type varchar NOT NULL,
    recipient_email varchar NOT NULL,
    status varchar NOT NULL,
    error_message text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_email_logs_company_id ON email_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- Add timestamps trigger
CREATE TRIGGER update_email_logs_updated_at
    BEFORE UPDATE ON email_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON TABLE email_logs TO service_role;
