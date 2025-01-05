import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

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
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    const { email, companyName } = await req.json()
    console.log('Sending welcome email to:', email)

    // Initialize Supabase client with service role key
    const supabase = createClient(
      SUPABASE_URL ?? '',
      SUPABASE_SERVICE_ROLE_KEY ?? ''
    )

    // Generate email confirmation link
    const { data: { user }, error: userError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: email,
      options: {
        redirectTo: `${SUPABASE_URL}/auth/v1/verify?redirect_to=/login`
      }
    })

    if (userError) {
      console.error('Error generating confirmation link:', userError)
      throw userError
    }

    const confirmationLink = user?.confirmation_token 
      ? `${SUPABASE_URL}/auth/v1/verify?token=${user.confirmation_token}&type=signup&redirect_to=/login`
      : null

    console.log('Generated confirmation link:', confirmationLink)

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'MAZ Moves <notifications@mazmoves.com>',
        to: [email],
        subject: 'Welcome to MAZ Moves - Please Confirm Your Email',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #040480;">Welcome to MAZ Moves, ${companyName}!</h1>
            <p>Thank you for registering with MAZ Moves. We're excited to have you on board!</p>
            <p>Your application is currently under review by our team. We'll verify your details and get back to you shortly.</p>
            ${confirmationLink ? `
              <p>Please confirm your email address by clicking the link below:</p>
              <p>
                <a href="${confirmationLink}" 
                   style="background-color: #040480; 
                          color: white; 
                          padding: 10px 20px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          display: inline-block;">
                  Confirm Email Address
                </a>
              </p>
            ` : ''}
            <p style="margin-top: 20px;">Best regards,<br>MAZ Moves Team</p>
          </div>
        `
      }),
    })

    const responseText = await emailResponse.text()
    console.log('Resend API response:', responseText)

    if (!emailResponse.ok) {
      throw new Error(`Resend API error: ${responseText}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in send-welcome-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})