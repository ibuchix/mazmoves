
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts"
import { verifyOrigin } from "../_shared/verify-origin.ts"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

// Generate a secure random token
async function generateToken(): Promise<string> {
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  // Log all incoming headers for debugging
  console.log('Incoming request headers:', Object.fromEntries(req.headers.entries()));
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const isEdgeFunction = req.headers.get('x-client-info') === 'edge-function';
    if (isEdgeFunction) {
      console.log('Request is from edge function, bypassing origin check');
    } else if (!verifyOrigin(req)) {
      console.error('Origin verification failed');
      return new Response(
        JSON.stringify({ error: 'Invalid origin' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { companyId, email, companyName } = await req.json();
    console.log('Received request data:', { companyId, email, companyName });

    if (!companyId || !email || !companyName) {
      console.error('Missing required parameters:', { companyId, email, companyName });
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate confirmation token and expiration
    const token = await generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // Token expires in 48 hours

    // Store the confirmation token
    const { error: tokenError } = await supabase
      .from('email_confirmations')
      .insert({
        company_id: companyId,
        token,
        expires_at: expiresAt.toISOString(),
        ip_address: req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')
      });

    if (tokenError) {
      console.error('Failed to store confirmation token:', tokenError);
      throw new Error('Failed to create confirmation token');
    }

    // Update company email verification sent status
    await supabase
      .from('companies')
      .update({ email_verification_sent_at: new Date().toISOString() })
      .eq('id', companyId);

    // Generate confirmation URL
    const confirmUrl = `${Deno.env.get('PUBLIC_SITE_URL')}/confirm-email?token=${token}`;

    // Send welcome email with confirmation link
    console.log('Sending welcome email via Resend...');
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'HouseMove <notifications@housemove.co>',
        to: [email],
        subject: 'Welcome to HouseMove - Please Confirm Your Email',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #334155;">Welcome to HouseMove, ${companyName}!</h1>
            <p>Thank you for registering with HouseMove. We're excited to have you on board!</p>
            <p>Please confirm your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" 
                 style="background-color: #334155; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold;">
                Confirm Email Address
              </a>
            </div>
            <p>This confirmation link will expire in 48 hours.</p>
            <p>If you can't click the button, copy and paste this URL into your browser:</p>
            <p style="word-break: break-all; color: #334155;">${confirmUrl}</p>
            <p style="margin-top: 20px;">Best regards,<br>The HouseMove Team</p>
          </div>
        `
      }),
    });

    const emailResponseText = await emailResponse.text();

    if (!emailResponse.ok) {
      console.error('Failed to send welcome email:', emailResponseText);
      
      await supabase
        .from('email_logs')
        .insert({
          company_id: companyId,
          email_type: 'welcome',
          recipient_email: email,
          status: 'failed',
          error_message: emailResponseText
        });

      return new Response(
        JSON.stringify({ error: 'Failed to send welcome email', details: emailResponseText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Welcome email sent successfully');

    await supabase
      .from('email_logs')
      .insert({
        company_id: companyId,
        email_type: 'welcome',
        recipient_email: email,
        status: 'success'
      });

    return new Response(
      JSON.stringify({ success: true, message: 'Welcome email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-welcome-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
