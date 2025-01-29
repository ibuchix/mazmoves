import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { validateRegistrationData } from './validation.ts'
import { uploadInsuranceDocuments } from './file-handler.ts'
import { geocodeAddress } from './geocoding.ts'

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
    const { data: rateLimitCheck } = await supabase.rpc('check_registration_limit', {
      check_ip: clientIP,
      check_email: registrationData.email
    })

    if (!rateLimitCheck) {
      console.log('Rate limit exceeded for IP:', clientIP)
      // Record the failed attempt
      await supabase.from('registration_attempts').insert({
        ip_address: clientIP,
        email: registrationData.email,
        success: false
      })

      return new Response(
        JSON.stringify({ 
          error: 'Too many registration attempts. Please try again later.',
          status: 429
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      )
    }

    // First check if user exists and their status
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(u => u.email === registrationData.email);
    
    let userId;
    
    if (existingUser) {
      // Check if the user is soft-deleted
      if (!existingUser.banned_until && !existingUser.deleted_at) {
        // Check if company already exists for this user
        const { data: existingCompany } = await supabase
          .from('companies')
          .select('id')
          .eq('auth_user_id', existingUser.id)
          .single();
          
        if (existingCompany) {
          // Record the failed attempt
          await supabase.from('registration_attempts').insert({
            ip_address: clientIP,
            email: registrationData.email,
            success: false
          })

          return new Response(
            JSON.stringify({ 
              error: 'Registration failed', 
              details: 'A company is already registered with this account',
              status: 422
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 422 }
          )
        }
        userId = existingUser.id;
      } else {
        // If user is soft-deleted, we'll create a new user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: registrationData.email,
          password: registrationData.password,
          email_confirm: false,
          user_metadata: { role: 'company' }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('No user data returned');
        userId = authData.user.id;
      }
    } else {
      // Create new auth user with email confirmation required
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: registrationData.email,
        password: registrationData.password,
        email_confirm: false, // This ensures a confirmation email is sent
        user_metadata: { role: 'company' }
      })

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user data returned');
      }
      
      userId = authData.user.id;
    }

    // Upload insurance documents with company-specific folder
    const { transitPath, liabilityPath } = await uploadInsuranceDocuments(
      supabase,
      registrationData.transitInsurance,
      registrationData.liabilityInsurance,
      userId
    );

    // Create user record if it doesn't exist
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: registrationData.email,
        full_name: registrationData.managerName,
        role: 'company',
        phone: registrationData.phone,
        address: registrationData.address
      })

    if (userError) {
      console.error('Error creating/updating user record:', userError);
      throw userError;
    }

    // Geocode address
    const coordinates = await geocodeAddress(registrationData.address);

    // Create company record with RLS temporarily disabled
    const { error: companyError } = await supabase.rpc('create_company_bypass_rls', {
      company_data: {
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
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
        auth_user_id: userId,
        registration_status: 'pending'
      }
    })

    if (companyError) {
      console.error('Company creation error:', companyError);
      throw companyError;
    }

    // Record successful registration attempt
    await supabase.from('registration_attempts').insert({
      ip_address: clientIP,
      email: registrationData.email,
      success: true
    })

    // Generate email confirmation link
    const { data: confirmData, error: confirmError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: registrationData.email,
      options: {
        redirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify`
      }
    });

    if (confirmError) {
      console.error('Error generating confirmation link:', confirmError);
      throw confirmError;
    }

    // Send welcome email with confirmation link
    try {
      await supabase.functions.invoke('send-welcome-email', {
        body: { 
          email: registrationData.email, 
          companyName: registrationData.companyName,
          confirmationLink: confirmData.properties.action_link
        }
      })
    } catch (emailError) {
      console.error('Welcome email error:', emailError)
      // Don't fail registration if email fails
    }

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