
import { supabase } from "@/integrations/supabase/client";

export async function verifyRegistration(authUserId: string, companyId: string) {
  const { data: verificationData, error: verificationError } = await supabase.rpc(
    'verify_registration_completion',
    {
      p_auth_user_id: authUserId,
      p_company_id: companyId
    }
  );

  if (verificationError) throw verificationError;
  if (!verificationData) {
    throw new Error('Registration verification failed - some components were not created properly');
  }

  return verificationData;
}
