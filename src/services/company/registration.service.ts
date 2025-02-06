import { supabase } from "@/integrations/supabase/client";
import { CompanyRegistrationForm } from "@/types/company";

export async function registerCompany(data: CompanyRegistrationForm) {
  console.log('Starting company registration process...');
  
  try {
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

    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }
    
    if (!authData.user) {
      throw new Error('No user returned from auth signup');
    }

    // Wait a short moment to ensure the auth user is fully created
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Register the company using the new v2 endpoint
    const { data: response, error: registerError } = await supabase.functions.invoke(
      'register-company-v2',
      {
        body: {
          companyData: {
            name: data.name,
            registration_number: data.registrationNumber,
            contact_email: data.email,
            contact_phone: data.phone,
            business_address: data.address,
            manager_name: data.managerName,
            auth_user_id: authData.user.id,
            latitude: null, // Will be set by geocoding trigger
            longitude: null // Will be set by geocoding trigger
          }
        }
      }
    );
    
    if (registerError) {
      console.error('Company registration error:', registerError);
      throw registerError;
    }

    console.log('Registration successful:', response);
    return { authData, response };

  } catch (error: any) {
    console.error('Registration error:', error);
    // Check for specific error types
    if (error.message?.includes('already exists')) {
      throw new Error('A company with this email already exists');
    }
    throw error;
  }
}