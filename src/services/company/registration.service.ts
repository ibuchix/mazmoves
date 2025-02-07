
import { supabase } from "@/integrations/supabase/client";
import { CompanyRegistrationForm } from "@/types/company";

export async function registerCompany(data: CompanyRegistrationForm) {
  console.log('Starting company registration process...', { 
    name: data.name, 
    email: data.email,
    has_password: !!data.password // Log password presence without exposing value
  });
  
  try {
    // Format the address object correctly
    const formattedAddress = {
      street: data.address.street,
      city: data.address.city,
      state: data.address.state,
      zipCode: data.address.zipCode
    };

    // Ensure all required fields are included in the correct structure
    const companyData = {
      name: data.name,
      registration_number: data.registrationNumber,
      contact_email: data.email,
      contact_phone: data.phone,
      business_address: formattedAddress,
      manager_name: data.managerName,
      password: data.password, // Explicitly include password
      auth_user_id: null, // This will be set by the edge function
      latitude: null,
      longitude: null
    };

    // Register the company with all required fields
    const { data: response, error: registerError } = await supabase.functions.invoke(
      'register-company-v2',
      {
        body: { companyData }
      }
    );
    
    if (registerError) {
      console.error('Company registration error:', registerError);
      throw registerError;
    }

    console.log('Registration successful:', response);
    return response;

  } catch (error: any) {
    console.error('Registration error:', error);
    // Check for specific error types
    if (error.message?.includes('already exists')) {
      throw new Error('A company with this email already exists');
    }
    throw error;
  }
}

