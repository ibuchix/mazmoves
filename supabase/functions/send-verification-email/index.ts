import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifyOrigin, corsHeaders } from "../_shared/verify-origin.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface EmailRequest {
  companyName: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
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

    const { companyName, email }: EmailRequest = await req.json();

    console.log(`Sending verification email to ${email} for company ${companyName}`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "HouseMove <notifications@housemove.co>",
        to: [email],
        subject: "Your HouseMove Account Has Been Verified!",
        html: `
          <h1>Congratulations ${companyName}!</h1>
          <p>Your company account has been verified by our team. You can now access all features of the HouseMove platform.</p>
          <p>Log in to your dashboard to start managing your moves: <a href="https://housemove.co">HouseMove Dashboard</a></p>
          <p>Thank you for choosing HouseMove!</p>
        `,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to send email: ${await res.text()}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);
