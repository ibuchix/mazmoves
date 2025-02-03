import { CompanyRegistrationForm } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";

export async function validateRegistration(data: CompanyRegistrationForm) {
  // Check rate limits
  const { data: rateLimitCheck } = await supabase.rpc('check_registration_limit', {
    check_ip: 'client', // IP is handled server-side
    check_email: data.email
  });

  if (!rateLimitCheck) {
    throw new Error('rate limit exceeded');
  }

  // Check country support
  const { data: countryCheck } = await supabase.rpc('is_country_allowed', {
    check_code: data.country_code
  });

  if (!countryCheck) {
    throw new Error('country not supported');
  }
}