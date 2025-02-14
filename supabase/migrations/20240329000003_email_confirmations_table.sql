
-- Drop existing table if it exists
DROP TABLE IF EXISTS public.email_confirmations;

-- Create email_confirmations table with proper types
CREATE TABLE public.email_confirmations (
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

-- Add RLS policies
ALTER TABLE public.email_confirmations ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow users to view their own tokens"
    ON public.email_confirmations FOR SELECT
    TO authenticated
    USING (auth.uid() IN (
        SELECT auth_user_id 
        FROM companies 
        WHERE companies.id = email_confirmations.company_id
    ));

-- Allow update access to authenticated users
CREATE POLICY "Allow users to update their own tokens"
    ON public.email_confirmations FOR UPDATE
    TO authenticated
    USING (auth.uid() IN (
        SELECT auth_user_id 
        FROM companies 
        WHERE companies.id = email_confirmations.company_id
    ));

-- Grant necessary permissions
GRANT SELECT, UPDATE ON public.email_confirmations TO authenticated;
GRANT ALL ON public.email_confirmations TO service_role;
