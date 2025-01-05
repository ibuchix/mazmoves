import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    console.log('Processing company registration request')

    // Get file uploads
    const transitInsurance = formData.get('transitInsurance') as File
    const liabilityInsurance = formData.get('liabilityInsurance') as File
    
    // Get other form data
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const companyName = formData.get('name') as string
    const registrationNumber = formData.get('registrationNumber') as string
    const vatNumber = formData.get('vatNumber') as string
    const phone = formData.get('phone') as string
    const managerName = formData.get('managerName') as string
    const address = JSON.parse(formData.get('address') as string)

    // Validate required fields
    if (!email || !password || !companyName || !registrationNumber || !phone || !managerName || !address) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          status: 400
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Checking if user already exists')
    // Check if user already exists
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers()
    const userExists = users.some(user => user.email === email)

    if (userExists) {
      return new Response(
        JSON.stringify({ 
          error: 'Registration failed', 
          details: 'An account with this email already exists',
          status: 400
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      )
    }

    // Check if company already exists with this registration number
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('registration_number', registrationNumber)
      .single()

    if (existingCompany) {
      return new Response(
        JSON.stringify({ 
          error: 'Registration failed', 
          details: 'A company with this registration number already exists',
          status: 400
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      )
    }

    console.log('Creating auth user')
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'company' }
    })

    if (authError) {
      console.error('Auth user creation error:', authError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create user account', 
          details: authError,
          status: 400
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create user account',
          details: 'No user data returned',
          status: 500
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Auth user created:', authData.user.id)

    // Upload insurance documents
    const uploadFile = async (file: File, prefix: string) => {
      const fileExt = file.name.split('.').pop()
      const filePath = `${prefix}_${crypto.randomUUID()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('company_docs')
        .upload(filePath, file)

      if (uploadError) throw uploadError
      return filePath
    }

    console.log('Uploading insurance documents')
    const [transitInsurancePath, liabilityInsurancePath] = await Promise.all([
      uploadFile(transitInsurance, 'transit'),
      uploadFile(liabilityInsurance, 'liability')
    ])

    console.log('Creating user record')
    // Create user record
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name: managerName,
        role: 'company',
        phone,
        address
      })

    if (userError) {
      console.error('User record creation error:', userError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create user record', 
          details: userError,
          status: 500 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Geocode address
    const geocodeAddress = async (address: any) => {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`
        )}&key=${Deno.env.get('OPENCAGE_API_KEY')}`
      )
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        return {
          latitude: data.results[0].geometry.lat,
          longitude: data.results[0].geometry.lng
        }
      }
      return null
    }

    console.log('Geocoding address')
    const coordinates = await geocodeAddress(address)

    console.log('Creating company record')
    // Create company record
    const { error: companyError } = await supabase
      .from('companies')
      .insert({
        name: companyName,
        registration_number: registrationNumber,
        vat_number: vatNumber || null,
        contact_email: email,
        contact_phone: phone,
        business_address: address,
        manager_name: managerName,
        insurance_docs: [
          { type: 'transit', path: transitInsurancePath },
          { type: 'liability', path: liabilityInsurancePath }
        ],
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
        auth_user_id: authData.user.id,
        registration_status: 'pending'
      })

    if (companyError) {
      console.error('Company creation error:', companyError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create company record', 
          details: companyError,
          status: 500
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Send welcome email
    try {
      await supabase.functions.invoke('send-welcome-email', {
        body: { email, companyName }
      })
    } catch (emailError) {
      console.error('Welcome email error:', emailError)
      // Don't fail the registration if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Company registered successfully',
        userId: authData.user.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Registration failed', 
        details: error.message,
        status: 500
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})