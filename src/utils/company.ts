import { supabase } from "@/integrations/supabase/client";
import { CompanyRegistrationForm } from "@/types/company";
import { geocodeAddress } from "./geocoding";
import { uploadCompanyDocument } from "./fileUpload";

export async function createCompanyRecord(data: CompanyRegistrationForm, authUserId: string) {
  console.log('Starting company record creation for auth user:', authUserId);

  const transitInsuranceInput = document.getElementById('transitInsurance') as HTMLInputElement;
  const liabilityInsuranceInput = document.getElementById('liabilityInsurance') as HTMLInputElement;
  
  console.log('Checking insurance documents...');
  if (!transitInsuranceInput?.files?.length || !liabilityInsuranceInput?.files?.length) {
    throw new Error('Insurance documents are required');
  }

  console.log('Uploading transit insurance document...');
  const transitInsurancePath = await uploadCompanyDocument(
    transitInsuranceInput.files[0],
    'transit'
  );
  console.log('Transit insurance uploaded:', transitInsurancePath);
  
  console.log('Uploading liability insurance document...');
  const liabilityInsurancePath = await uploadCompanyDocument(
    liabilityInsuranceInput.files[0],
    'liability'
  );
  console.log('Liability insurance uploaded:', liabilityInsurancePath);

  // Geocode the company's address
  console.log('Geocoding company address...');
  const coordinates = await geocodeAddress(data.address);
  console.log('Address geocoded:', coordinates);

  console.log('Creating company record in database...');
  const { error: insertError } = await supabase
    .from('companies')
    .insert({
      name: data.name,
      registration_number: data.registrationNumber,
      vat_number: data.vatNumber || null,
      contact_email: data.email,
      contact_phone: data.phone,
      business_address: data.address,
      manager_name: data.managerName,
      insurance_docs: [
        { type: 'transit', path: transitInsurancePath },
        { type: 'liability', path: liabilityInsurancePath }
      ],
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      location: coordinates.location,
      auth_user_id: authUserId
    });

  if (insertError) {
    console.error('Company creation error:', insertError);
    throw insertError;
  }
  
  console.log('Company record created successfully');
}

export async function sendWelcomeEmail(email: string, companyName: string): Promise<{ success: boolean }> {
  console.log('Sending welcome email to:', email);
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