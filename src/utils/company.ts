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

  // Upload documents in parallel
  const [transitInsurancePath, liabilityInsurancePath] = await Promise.all([
    uploadCompanyDocument(transitInsuranceInput.files[0], 'transit'),
    uploadCompanyDocument(liabilityInsuranceInput.files[0], 'liability')
  ]);

  console.log('Insurance documents uploaded');

  // Wait for user record to be available
  console.log('Waiting for user record to be created...');
  let retries = 0;
  const maxRetries = 10; // Increased from 5 to 10 for more patience
  let userData = null;
  
  while (retries < maxRetries) {
    const { data: result, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUserId)
      .maybeSingle(); // Changed from single() to maybeSingle()

    if (userError) {
      console.error('Error checking user record:', userError);
      // Continue trying despite errors
    }

    if (result) {
      console.log('User record found:', result);
      userData = result;
      break;
    }

    console.log(`User record not found, attempt ${retries + 1} of ${maxRetries}`);
    retries++;
    // Increased wait time between retries
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between retries
  }

  if (!userData) {
    throw new Error('Failed to verify user record creation after multiple attempts');
  }

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
      auth_user_id: authUserId,
      registration_status: 'pending'
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