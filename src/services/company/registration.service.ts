import { supabase } from "@/integrations/supabase/client";
import { CompanyRegistrationForm } from "@/types/company";

export async function registerCompany(data: CompanyRegistrationForm) {
  console.log('Starting company registration process...');
  
  // Create auth user first
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.managerName,
        role: 'company'
      }
    }
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('No user returned from auth signup');

  // Wait a short moment to ensure the auth user is fully created
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Register the company using secure function
  const { data: response, error: registerError } = await supabase.rpc(
    'register_company',
    {
      company_data: {
        name: data.name,
        registration_number: data.registrationNumber,
        contact_phone: data.phone,
        business_address: data.address,
        manager_name: data.managerName,
        country_code: data.country_code,
        country_name: data.country_name,
        latitude: null,
        longitude: null
      },
      auth_user_id: authData.user.id,
      user_email: data.email,
      user_full_name: data.managerName
    }
  );
  
  if (registerError) throw registerError;
  
  return { authData, response };
}