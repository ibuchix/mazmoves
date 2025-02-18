
import { supabase } from "@/integrations/supabase/client";

export async function sendConfirmationEmail(email: string, fullName: string) {
  const { error: confirmationError } = await supabase.functions.invoke('send-confirmation-email', {
    body: { 
      customerEmail: email,
      customerName: fullName
    }
  });

  if (confirmationError) {
    console.error("Error sending confirmation email:", confirmationError);
  }
}

export async function notifyCompanies(requestId: string) {
  const { error: notifyError } = await supabase.functions.invoke('notify-companies', {
    body: { requestId }
  });

  if (notifyError) {
    throw notifyError;
  }
}
