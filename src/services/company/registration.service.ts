
import { supabase } from "@/integrations/supabase/client";
import { CompanyRegistrationForm } from "@/types/company";

export async function registerCompany(data: CompanyRegistrationForm) {
  try {
    console.log('Starting company registration with data:', { 
      name: data.name,
      email: data.email,
      // Exclude password from logging
    });

    const formattedAddress = {
      street: data.address.street,
      city: data.address.city,
      state: data.address.state,
      zipCode: data.address.zipCode
    };

    // Format data to match the expected CompanyRegistrationData type
    const registrationData = {
      name: data.name,
      registration_number: data.registrationNumber,
      contact_email: data.email,
      contact_phone: data.phone,
      business_address: formattedAddress,
      manager_name: data.managerName,
      password: data.password,
      auth_user_id: null,
      latitude: null,
      longitude: null
    };

    console.log('Calling register-company-v2 edge function...');
    
    const { data: response, error: registerError } = await supabase.functions.invoke(
      'register-company-v2',
      {
        body: registrationData
      }
    );

    if (registerError) {
      console.error('Registration error:', registerError);
      throw registerError;
    }

    console.log('Registration successful');
    return response;

  } catch (error: any) {
    console.error('Registration failed:', error);
    
    // Enhanced error handling
    if (error.message?.includes('already exists')) {
      throw new Error('A company with this email already exists');
    }
    
    // Check for validation errors from the edge function
    try {
      const errorBody = JSON.parse(error.body);
      if (errorBody.error === 'Validation failed') {
        throw new Error(errorBody.details.join(', '));
      }
    } catch (e) {
      // If JSON parsing fails, throw the original error
    }
    
    throw error;
  }
}
