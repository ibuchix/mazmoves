
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
      
      // Log registration attempt details
      await supabase.rpc('log_registration_error', {
        error_msg: 'Registration attempt started',
        error_details: { stage: 'init' },
        request_data: companyData,
        client_ip: req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown'
      });

      console.log('Parsed registration request:', {
        name: companyData.name,
        email: companyData.contact_email,
        hasPassword: !!companyData.password,
        registrationTime: new Date().toISOString()
      });
    } catch (error) {
      console.error('Registration failed: Invalid JSON payload', { error });
      
      await supabase.rpc('log_registration_error', {
        error_msg: 'Invalid JSON payload',
        error_details: { error: error.message },
        request_data: null,
        client_ip: req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown'
      });

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

      await supabase.rpc('log_registration_error', {
        error_msg: 'Validation failed',
        error_details: { errors },
        request_data: { ...companyData, password: '[REDACTED]' },
        client_ip: req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown'
      });

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
      
      await supabase.rpc('log_registration_error', {
        error_msg: 'Company exists check failed',
        error_details: { error: error.message },
        request_data: { email: companyData.contact_email },
        client_ip: req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown'
      });

      throw error;
    }

    // Begin registration process
    console.log('Starting registration process for:', companyData.contact_email);

    // Create auth user
    let user;
    try {
      user = await createAuthUser(supabase, companyData.contact_email!, companyData.password!);
      console.log('Auth user created:', user.id);
    } catch (error) {
      console.error('Failed to create auth user:', error);
      
      await supabase.rpc('log_registration_error', {
        error_msg: 'Auth user creation failed',
        error_details: { error: error.message },
        request_data: { email: companyData.contact_email },
        client_ip: req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown'
      });

      throw new Error('Failed to create user account');
    }

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
        
        await supabase.rpc('log_registration_error', {
          error_msg: 'Welcome email failed',
          error_details: { error: emailError.message },
          request_data: { 
            companyId: company.id,
            email: companyData.contact_email 
          },
          client_ip: req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown'
        });
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
      // If company creation fails, attempt to clean up the auth user
      console.error('Registration failed after auth user creation:', error);
      
      await supabase.rpc('log_registration_error', {
        error_msg: 'Company creation failed',
        error_details: { error: error.message },
        request_data: { 
          userId: user.id,
          email: companyData.contact_email 
        },
        client_ip: req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown'
      });

      try {
        await deleteAuthUser(supabase, user.id);
        console.log('Successfully cleaned up auth user after failed registration');
      } catch (cleanupError) {
        console.error('Failed to clean up auth user:', cleanupError);
        // Continue with throwing the original error
      }
      throw error;
    }

  } catch (error) {
    console.error('Unexpected registration error:', error);

    // Log the unexpected error
    try {
      await supabase.rpc('log_registration_error', {
        error_msg: 'Unexpected registration error',
        error_details: { error: error.message },
        request_data: null,
        client_ip: req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown'
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(
      JSON.stringify({ 
        error: 'Registration failed', 
        details: [error.message || 'An unexpected error occurred']
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
