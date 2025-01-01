import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { findNearbyCompanies } from './company-finder.ts';
import { Company, MoveRequest, Assignment } from './types.ts';
import { RADIUS_MILES } from './distance.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Get the move request details
    const { data: request, error: requestError } = await supabase
      .from('move_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError) throw requestError;

    // Get all verified companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .eq('is_verified', true)
      .eq('is_active', true);

    if (companiesError) throw companiesError;

    console.log(`Processing move request ${requestId} with ${companies.length} potential companies`);

    // First try pickup location
    let { assignments, locationUsed } = findNearbyCompanies(companies, request);

    // If no companies found near pickup, try delivery location
    if (assignments.length === 0) {
      console.log('No companies found near pickup location, trying delivery location');
      const deliveryResults = findNearbyCompanies(companies, request, true);
      assignments = deliveryResults.assignments;
      locationUsed = deliveryResults.locationUsed;
    }

    // Create assignments for found companies
    const createdAssignments = [];
    for (const { company, distance } of assignments) {
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
              <p>A new moving request has been submitted ${Math.round(distance)} miles from your location 
              (based on the ${locationUsed} address).</p>
              <p>Please check your dashboard for more details.</p>
            `
          }),
        }
      );

      if (!emailResponse.ok) {
        console.error('Error sending email notification to company');
      }

      createdAssignments.push({ ...assignment, distance });
    }

    console.log(`Created ${createdAssignments.length} assignments within ${RADIUS_MILES} mile radius`);

    // If no companies were found within range of either location
    if (createdAssignments.length === 0) {
      // Update move request status to indicate no companies found
      const { error: updateError } = await supabase
        .from('move_requests')
        .update({ status: 'no_companies_found' })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating move request status:', updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        assignmentCount: createdAssignments.length,
        locationUsed,
        message: createdAssignments.length > 0 
          ? `Created ${createdAssignments.length} assignments within ${RADIUS_MILES} mile radius of ${locationUsed} location`
          : `No companies found within ${RADIUS_MILES} miles of either pickup or delivery location`
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