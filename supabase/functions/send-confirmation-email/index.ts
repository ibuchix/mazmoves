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
    const { customerEmail, customerName } = await req.json();
    
    console.log('Sending confirmation email to:', customerEmail);

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'MAZ Moves <notifications@mazmoves.com>',
        to: [customerEmail],
        subject: 'Move Request Confirmation',
        html: `
          <h2>Thank you for your move request, ${customerName}!</h2>
          <p>We have received your move request and our verified moving companies in your area will be notified.</p>
          <p>You will be contacted directly by the moving companies to discuss your requirements in detail.</p>
        `
      }),
    });

    if (!emailResponse.ok) {
      throw new Error(`Resend API error: ${await emailResponse.text()}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-confirmation-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});