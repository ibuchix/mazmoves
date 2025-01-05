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

  // Wait longer for user record to be fully created in the database
  console.log('Waiting for user record creation...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Multiple attempts to verify user creation
  console.log('Verifying user creation...');
  for (let i = 0; i < 3; i++) {
    const { data: userData, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (!userCheckError && userData) {
      console.log('User verified successfully:', userData);
      return data;
    }

    // If not found, wait and try again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.error('User record not found after multiple attempts');
  throw new Error('User record not found after creation. Please try again or contact support.');
}