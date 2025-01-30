import { createClient } from '@supabase/supabase-js';

interface AuthResult {
  userId: string;
  error?: Error;
}

export async function handleAuthentication(
  supabase: any,
  email: string, 
  password: string,
  existingUsers: any
): Promise<AuthResult> {
  const existingUser = existingUsers?.users.find(u => u.email === email);
  let userId: string;

  if (existingUser) {
    if (!existingUser.banned_until && !existingUser.deleted_at) {
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('auth_user_id', existingUser.id)
        .single();
          
      if (existingCompany) {
        throw new Error('A company is already registered with this account');
      }
      userId = existingUser.id;
    } else {
      // Create new user if previous one was soft-deleted
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { role: 'company' }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user data returned');
      userId = authData.user.id;
    }
  } else {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { role: 'company' }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user data returned');
    userId = authData.user.id;
  }

  return { userId };
}