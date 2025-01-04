import { supabase } from "@/integrations/supabase/client";

export async function createAuthUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'company'
      }
    }
  });

  if (error) throw error;

  // Wait for user record to be fully created
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Verify the user was created
  const { data: userData, error: userCheckError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (userCheckError || !userData) {
    throw new Error('Failed to verify user creation');
  }

  return data;
}