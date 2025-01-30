import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verifyOrigin, corsHeaders } from "../_shared/verify-origin.ts";
import { findNearbyCompanies } from "./company-finder.ts";
import { Company, MoveRequest } from "./types.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
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

    const { moveRequestId } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get move request details
    const { data: moveRequest, error: moveRequestError } = await supabase
      .from('move_requests')
      .select('*')
      .eq('id', moveRequestId)
      .single();

    if (moveRequestError || !moveRequest) {
      throw new Error('Move request not found');
    }

    // Find nearby companies
    const nearbyCompanies = await findNearbyCompanies(
      moveRequest.pickup_latitude,
      moveRequest.pickup_longitude
    );

    // Create assignments for each company
    const assignments = nearbyCompanies.map(company => ({
      company_id: company.id,
      request_id: moveRequestId,
      status: 'pending',
      notification_sent: new Date().toISOString()
    }));

    const { error: assignmentError } = await supabase
      .from('move_assignments')
      .insert(assignments);

    if (assignmentError) {
      throw assignmentError;
    }

    // Send email notifications to companies
    for (const company of nearbyCompanies) {
      const { error: emailError } = await supabase.functions.invoke(
        'send-verification-email',
        {
          body: {
            companyEmail: company.contact_email,
            companyName: company.name,
            moveRequestId
          }
        }
      );

      if (emailError) {
        console.error(`Failed to send email to company ${company.id}:`, emailError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        companiesNotified: nearbyCompanies.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in notify-companies function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})