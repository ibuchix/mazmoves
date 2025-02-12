
import { CompanyRegistrationData } from './types.ts';

export async function checkExistingCompany(supabase: any, email: string) {
  const { data: existingCompany, error } = await supabase
    .from('companies')
    .select('id')
    .eq('contact_email', email.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error('Error checking existing company:', error);
    throw new Error('Failed to check existing company');
  }

  if (existingCompany) {
    throw new Error('A company with this email already exists');
  }
}

export async function registerCompany(supabase: any, companyData: CompanyRegistrationData) {
  // First geocode the address
  const geocodedAddress = await geocodeAddress(companyData.business_address);
  
  const companyRecord = {
    ...companyData,
    location: geocodedAddress.location,
    latitude: geocodedAddress.latitude,
    longitude: geocodedAddress.longitude,
    registration_status: 'pending',
    is_active: true,
    is_verified: false
  };

  const { data: company, error: registerError } = await supabase
    .from('companies')
    .insert(companyRecord)
    .select()
    .single();

  if (registerError) {
    console.error('Company creation failed:', registerError);
    throw new Error(registerError.message);
  }

  return company;
}

export async function sendWelcomeEmail(supabase: any, companyId: string, email: string, companyName: string) {
  try {
    const { data: response, error } = await supabase.functions.invoke(
      'send-welcome-email',
      {
        body: {
          companyId,
          email,
          companyName
        }
      }
    );

    if (error) {
      console.error('Welcome email failed:', error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }

    // Update email status in database
    const { error: updateError } = await supabase
      .from('companies')
      .update({ welcome_email_sent: true })
      .eq('id', companyId);

    if (updateError) {
      console.error('Failed to update welcome email status:', updateError);
    }

    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

async function geocodeAddress(address: any) {
  try {
    const response = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/geocode-address`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({ address })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to geocode address');
    }

    const geocoded = await response.json();
    return {
      location: `POINT(${geocoded.longitude} ${geocoded.latitude})`,
      latitude: geocoded.latitude,
      longitude: geocoded.longitude
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to geocode company address');
  }
}
