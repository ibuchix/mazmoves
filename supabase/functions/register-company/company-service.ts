import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export async function createCompanyRecord(
  supabase: any,
  companyData: any
) {
  console.log('Creating company record with data:', {
    ...companyData,
    contact_phone: '[REDACTED]',
    registration_number: '[REDACTED]'
  });

  // Check for existing admin company
  const { data: existingAdmin } = await supabase
    .from('companies')
    .select('id')
    .eq('contact_email', companyData.contact_email.toLowerCase())
    .eq('registration_status', 'admin')
    .single();

  if (existingAdmin) {
    throw new Error('A company with this email already exists');
  }

  // Clean up any existing non-admin company records
  const { error: cleanupError } = await supabase
    .from('companies')
    .delete()
    .eq('contact_email', companyData.contact_email.toLowerCase())
    .neq('registration_status', 'admin');

  if (cleanupError) {
    console.error('Error cleaning up existing company:', cleanupError);
    // Continue anyway as this is not critical
  }

  const { error: companyError } = await supabase.rpc('create_company_bypass_rls', {
    company_data: companyData
  });

  if (companyError) {
    console.error('Company creation error:', companyError);
    if (companyError.message.includes('duplicate key')) {
      throw new Error('A company with this email already exists');
    }
    throw companyError;
  }

  console.log('Company record created successfully');
}

export async function createUserRecord(
  supabase: any,
  userId: string,
  email: string,
  managerName: string,
  phone: string,
  address: any
) {
  console.log('Creating user record for:', email);

  const { error: userError } = await supabase
    .from('users')
    .upsert({
      id: userId,
      email: email,
      full_name: managerName,
      role: 'company',
      phone: phone,
      address: address
    });

  if (userError) {
    console.error('Error creating/updating user record:', userError);
    throw userError;
  }

  console.log('User record created successfully');
}