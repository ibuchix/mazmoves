
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts"
import { verifyOrigin } from "../_shared/verify-origin.ts"

interface CompanyRegistrationData {
  name: string
  registration_number: string
  contact_email: string
  contact_phone: string
  business_address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  manager_name: string
  password: string
  auth_user_id?: string
  latitude?: number | null
  longitude?: number | null
}

function validateCompanyData(data: Partial<CompanyRegistrationData>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required field checks
  if (!data.name?.trim()) errors.push("Company name is required");
  if (!data.registration_number?.trim()) errors.push("Registration number is required");
  if (!data.contact_email?.trim()) errors.push("Contact email is required");
  if (!data.contact_phone?.trim()) errors.push("Contact phone is required");
  if (!data.business_address) errors.push("Business address is required");
  else {
    if (!data.business_address.street?.trim()) errors.push("Street address is required");
    if (!data.business_address.city?.trim()) errors.push("City is required");
    if (!data.business_address.state?.trim()) errors.push("State is required");
    if (!data.business_address.zipCode?.trim()) errors.push("Zip code is required");
  }
  if (!data.manager_name?.trim()) errors.push("Manager name is required");
  if (!data.password?.trim()) errors.push("Password is required");

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.contact_email && !emailRegex.test(data.contact_email)) {
    errors.push("Invalid email format");
  }

  // Password strength validation
  if (data.password && data.password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  // Phone number format validation (basic check)
  const phoneRegex = /^\+?[\d\s-]{8,}$/;
  if (data.contact_phone && !phoneRegex.test(data.contact_phone)) {
    errors.push("Invalid phone number format");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!verifyOrigin(req)) {
      console.error('Registration failed: Invalid origin', {
        origin: req.headers.get('origin'),
        referer: req.headers.get('referer')
      });
      return new Response(
        JSON.stringify({ error: 'Invalid origin' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let companyData: Partial<CompanyRegistrationData>;
    try {
      const body = await req.json();
      companyData = body.companyData;
      
      console.log('Received registration request:', {
        companyName: companyData.name,
        email: companyData.contact_email,
        hasPassword: !!companyData.password, // Log whether password exists without exposing it
        registrationTime: new Date().toISOString()
      });
    } catch (error) {
      console.error('Registration failed: Invalid JSON payload', { error });
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { isValid, errors } = validateCompanyData(companyData);
    if (!isValid) {
      console.error('Registration failed: Validation errors', { errors });
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: errors }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('contact_email', companyData.contact_email?.toLowerCase())
      .single();

    if (existingCompany) {
      console.error('Registration failed: Company email already exists');
      return new Response(
        JSON.stringify({ error: 'A company with this email already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: companyData.contact_email,
      password: companyData.password,
      email_confirm: false,
      user_metadata: { role: 'company' }
    });

    if (authError || !authData.user) {
      console.error('Auth user creation failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Registration failed', details: authError?.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create company record with the password included
    const { data: company, error: registerError } = await supabase.rpc(
      'register_company',
      {
        company_data: {
          name: companyData.name,
          registration_number: companyData.registration_number,
          contact_email: companyData.contact_email,
          contact_phone: companyData.contact_phone,
          business_address: companyData.business_address,
          manager_name: companyData.manager_name,
          password: companyData.password, // Explicitly include password
          latitude: null,
          longitude: null,
          auth_user_id: authData.user.id
        }
      }
    );
      
    if (registerError) {
      console.error('Company creation failed:', registerError);
      
      // Rollback auth user creation
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
      if (deleteError) {
        console.error('Failed to rollback auth user:', deleteError);
      }
      
      return new Response(
        JSON.stringify({ error: 'Registration failed', details: registerError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Trigger welcome email function
    const emailResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-welcome-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          companyId: company.id,
          email: companyData.contact_email,
          companyName: companyData.name
        })
      }
    );

    if (!emailResponse.ok) {
      console.warn('Welcome email trigger failed, but registration was successful:', 
        await emailResponse.text()
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Company registered successfully',
        company: {
          id: company.id,
          name: companyData.name,
          email: companyData.contact_email
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Unexpected registration error:', error);
    return new Response(
      JSON.stringify({ error: 'Registration failed', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
