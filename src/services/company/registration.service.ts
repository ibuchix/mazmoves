
import { supabase } from "@/integrations/supabase/client";
import { CompanyRegistrationForm } from "@/types/company";

export async function registerCompany(data: CompanyRegistrationForm) {
  try {
    console.log('Registration service started with data:', { 
      name: data.name,
      email: data.email,
      registrationNumber: data.registrationNumber,
      hasAddress: !!data.address,
      addressFields: Object.keys(data.address || {})
    });

    // Format data to match the expected CompanyRegistrationData type
    const registrationData = {
      name: data.name,
      registration_number: data.registrationNumber || null, // Make optional
      contact_email: data.email,
      contact_phone: data.phone,
      business_address: {
        street: data.address.street,
        city: data.address.city,
        state: data.address.state,
        zipCode: data.address.zipCode
      },
      manager_name: data.managerName,
      password: data.password
    };

    console.log('Calling register-company-v2 edge function with data:', {
      ...registrationData,
      password: '[REDACTED]'
    });
    
    const { data: response, error: registerError } = await supabase.functions.invoke(
      'register-company-v2',
      {
        body: registrationData
      }
    );

    if (registerError) {
      console.error('Edge function error:', registerError);
      
      // Try to parse error details if available
      try {
        const errorDetails = JSON.parse(registerError.message);
        if (errorDetails.error === 'Validation failed') {
          throw new Error(errorDetails.details.join(', '));
        }
        throw new Error(errorDetails.error || errorDetails.message || registerError.message);
      } catch (parseError) {
        // If parsing fails, throw the original error
        throw registerError;
      }
    }

    if (!response?.success) {
      console.error('Registration failed with response:', response);
      throw new Error(response?.message || 'Registration failed');
    }

    console.log('Registration successful:', response);
    return response;

  } catch (error: any) {
    console.error('Registration service error:', error);
    
    // Handle specific error cases
    if (typeof error.message === 'string') {
      if (error.message.includes('already exists')) {
        throw new Error('A company with this email already exists');
      }
      if (error.message.includes('rate limit')) {
        throw new Error('Too many registration attempts. Please try again later');
      }
      if (error.message.includes('validation')) {
        throw new Error(error.message);
      }
    }
    
    // For unexpected errors
    throw new Error(error.message || 'An unexpected error occurred during registration');
  }
}
