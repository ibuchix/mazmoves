
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts"
import { verifyOrigin } from "../_shared/verify-origin.ts"
import { CompanyRegistrationData } from "./types.ts"
import { validateCompanyData } from "./validation.ts"
import { createAuthUser, deleteAuthUser } from "./auth.ts"
import { checkExistingCompany, registerCompany, sendWelcomeEmail } from "./company.ts"

serve(async (req) => {
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
        JSON.stringify({ 
          error: 'Invalid origin',
          details: ['Request origin not allowed']
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse and validate request data
    let companyData: Partial<CompanyRegistrationData>;
    try {
      const rawData = await req.text();
      console.log('Raw request data:', rawData);
      
      companyData = JSON.parse(rawData);
      
      console.log('Parsed registration request:', {
        name: companyData.name,
        email: companyData.contact_email,
        hasPassword: !!companyData.password,
        registrationTime: new Date().toISOString()
      });
    } catch (error) {
      console.error('Registration failed: Invalid JSON payload', { error });
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request format', 
          details: ['Invalid JSON format', error.message]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Validate company data
    const { isValid, errors } = validateCompanyData(companyData);
    if (!isValid) {
      console.error('Registration failed: Validation errors', { 
        errors,
        receivedData: {
          ...companyData,
          password: '[REDACTED]'
        }
      });
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed',
          details: errors
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check for existing company
    await checkExistingCompany(supabase, companyData.contact_email!);

    // Begin registration process
    console.log('Starting registration process for:', companyData.contact_email);

    // Create auth user
    const user = await createAuthUser(supabase, companyData.contact_email!, companyData.password!);
    console.log('Auth user created:', user.id);

    try {
      // Create company record
      const company = await registerCompany(supabase, {
        ...companyData as CompanyRegistrationData,
        auth_user_id: user.id
      });
      console.log('Company record created:', company.id);

      // Send welcome email
      try {
        await sendWelcomeEmail(
          supabase,
          company.id,
          companyData.contact_email!,
          companyData.name!
        );
        console.log('Welcome email sent successfully');
      } catch (emailError) {
        console.warn('Welcome email failed but registration completed:', emailError);
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
      // If company creation fails, clean up the auth user
      console.error('Registration failed after auth user creation:', error);
      await deleteAuthUser(supabase, user.id);
      throw error;
    }

  } catch (error) {
    console.error('Unexpected registration error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Registration failed', 
        details: [error.message]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
