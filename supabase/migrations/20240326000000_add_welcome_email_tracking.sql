
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS welcome_email_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS welcome_email_sent_at timestamp with time zone;

-- Create function to mark welcome email as sent
CREATE OR REPLACE FUNCTION public.mark_welcome_email_sent(company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE companies
    SET 
        welcome_email_sent = true,
        welcome_email_sent_at = NOW()
    WHERE id = company_id;
END;
$$;
