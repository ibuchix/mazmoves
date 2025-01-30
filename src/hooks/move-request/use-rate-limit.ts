import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export async function checkRateLimit() {
  const { toast } = useToast();
  
  // Get client IP for rate limiting
  const { data: { ip_address } } = await supabase.functions.invoke('get-client-ip');
  
  // Check rate limits
  const { data: rateCheck, error: rateError } = await supabase.rpc(
    'check_rate_limit',
    { 
      p_company_id: null, // null for anonymous users
      p_limit_type: 'hourly'
    }
  );

  if (rateError) {
    throw rateError;
  }

  if (!rateCheck) {
    toast({
      title: "Rate Limit Exceeded",
      description: "You've submitted too many requests. Please try again later.",
      variant: "destructive"
    });
    return false;
  }

  return true;
}

export async function logRateLimit() {
  await supabase.from('rate_limit_logs').insert({
    company_id: null, // null for anonymous users
    limit_type: 'hourly'
  });
}