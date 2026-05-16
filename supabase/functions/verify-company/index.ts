// Changes: now requires an admin JWT (in addition to origin check) before flipping is_verified.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifyOrigin, corsHeaders } from "../_shared/verify-origin.ts";
import { requireAdmin } from "../_shared/require-admin.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface VerificationRequest {
  companyId: string;
  verificationNotes?: string;
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!verifyOrigin(req)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized origin' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authResult = await requireAdmin(req, corsHeaders);
    if (authResult instanceof Response) return authResult;

    const { companyId, verificationNotes } = await req.json() as VerificationRequest;
    console.log(`Processing verification for company ID: ${companyId}`);

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('name, contact_email, latitude, longitude, location')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      console.error('Error fetching company:', companyError);
      throw new Error('Company not found');
    }

    if (
      company.latitude === null ||
      company.longitude === null ||
      company.location === null
    ) {
      return new Response(
        JSON.stringify({
          error:
            'Company is missing geocoded coordinates. Re-geocode the business address before verifying.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

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

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "HouseMove <notifications@housemove.co>",
        to: [company.contact_email],
        subject: "Your HouseMove Account Has Been Verified!",
        html: `
          <h1>Congratulations ${company.name}!</h1>
          <p>Your company account has been verified by our team. You can now access all features of the HouseMove platform.</p>
          <p>Log in to your dashboard to start managing your moves: <a href="https://housemove.co">HouseMove Dashboard</a></p>
          <p>Thank you for choosing HouseMove!</p>
        `,
      }),
    });

    if (!emailResponse.ok) {
      console.error('Error sending email:', await emailResponse.text());
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Company verified successfully', company: company.name }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error('Error in verify-company function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred during verification' }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
};

serve(handler);
