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
  } catch (error: any) {
    console.error('Validation error:', error);
    throw error;
  }
}