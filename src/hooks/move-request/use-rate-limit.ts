import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export async function checkRateLimit() {
  const { toast } = useToast();
  
  console.log('Checking rate limits...');
  
  // Check rate limits
  const { data: rateCheck, error: rateError } = await supabase.rpc(
    'check_rate_limit',
    { 
      p_company_id: null, // null for anonymous users
      p_limit_type: 'hourly'
    }
  );

  if (rateError) {
    console.error('Rate limit check error:', rateError);
    throw rateError;
  }

  if (!rateCheck) {
    console.log('Rate limit exceeded');
    toast({
      title: "Rate Limit Exceeded",
      description: "You've submitted too many requests. Please try again later.",
      variant: "destructive"
    });
    return false;
  }

  console.log('Rate limit check passed');
  return true;
}

export async function logRateLimit() {
  console.log('Logging rate limit usage');
  
  await supabase.from('rate_limit_logs').insert({
    company_id: null, // null for anonymous users
    limit_type: 'hourly'
  });
}