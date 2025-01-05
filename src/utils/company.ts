import { supabase } from "@/integrations/supabase/client";
import { CompanyRegistrationForm } from "@/types/company";
import { geocodeAddress } from "./geocoding";
import { uploadCompanyDocument } from "./fileUpload";

export async function createCompanyRecord(data: CompanyRegistrationForm, authUserId: string) {
  const transitInsuranceInput = document.getElementById('transitInsurance') as HTMLInputElement;
  const liabilityInsuranceInput = document.getElementById('liabilityInsurance') as HTMLInputElement;
  
  if (!transitInsuranceInput?.files?.length || !liabilityInsuranceInput?.files?.length) {
    throw new Error('Insurance documents are required');
  }

  const transitInsurancePath = await uploadCompanyDocument(
    transitInsuranceInput.files[0],
    'transit'
  );
  
  const liabilityInsurancePath = await uploadCompanyDocument(
    liabilityInsuranceInput.files[0],
    'liability'
  );

  // Geocode the company's address
  const coordinates = await geocodeAddress(data.address);

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
      auth_user_id: authUserId
    });

  if (insertError) {
    console.error('Company creation error:', insertError);
    throw insertError;
  }
}

export async function sendWelcomeEmail(email: string, companyName: string) {
  const { error } = await supabase.functions.invoke('send-welcome-email', {
    body: { 
      email,
      companyName
    }
  });

  if (error) {
    console.error("Error sending welcome email:", error);
  }
}