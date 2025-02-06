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
      return new Response(
        JSON.stringify({ error: 'Invalid origin' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Starting company registration process...');
    const { companyData } = await req.json();
    
    if (!companyData) {
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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // First check if company already exists
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('contact_email', companyData.contact_email.toLowerCase())
      .single();

    if (existingCompany) {
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
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: companyData.contact_email,
      password: companyData.password,
      email_confirm: false,
      user_metadata: { role: 'company' }
    });

    if (authError) {
      console.error('Auth error:', authError);
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

    // Register the company using RPC function
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
      console.error('Registration error:', registerError);
      
      // Delete the auth user if company creation failed
      await supabase.auth.admin.deleteUser(authData.user.id);
      
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
    console.error('Registration error:', error)
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