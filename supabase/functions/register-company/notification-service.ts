import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export async function sendWelcomeEmail(
  supabase: any,
  email: string,
  companyName: string,
  confirmationLink: string
) {
  try {
    await supabase.functions.invoke('send-welcome-email', {
      body: { 
        email,
        companyName,
        confirmationLink
      }
    });
  } catch (emailError) {
    console.error('Welcome email error:', emailError);
    // Don't fail registration if email fails
  }
}

export async function generateConfirmationLink(
  supabase: any,
  email: string
) {
  const { data: confirmData, error: confirmError } = await supabase.auth.admin.generateLink({
    type: 'signup',
    email: email,
    options: {
      redirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify`
    }
  });

  if (confirmError) {
    console.error('Error generating confirmation link:', confirmError);
    throw confirmError;
  }

  return confirmData;
}