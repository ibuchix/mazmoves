
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts"
import { verifyOrigin } from "../_shared/verify-origin.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!verifyOrigin(req)) {
      return new Response(
        JSON.stringify({ error: 'Invalid origin' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { companyId, email, companyName } = await req.json();

    if (!companyId || !email || !companyName) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Attempting to send welcome email to ${email} for company ${companyName} (${companyId})`);

    // Check if email was already sent
    const { data: company } = await supabase
      .from('companies')
      .select('welcome_email_sent')
      .eq('id', companyId)
      .single();

    if (company?.welcome_email_sent) {
      console.log(`Welcome email already sent to ${email}`);
      
      // Log the duplicate attempt
      await supabase.rpc('log_email_attempt', {
        p_company_id: companyId,
        p_email_type: 'welcome',
        p_recipient_email: email,
        p_status: 'skipped',
        p_error_message: 'Welcome email already sent'
      });

      return new Response(
        JSON.stringify({ message: 'Welcome email already sent' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send welcome email
    console.log('Sending welcome email via Resend...');
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
            <p style="margin-top: 20px;">Best regards,<br>MAZ Moves Team</p>
          </div>
        `
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Failed to send welcome email:', errorText);
      
      // Log the failure
      await supabase.rpc('log_email_attempt', {
        p_company_id: companyId,
        p_email_type: 'welcome',
        p_recipient_email: email,
        p_status: 'failed',
        p_error_message: errorText
      });

      return new Response(
        JSON.stringify({ error: 'Failed to send welcome email', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Welcome email sent successfully');

    // Log the success
    await supabase.rpc('log_email_attempt', {
      p_company_id: companyId,
      p_email_type: 'welcome',
      p_recipient_email: email,
      p_status: 'success'
    });

    // Mark email as sent in database
    const { error: updateError } = await supabase.rpc(
      'mark_welcome_email_sent',
      { company_id: companyId }
    );

    if (updateError) {
      console.error('Failed to mark email as sent:', updateError);
    }

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
