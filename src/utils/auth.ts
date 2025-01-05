import { supabase } from "@/integrations/supabase/client";

export async function createAuthUser(email: string, password: string) {
  console.log('Creating auth user for email:', email);
  
  // First create the auth user
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

  console.log('Auth user created successfully:', data.user.id);

  // The users table insert will be handled by a trigger in Supabase
  // that creates the user record when a new auth user is created
  return data;
}