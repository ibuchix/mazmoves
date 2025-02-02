import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { validateRegistrationData } from './validation.ts'
import { handleAuthentication } from './auth-service.ts'
import { createCompanyRecord, createUserRecord } from './company-service.ts'
import { checkRateLimits, recordSuccessfulAttempt } from './rate-limit-service.ts'
import { generateConfirmationLink, sendWelcomeEmail } from './notification-service.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting company registration process...');
    const { companyData } = await req.json();
    
    if (!companyData) {
      console.error('Missing company data in request');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request data',
          details: 'Company data is required',
          status: 400
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get client IP address for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    console.log('Processing request from IP:', clientIP)

    // Check rate limits
    try {
      await checkRateLimits(supabase, clientIP, companyData.contact_email);
    } catch (error) {
      console.error('Rate limit exceeded:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests',
          details: 'Please try again later',
          status: 429
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      )
    }

    // Check for existing company with same email
    const { data: existingCompany, error: queryError } = await supabase
      .from('companies')
      .select('id, contact_email')
      .eq('contact_email', companyData.contact_email.toLowerCase())
      .is('deleted_at', null)
      .single();

    console.log('Existing company check result:', { existingCompany, queryError });

    if (existingCompany) {
      console.error('Duplicate company found:', existingCompany);
      return new Response(
        JSON.stringify({ 
          error: 'Company creation failed',
          details: 'A company with this email already exists',
          status: 400
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create company record
    try {
      await createCompanyRecord(supabase, companyData);
    } catch (error) {
      console.error('Error creating company record:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Company creation failed',
          details: error.message,
          status: 400
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Record successful registration
    await recordSuccessfulAttempt(supabase, clientIP, companyData.contact_email);

    // Generate and send confirmation email
    try {
      const confirmData = await generateConfirmationLink(supabase, companyData.contact_email);
      await sendWelcomeEmail(
        supabase,
        companyData.contact_email,
        companyData.name,
        confirmData.properties.action_link
      );
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't fail the registration if email fails
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
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    const status = error.status || 500;
    return new Response(
      JSON.stringify({ 
        error: 'Registration failed', 
        details: error.message,
        status
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status }
    )
  }
})