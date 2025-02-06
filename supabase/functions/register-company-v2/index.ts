
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts"
import { verifyOrigin } from "../_shared/verify-origin.ts"

interface CompanyRegistrationData {
  name: string
  registration_number: string
  contact_email: string
  contact_phone: string
  business_address: string
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
  if (!data.business_address?.trim()) errors.push("Business address is required");
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify request origin
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

    // Parse and validate request body
    let companyData: Partial<CompanyRegistrationData>;
    try {
      const body = await req.json();
      companyData = body.companyData;
      
      console.log('Received registration request:', {
        companyName: companyData.name,
        email: companyData.contact_email,
        registrationTime: new Date().toISOString()
      });
    } catch (error) {
      console.error('Registration failed: Invalid JSON payload', { 
        error,
        body: await req.text()
      });
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request format',
          details: 'Request body must be valid JSON'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Validate company data
    const { isValid, errors } = validateCompanyData(companyData);
    if (!isValid) {
      console.error('Registration failed: Validation errors', { 
        errors,
        companyName: companyData.name,
        email: companyData.contact_email 
      });
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed',
          details: errors
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check for existing company
    console.log('Checking for existing company:', {
      email: companyData.contact_email?.toLowerCase()
    });

    const { data: existingCompany, error: checkError } = await supabase
      .from('companies')
      .select('id')
      .eq('contact_email', companyData.contact_email?.toLowerCase())
      .single();

    if (checkError) {
      console.error('Error checking existing company:', checkError);
    }

    if (existingCompany) {
      console.error('Registration failed: Company email already exists', {
        email: companyData.contact_email
      });
      return new Response(
        JSON.stringify({ 
          error: 'Registration failed',
          details: 'A company with this email already exists'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Create auth user
    console.log('Creating auth user for:', {
      email: companyData.contact_email
    });

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: companyData.contact_email,
      password: companyData.password,
      email_confirm: false,
      user_metadata: { role: 'company' }
    });

    if (authError) {
      console.error('Auth user creation failed:', {
        error: authError.message,
        email: companyData.contact_email,
        details: authError
      });
      return new Response(
        JSON.stringify({ 
          error: 'Registration failed',
          details: authError.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    if (!authData.user) {
      console.error('Auth creation failed: No user data returned');
      return new Response(
        JSON.stringify({ 
          error: 'Registration failed',
          details: 'No user data returned from auth signup'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    console.log('Auth user created successfully:', {
      userId: authData.user.id,
      email: authData.user.email
    });

    // Register the company using RPC function
    console.log('Creating company record...');
    const { data: response, error: registerError } = await supabase.rpc(
      'register_company',
      {
        company_data: {
          name: companyData.name,
          registration_number: companyData.registration_number,
          contact_email: companyData.contact_email,
          contact_phone: companyData.contact_phone,
          business_address: companyData.business_address,
          manager_name: companyData.manager_name,
          latitude: null,
          longitude: null,
          auth_user_id: authData.user.id
        }
      }
    );
      
    if (registerError) {
      console.error('Company creation failed:', {
        error: registerError.message,
        companyName: companyData.name,
        userId: authData.user.id,
        details: registerError
      });
      
      // Delete the auth user if company creation failed
      console.log('Rolling back auth user creation...');
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
      
      if (deleteError) {
        console.error('Failed to rollback auth user:', {
          error: deleteError.message,
          userId: authData.user.id
        });
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Registration failed',
          details: registerError.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Log successful registration
    console.log('Company registration completed successfully:', {
      companyName: companyData.name,
      userId: authData.user.id,
      registrationComplete: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Company registered successfully',
        company: {
          name: companyData.name,
          email: companyData.contact_email
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    // Log unexpected errors
    console.error('Unexpected registration error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return new Response(
      JSON.stringify({ 
        error: 'Registration failed', 
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
