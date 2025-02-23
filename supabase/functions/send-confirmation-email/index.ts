
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { verifyOrigin } from "../_shared/verify-origin.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const MAX_RETRIES = parseInt(Deno.env.get('MAX_RETRIES') || '3');
const RETRY_DELAY = parseInt(Deno.env.get('RETRY_DELAY') || '1000');

interface EmailData {
  to: string;
  customerName: string;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendEmailWithRetry(emailData: EmailData, attempt: number = 1): Promise<Response> {
  try {
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      throw new Error('RESEND_API_KEY is not configured');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.to)) {
      throw new Error('Invalid email format');
    }

    console.log(`Attempt ${attempt} - Sending email to:`, emailData.to);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'MAZ Moves <notifications@mazmoves.com>',
        to: [emailData.to],
        subject: 'Move Request Confirmation',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #040480;">Thank you for your move request, ${emailData.customerName}!</h2>
            <p>We have received your move request and our verified moving companies in your area will be notified.</p>
            <p>You will be contacted directly by the moving companies to discuss your requirements in detail.</p>
            <p style="margin-top: 20px;">Best regards,<br>MAZ Moves Team</p>
          </div>
        `
      })
    });

    const emailResponse = await response.json();
    console.log(`Attempt ${attempt} - Resend API response:`, JSON.stringify(emailResponse));

    if (!response.ok) {
      throw new Error(emailResponse.message || 'Failed to send email');
    }

    // Log successful email send
    console.log('Email sent successfully to:', emailData.to);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Attempt ${attempt} failed:`, error);

    if (attempt < MAX_RETRIES) {
      // Exponential backoff
      const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
      console.log(`Retrying in ${delay}ms...`);
      await sleep(delay);
      return sendEmailWithRetry(emailData, attempt + 1);
    }

    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the request origin
    if (!verifyOrigin(req)) {
      console.error('Unauthorized origin attempt');
      return new Response(
        JSON.stringify({ error: 'Unauthorized origin' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { customerEmail, customerName } = await req.json();
    
    if (!customerEmail || !customerName) {
      throw new Error('Missing required fields: customerEmail or customerName');
    }

    console.log('Attempting to send confirmation email to:', customerEmail);

    const emailData: EmailData = {
      to: customerEmail,
      customerName: customerName
    };

    return await sendEmailWithRetry(emailData);

  } catch (error) {
    console.error('Error in send-confirmation-email function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
