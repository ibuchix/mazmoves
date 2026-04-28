
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
    console.log('Attempting to send welcome email with data:', {
      companyId,
      email,
      companyName,
      hasSupabase: !!supabase,
    });

    // Create a new Supabase client using the service role key
    const response = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-welcome-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'x-client-info': 'edge-function',
          'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        },
        body: JSON.stringify({
          companyId,
          email,
          companyName
        })
      }
    );

    const responseText = await response.text();
    console.log('Welcome email response:', responseText);

    if (!response.ok) {
      console.error('Welcome email failed with status:', response.status);
      console.error('Response text:', responseText);
      throw new Error(`Failed to send welcome email: ${responseText}`);
    }

    try {
      const responseData = JSON.parse(responseText);
      console.log('Parsed response data:', responseData);
    } catch (e) {
      console.warn('Could not parse response as JSON:', e);
    }

    // Update email status in database
    const { error: updateError } = await supabase
      .from('companies')
      .update({ 
        welcome_email_sent: true,
        welcome_email_sent_at: new Date().toISOString()
      })
      .eq('id', companyId);

    if (updateError) {
      console.error('Failed to update welcome email status:', updateError);
    }

    return true;
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error);
    throw error;
  }
}

// Build a single, comma-separated address string. Defaults country to
// "United Kingdom" so the existing company-app form (no country field)
// still geocodes correctly. If the company app later sends a `country`,
// it flows through automatically.
function buildAddressString(address: any): string {
  if (typeof address === 'string') return address.trim();
  if (!address || typeof address !== 'object') {
    throw new Error('Invalid business address: expected string or object');
  }
  const { street, city, state, zipCode, country } = address;
  const parts = [street, city, state, zipCode, country || 'United Kingdom']
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter((p) => p.length > 0);
  if (parts.length === 0) {
    throw new Error('Invalid business address: all fields empty');
  }
  return parts.join(', ');
}

async function geocodeAddress(address: any) {
  const addressString = buildAddressString(address);
  console.log('Geocoding company address:', addressString);

  const response = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/functions/v1/geocode-address`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({ address: addressString })
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error('Geocoding failed:', response.status, errText);
    throw new Error(`Failed to geocode company address: ${errText}`);
  }

  const geocoded = await response.json();
  if (typeof geocoded.latitude !== 'number' || typeof geocoded.longitude !== 'number') {
    throw new Error('Geocoding returned invalid coordinates');
  }

  return {
    location: `POINT(${geocoded.longitude} ${geocoded.latitude})`,
    latitude: geocoded.latitude,
    longitude: geocoded.longitude
  };
}
