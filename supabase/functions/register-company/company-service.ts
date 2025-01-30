interface CompanyData {
  name: string;
  registration_number: string;
  contact_email: string;
  contact_phone: string;
  business_address: any;
  manager_name: string;
  insurance_docs: any[];
  latitude?: number;
  longitude?: number;
  auth_user_id: string;
  registration_status: string;
}

export async function createCompanyRecord(
  supabase: any,
  companyData: CompanyData
) {
  const { error: companyError } = await supabase.rpc('create_company_bypass_rls', {
    company_data: companyData
  });

  if (companyError) {
    console.error('Company creation error:', companyError);
    throw companyError;
  }
}

export async function createUserRecord(
  supabase: any,
  userId: string,
  email: string,
  managerName: string,
  phone: string,
  address: any
) {
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
}