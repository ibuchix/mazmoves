import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      throw new Error('RESEND_API_KEY is not configured');
    }

    const { email, companyName } = await req.json();
    
    console.log('Attempting to send welcome email to:', email);

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
            <p>Please check your email for a confirmation link to verify your email address.</p>
            <p style="margin-top: 20px;">Best regards,<br>MAZ Moves Team</p>
          </div>
        `
      }),
    });

    const responseText = await emailResponse.text();
    console.log('Resend API response:', responseText);

    if (!emailResponse.ok) {
      throw new Error(`Resend API error: ${responseText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-welcome-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});