
import { supabase } from "@/integrations/supabase/client";
import { CompanyRegistrationForm } from "@/types/company";

export async function registerCompany(data: CompanyRegistrationForm) {
  try {
    const formattedAddress = {
      street: data.address.street,
      city: data.address.city,
      state: data.address.state,
      zipCode: data.address.zipCode
    };

    const companyData = {
      name: data.name,
      registration_number: data.registrationNumber,
      contact_email: data.email,
      contact_phone: data.phone,
      business_address: formattedAddress,
      manager_name: data.managerName,
      password: data.password, // ✅ Password included
      auth_user_id: null,
      latitude: null,
      longitude: null
    };

    // Key fix: Remove "companyData" wrapper
    const { data: response, error: registerError } = await supabase.functions.invoke(
      'register-company-v2',
      {
        body: companyData // 👈 Directly pass the object
      }
    );

    if (registerError) {
      console.error('Registration error:', registerError);
      throw registerError;
    }

    return response;

  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      throw new Error('A company with this email already exists');
    }
    throw error;
  }
}
