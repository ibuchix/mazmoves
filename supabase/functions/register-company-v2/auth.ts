
import { createClient } from '@supabase/supabase-js';

export async function createAuthUser(supabase: any, email: string, password: string) {
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { role: 'company' }
  });

  if (authError || !authData.user) {
    console.error('Auth user creation failed:', authError);
    throw new Error(authError?.message || 'Failed to create auth user');
  }

  return authData.user;
}

export async function deleteAuthUser(supabase: any, userId: string) {
  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.error('Failed to delete auth user:', deleteError);
    throw new Error(deleteError.message);
  }
}

