import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface CompanyData {
  name: string;
  registration_number: string;
  contact_email: string;
  contact_phone: string;
  business_address: any;
  manager_name: string;
  latitude?: number;
  longitude?: number;
  auth_user_id: string;
  registration_status: string;
  country_code: string;
  country_name: string;
  vat_number?: string | null;
}

export async function createCompanyRecord(
  supabase: any,
  companyData: CompanyData
) {
  console.log('Creating company record with data:', {
    ...companyData,
    contact_phone: '[REDACTED]',
    registration_number: '[REDACTED]'
  });

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