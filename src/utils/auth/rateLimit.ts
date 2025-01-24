import { supabase } from "@/integrations/supabase/client";

export async function checkVerificationRateLimit(email: string) {
  try {
    // Get client IP for rate limiting
    const { data: { ip_address } } = await supabase.functions.invoke('get-client-ip');

    // Check rate limit before sending
    const { data: rateCheck, error: rateError } = await supabase.rpc(
      'check_verification_rate_limit',
      { 
        p_email: email,
        p_ip: ip_address 
      }
    );

    if (rateError) throw rateError;
    return { allowed: rateCheck, ip_address };

  } catch (error) {
    console.error("Rate limit check error:", error);
    throw error;
  }
}