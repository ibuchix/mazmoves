import { CompanyRegistrationForm } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function validateRegistration(data: CompanyRegistrationForm) {
  try {
    // Check rate limits
    const { data: rateLimitCheck, error: rateLimitError } = await supabase.rpc('check_registration_limit', {
      check_ip: 'client', // IP is handled server-side
      check_email: data.email
    });

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
      throw new Error('rate limit exceeded');
    }

    if (!rateLimitCheck) {
      throw new Error('rate limit exceeded');
    }

    // Check country support
    const { data: countryCheck, error: countryError } = await supabase.rpc('is_country_allowed', {
      check_code: data.country_code
    });

    if (countryError) {
      console.error('Country check error:', countryError);
      throw new Error('country not supported');
    }

    if (!countryCheck) {
      throw new Error('country not supported');
    }
  } catch (error: any) {
    console.error('Validation error:', error);
    throw error;
  }
}