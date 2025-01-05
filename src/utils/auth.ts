import { supabase } from "@/integrations/supabase/client";

export async function createAuthUser(email: string, password: string) {
  console.log('Creating auth user for email:', email);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'company'
      }
    }
  });

  if (error) {
    console.error('Auth user creation error:', error);
    throw error;
  }

  // Wait for user record to be fully created
  console.log('Waiting for user record creation...');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Verify the user was created
  console.log('Verifying user creation...');
  const { data: userData, error: userCheckError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (userCheckError) {
    console.error('User verification error:', userCheckError);
    throw new Error('Failed to verify user creation');
  }

  if (!userData) {
    console.error('User record not found after creation');
    throw new Error('User record not found after creation. Please try again or contact support.');
  }

  console.log('User verified successfully:', userData);
  return data;
}