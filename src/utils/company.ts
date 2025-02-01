import { supabase } from "@/integrations/supabase/client";
import { CompanyRegistrationForm } from "@/types/company";
import { createAuthUser } from "@/utils/auth";
import { geocodeAddress } from "@/utils/geocoding";
import { uploadCompanyDocument } from "@/utils/fileUpload";

export async function createCompanyRecord(data: CompanyRegistrationForm, authUserId: string) {
  console.log('Starting company record creation for auth user:', authUserId);

  // Create user record first
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: authUserId,
      email: data.email,
      full_name: data.managerName,
      role: 'company',
      phone: data.phone,
      address: data.address
    });

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
  const { error: insertError } = await supabase.functions.invoke('register-company', {
    body: {
      companyData,
      insuranceDocs: data.insurance_docs
    }
  });

  if (insertError) {
    console.error('Company creation error:', insertError);
    throw insertError;
  }
  
  console.log('Company record created successfully');
}

export async function sendWelcomeEmail(email: string, companyName: string): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase.functions.invoke('send-welcome-email', {
      body: { 
        email,
        companyName
      }
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false };
  }
}