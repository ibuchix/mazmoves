
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

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Start a transaction for atomic operations
  const { data: client } = await supabase.rpc('begin_transaction');

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
      
      // Log registration attempt
      await supabase.rpc('log_registration_attempt', {
        email: companyData.contact_email,
        client_ip: req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown',
        attempt_data: companyData
      });

      console.log('Registration attempt logged for:', companyData.contact_email);
    } catch (error) {
      console.error('Registration failed: Invalid JSON payload', { error });
      await supabase.rpc('rollback_transaction');
      
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
      console.error('Registration failed: Validation errors', { errors });
      await supabase.rpc('rollback_transaction');

      return new Response(
        JSON.stringify({ 
          error: 'Validation failed',
          details: errors
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Check for existing company
    try {
      await checkExistingCompany(supabase, companyData.contact_email!);
    } catch (error) {
      console.error('Registration failed: Company exists check failed', { error });
      await supabase.rpc('rollback_transaction');
      
      return new Response(
        JSON.stringify({ 
          error: 'Company exists',
          details: [error.message]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create auth user
    let user;
    try {
      user = await createAuthUser(supabase, companyData.contact_email!, companyData.password!);
      console.log('Auth user created:', user.id);
    } catch (error) {
      console.error('Failed to create auth user:', error);
      await supabase.rpc('rollback_transaction');
      
      return new Response(
        JSON.stringify({ 
          error: 'Auth creation failed',
          details: [error.message]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    try {
      // Create company record within transaction
      const company = await registerCompany(supabase, {
        ...companyData as CompanyRegistrationData,
        auth_user_id: user.id
      });
      console.log('Company record created:', company.id);

      // Commit transaction
      await supabase.rpc('commit_transaction');

      // Send welcome email (non-blocking)
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
        // Don't roll back transaction for email failure
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
      console.error('Failed to create company record:', error);
      
      // Roll back transaction and clean up auth user
      await supabase.rpc('rollback_transaction');
      try {
        await deleteAuthUser(supabase, user.id);
        console.log('Auth user cleaned up after failed registration');
      } catch (cleanupError) {
        console.error('Failed to clean up auth user:', cleanupError);
      }

      return new Response(
        JSON.stringify({ 
          error: 'Company creation failed',
          details: [error.message]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

  } catch (error) {
    console.error('Unexpected registration error:', error);
    await supabase.rpc('rollback_transaction');

    return new Response(
      JSON.stringify({ 
        error: 'Registration failed', 
        details: [error.message || 'An unexpected error occurred']
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
