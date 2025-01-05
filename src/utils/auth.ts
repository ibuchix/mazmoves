import { supabase } from "@/integrations/supabase/client";

export async function createAuthUser(email: string, password: string) {
  console.log('Creating auth user for email:', email);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'company'
      },
      emailRedirectTo: window.location.origin + '/company/dashboard'
    }
  });

  if (error) {
    console.error('Auth user creation error:', error);
    throw error;
  }

  // Wait longer for user record creation...
  console.log('Waiting for user record creation...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Multiple attempts to verify user creation with exponential backoff
  console.log('Verifying user creation...');
  for (let i = 0; i < 5; i++) {
    const { data: userData, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (!userCheckError && userData) {
      console.log('User verified successfully:', userData);
      return data;
    }

    console.log(`Attempt ${i + 1} failed, retrying...`);
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
  }

  console.error('User record not found after multiple attempts');
  throw new Error('User record not found after creation. Please try again or contact support.');
}