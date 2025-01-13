import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  companyId: string;
  verificationNotes?: string;
}

const supabase = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId, verificationNotes } = await req.json() as VerificationRequest;
    console.log(`Processing verification for company ID: ${companyId}`);

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('name, contact_email')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      console.error('Error fetching company:', companyError);
      throw new Error('Company not found');
    }

    // Update company verification status
    const { error: updateError } = await supabase
      .from('companies')
      .update({
        is_verified: true,
        verification_date: new Date().toISOString(),
        verification_notes: verificationNotes,
      })
      .eq('id', companyId);

    if (updateError) {
      console.error('Error updating company:', updateError);
      throw new Error('Failed to update company verification status');
    }

    // Send verification email
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "MazMoves <onboarding@resend.dev>",
        to: [company.contact_email],
        subject: "Your MazMoves Account Has Been Verified!",
        html: `
          <h1>Congratulations ${company.name}!</h1>
          <p>Your company account has been verified by our team. You can now access all features of the MazMoves platform.</p>
          <p>Log in to your dashboard to start managing your moves: <a href="${SUPABASE_URL}">MazMoves Dashboard</a></p>
          <p>Thank you for choosing MazMoves!</p>
        `,
      }),
    });

    if (!emailResponse.ok) {
      console.error('Error sending email:', await emailResponse.text());
      // Don't throw here - we still want to return success since verification was done
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Company verified successfully',
        company: company.name
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in verify-company function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred during verification'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);