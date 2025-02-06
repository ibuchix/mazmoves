
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts"
import { verifyOrigin } from "../_shared/verify-origin.ts"

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

    console.log('Starting company registration process v2...');
    const { companyData } = await req.json();
    
    if (!companyData) {
      console.error('Registration failed: Missing company data in request');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request data',
          details: 'Company data is required'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Log incoming registration data (excluding sensitive info)
    console.log('Processing registration for:', {
      companyName: companyData.name,
      email: companyData.contact_email,
      hasPassword: !!companyData.password,
      registrationNumber: companyData.registration_number
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // First check if company already exists
    const { data: existingCompany, error: checkError } = await supabase
      .from('companies')
      .select('id')
      .eq('contact_email', companyData.contact_email.toLowerCase())
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

    // Create auth user first
    console.log('Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: companyData.contact_email,
      password: companyData.password,
      email_confirm: false,
      user_metadata: { role: 'company' }
    });

    if (authError) {
      console.error('Auth creation failed:', {
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

    console.log('Company registration completed successfully:', {
      companyName: companyData.name,
      userId: authData.user.id
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
    console.error('Unexpected registration error:', {
      error: error.message,
      stack: error.stack
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
