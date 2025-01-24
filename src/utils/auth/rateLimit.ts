import { supabase } from "@/integrations/supabase/client";

export async function checkVerificationRateLimit(email: string) {
  try {
    // Get client IP using a more reliable method
    const { data: { ip_address }, error: ipError } = await supabase.functions.invoke('get-client-ip', {
      method: 'POST'
    });

    if (ipError) throw ipError;

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