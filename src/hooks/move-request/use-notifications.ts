import { supabase } from "@/integrations/supabase/client";

export async function sendConfirmationEmail(email: string, fullName: string) {
  console.log('Sending confirmation email to:', email);
  
  const { error: confirmationError } = await supabase.functions.invoke('send-confirmation-email', {
    body: { 
      customerEmail: email,
      customerName: fullName
    }
  });

  if (confirmationError) {
    console.error("Error sending confirmation email:", confirmationError);
  } else {
    console.log('Confirmation email sent successfully');
  }
}

export async function notifyCompanies(requestId: string) {
  console.log('Notifying companies about request:', requestId);
  
  const { error: notifyError } = await supabase.functions.invoke('notify-companies', {
    body: { requestId }
  });

  if (notifyError) {
    console.error('Error notifying companies:', notifyError);
    throw notifyError;
  }
  
  console.log('Companies notified successfully');
}