import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { validateRegistrationData } from './validation.ts'
import { uploadInsuranceDocuments } from './file-handler.ts'
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
    const formData = await req.formData()
    const registrationData = validateRegistrationData(formData);
    
    if (!registrationData) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          status: 400
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get client IP address
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    console.log('Checking rate limit for IP:', clientIP)

    // Check rate limits
    await checkRateLimits(supabase, clientIP, registrationData.email);

    // Check existing users and handle authentication
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const { userId } = await handleAuthentication(
      supabase, 
      registrationData.email, 
      registrationData.password,
      existingUsers
    );

    // Upload insurance documents
    const { transitPath, liabilityPath } = await uploadInsuranceDocuments(
      supabase,
      registrationData.transitInsurance,
      registrationData.liabilityInsurance,
      userId
    );

    // Create user record
    await createUserRecord(
      supabase,
      userId,
      registrationData.email,
      registrationData.managerName,
      registrationData.phone,
      registrationData.address
    );

    // Create company record
    await createCompanyRecord(supabase, {
      name: registrationData.companyName,
      registration_number: registrationData.registrationNumber,
      contact_email: registrationData.email,
      contact_phone: registrationData.phone,
      business_address: registrationData.address,
      manager_name: registrationData.managerName,
      insurance_docs: [
        { type: 'transit', path: transitPath },
        { type: 'liability', path: liabilityPath }
      ],
      latitude: registrationData.latitude,
      longitude: registrationData.longitude,
      auth_user_id: userId,
      registration_status: 'pending'
    });

    // Record successful registration
    await recordSuccessfulAttempt(supabase, clientIP, registrationData.email);

    // Generate and send confirmation email
    const confirmData = await generateConfirmationLink(supabase, registrationData.email);
    await sendWelcomeEmail(
      supabase,
      registrationData.email,
      registrationData.companyName,
      confirmData.properties.action_link
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Company registered successfully',
        userId: userId 
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