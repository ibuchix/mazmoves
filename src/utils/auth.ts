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

  // Wait longer for initial user record creation
  console.log('Waiting for user record creation...');
  await new Promise(resolve => setTimeout(resolve, 8000));

  // Multiple attempts to verify user creation with exponential backoff
  console.log('Verifying user creation...');
  for (let i = 0; i < 5; i++) {
    const { data: userData, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (userCheckError) {
      console.error(`Database query failed on attempt ${i + 1}:`, userCheckError);
      if (i < 4) {
        const delay = Math.pow(2, i) * 1000;
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw new Error('Database error while verifying user creation. Please try again.');
    }

    if (userData) {
      console.log('User verified successfully:', userData);
      return data;
    }

    if (i < 4) {
      const delay = Math.pow(2, i) * 1000;
      console.log(`User record not found, attempt ${i + 1}. Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Registration incomplete - please try logging in after a few minutes. If issues persist, contact support.');
}