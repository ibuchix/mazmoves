
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
      const rawData = await req.text();
      console.log('Raw request data:', rawData);
      
      companyData = JSON.parse(rawData);
      
      console.log('Parsed registration request:', {
        name: companyData.name,
        email: companyData.contact_email,
        hasPassword: !!companyData.password,
        registrationTime: new Date().toISOString(),
        fullData: companyData // Log all data for debugging
      });
    } catch (error) {
      console.error('Registration failed: Invalid JSON payload', { error });
      return new Response(
        JSON.stringify({ error: 'Invalid request format', details: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { isValid, errors } = validateCompanyData(companyData);
    if (!isValid) {
      console.error('Registration failed: Validation errors', { 
        errors,
        receivedData: companyData 
      });
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: errors }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check for existing company
    await checkExistingCompany(supabase, companyData.contact_email!);

    // Create auth user
    const user = await createAuthUser(supabase, companyData.contact_email!, companyData.password!);

    try {
      // Create company record
      const company = await registerCompany(supabase, {
        ...companyData as CompanyRegistrationData,
        auth_user_id: user.id
      });

      // Send welcome email
      await sendWelcomeEmail(
        supabase,
        company.id,
        companyData.contact_email!,
        companyData.name!
      );

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
      await deleteAuthUser(supabase, user.id);
      throw error;
    }

  } catch (error) {
    console.error('Unexpected registration error:', error);
    return new Response(
      JSON.stringify({ error: 'Registration failed', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
