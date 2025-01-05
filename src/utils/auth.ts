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

  if (!data.user) {
    throw new Error('Failed to create user account - no user data returned');
  }

  // Wait for user record creation...
  console.log('Waiting for user record creation...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Multiple attempts to verify user creation with exponential backoff
  console.log('Verifying user creation...');
  for (let i = 0; i < 5; i++) {
    const { data: userData, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (userCheckError) {
      console.error(`Attempt ${i + 1} failed with error:`, userCheckError);
      if (i < 4) {
        console.log(`Retrying in ${Math.pow(2, i)} seconds...`);
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      throw new Error('Failed to verify user creation. Please try logging in after a few minutes.');
    }

    if (userData) {
      console.log('User verified successfully:', userData);
      return data;
    }

    if (i < 4) {
      console.log(`Attempt ${i + 1} failed, retrying in ${Math.pow(2, i)} seconds...`);
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  throw new Error('User record not found after creation. This could be due to a temporary delay - please try logging in after a few minutes.');
}