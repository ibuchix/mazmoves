import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { verifyOrigin, corsHeaders } from "../_shared/verify-origin.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the request origin
    if (!verifyOrigin(req)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized origin' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      throw new Error('RESEND_API_KEY is not configured');
    }

    const { customerEmail, customerName } = await req.json();
    
    console.log('Attempting to send confirmation email to:', customerEmail);

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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #040480;">Thank you for your move request, ${customerName}!</h2>
            <p>We have received your move request and our verified moving companies in your area will be notified.</p>
            <p>You will be contacted directly by the moving companies to discuss your requirements in detail.</p>
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
