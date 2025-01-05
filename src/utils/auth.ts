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

  console.log('Auth user created, now creating user record...');

  // Create user record in public.users table using service role client
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: data.user.id,
      email: data.user.email,
      role: 'company',
      full_name: email // Using email as full_name temporarily
    });

  if (userError) {
    console.error('User record creation error:', userError);
    // If user record creation fails, we should clean up the auth user
    await supabase.auth.admin.deleteUser(data.user.id);
    throw userError;
  }

  console.log('User record created successfully');
  return data;
}