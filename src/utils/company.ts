import { supabase } from "@/integrations/supabase/client";
import { CompanyRegistrationForm } from "@/types/company";
import { createAuthUser } from "@/utils/auth";
import { geocodeAddress } from "@/utils/geocoding";

export async function createCompanyRecord(data: CompanyRegistrationForm, authUserId: string | null) {
  console.log('Starting company record creation for auth user:', authUserId);

  // Create user record using the secure function
  const { error: userError } = await supabase.rpc(
    'create_new_user',
    {
      user_id: authUserId,
      user_email: data.email,
      user_full_name: data.managerName,
      user_role: 'company'
    }
  );

  if (userError) {
    console.error('Error creating user record:', userError);
    throw new Error('Failed to create user record');
  }

  // Geocode the company's address
  console.log('Geocoding company address...');
  const coordinates = await geocodeAddress(data.address);
  console.log('Address geocoded:', coordinates);

  // Prepare company data
  const companyData = {
    name: data.name,
    registration_number: data.registrationNumber,
    vat_number: data.vatNumber || null,
    contact_email: data.email,
    contact_phone: data.phone,
    business_address: data.address,
    manager_name: data.managerName,
    country_code: data.country_code,
    country_name: data.country_name,
    latitude: coordinates?.latitude,
    longitude: coordinates?.longitude,
    auth_user_id: authUserId,
    registration_status: 'pending'
  };

  console.log('Creating company record in database...');
  const { data: response, error: insertError } = await supabase.functions.invoke('register-company', {
    body: { companyData }
  });

  if (insertError) {
    console.error('Company creation error:', insertError);
    // Check for specific error types
    if (insertError.message.includes('already exists')) {
      throw new Error('A company with this email already exists');
    } else if (insertError.message.includes('validation')) {
      throw new Error('Invalid company data provided');
    }
    throw insertError;
  }
  
  console.log('Company record created successfully:', response);
  return response;
}