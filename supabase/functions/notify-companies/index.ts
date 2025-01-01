import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RADIUS_MILES = 25;

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { requestId } = await req.json();

    // Get the move request details with coordinates
    const { data: request, error: requestError } = await supabase
      .from('move_requests')
      .select('*, pickup_latitude, pickup_longitude')
      .eq('id', requestId)
      .single();

    if (requestError) throw requestError;

    // Get all verified companies with coordinates
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*, latitude, longitude')
      .eq('is_verified', true)
      .eq('is_active', true);

    if (companiesError) throw companiesError;

    console.log(`Processing move request ${requestId} with ${companies.length} potential companies`);

    // Create assignments only for companies within 25 miles
    const assignments = [];
    for (const company of companies) {
      if (!company.latitude || !company.longitude || !request.pickup_latitude || !request.pickup_longitude) {
        console.warn('Missing coordinates for company or request');
        continue;
      }

      const distance = calculateDistance(
        request.pickup_latitude,
        request.pickup_longitude,
        company.latitude,
        company.longitude
      );

      console.log(`Company ${company.name} is ${Math.round(distance)} miles away from pickup location`);

      // Only create assignment if company is within radius
      if (distance <= RADIUS_MILES) {
        console.log(`Creating assignment for company ${company.name}`);
        
        const { data: assignment, error: assignmentError } = await supabase
          .from('move_assignments')
          .insert({
            request_id: requestId,
            company_id: company.id,
            status: 'active'
          })
          .select()
          .single();

        if (assignmentError) {
          console.error('Error creating assignment:', assignmentError);
          continue;
        }

        // Send email notification to company
        const emailResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            },
            body: JSON.stringify({
              to: [company.contact_email],
              subject: 'New Move Request Available',
              html: `
                <h2>New Move Request in Your Area</h2>
                <p>A new moving request has been submitted ${Math.round(distance)} miles from your location.</p>
                <p>Please check your dashboard for more details.</p>
              `
            }),
          }
        );

        if (!emailResponse.ok) {
          console.error('Error sending email notification');
        }

        assignments.push({ ...assignment, distance });
      } else {
        console.log(`Company ${company.name} is too far (${Math.round(distance)} miles)`);
      }
    }

    console.log(`Created ${assignments.length} assignments within ${RADIUS_MILES} mile radius`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        assignmentCount: assignments.length,
        message: `Created ${assignments.length} assignments within ${RADIUS_MILES} mile radius`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
});