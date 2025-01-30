import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { RADIUS_MILES } from './distance.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

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
    console.log(`Starting to process move request ${requestId}`);

    // Get the move request details
    const { data: request, error: requestError } = await supabase
      .from('move_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError) throw requestError;
    console.log(`Found move request from ${request.customer_name} (${request.customer_email})`);

    // Find nearby companies using the optimized function
    const { data: nearbyCompanies, error: companiesError } = await supabase
      .rpc('find_nearby_companies', {
        pickup_lat: request.pickup_latitude,
        pickup_lng: request.pickup_longitude,
        delivery_lat: request.delivery_latitude,
        delivery_lng: request.delivery_longitude,
        radius_km: RADIUS_MILES * 1.60934 // Convert miles to km
      });

    if (companiesError) throw companiesError;

    console.log(`Found ${nearbyCompanies.length} verified companies within ${RADIUS_MILES} miles`);
    
    if (nearbyCompanies.length === 0) {
      console.log('No verified companies found in range');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No verified companies found in range'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create assignments for the closest companies
    const createdAssignments = [];
    const expandAfter = new Date();
    expandAfter.setMinutes(expandAfter.getMinutes() + 5);

    for (const { company_id, company_name, distance_km } of nearbyCompanies) {
      console.log(`Processing company: ${company_name} (${distance_km.toFixed(2)} km away)`);

      // Get company email
      const { data: company } = await supabase
        .from('companies')
        .select('contact_email')
        .eq('id', company_id)
        .single();

      if (!company?.contact_email) {
        console.error(`No contact email found for company ${company_name}`);
        continue;
      }

      // Check rate limits before proceeding
      const { data: withinHourlyLimit } = await supabase
        .rpc('check_rate_limit', {
          p_company_id: company_id,
          p_limit_type: 'hourly'
        });

      const { data: withinDailyLimit } = await supabase
        .rpc('check_rate_limit', {
          p_company_id: company_id,
          p_limit_type: 'daily'
        });

      if (!withinHourlyLimit || !withinDailyLimit) {
        console.log(`Rate limit reached for company ${company_name}`);
        await supabase
          .from('rate_limit_logs')
          .insert({
            company_id: company_id,
            limit_type: !withinHourlyLimit ? 'hourly' : 'daily'
          });
        continue;
      }

      const { data: assignment, error: assignmentError } = await supabase
        .from('move_assignments')
        .insert({
          request_id: requestId,
          company_id: company_id,
          status: 'active',
          attempt_count: 1,
          expand_after: expandAfter.toISOString()
        })
        .select()
        .single();

      if (assignmentError) {
        console.error(`Error creating assignment for ${company_name}:`, assignmentError);
        continue;
      }

      console.log(`Created assignment for company ${company_name}`);

      // Format addresses for email
      const pickupAddress = Object.values(request.pickup_address).join(', ');
      const deliveryAddress = Object.values(request.delivery_address).join(', ');

      // Send email notification to company
      try {
        console.log(`Sending email notification to ${company_name} at ${company.contact_email}`);
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'MAZ Moves <notifications@mazmoves.com>',
            to: company.contact_email,
            subject: 'New Move Request Available',
            html: `
              <h2>New Move Request Details</h2>
              <p>A new moving request has been submitted ${Math.round(distance_km)} km from your location.</p>
              
              <h3>Customer Information:</h3>
              <ul>
                <li><strong>Name:</strong> ${request.customer_name}</li>
                <li><strong>Email:</strong> ${request.customer_email}</li>
                <li><strong>Phone:</strong> ${request.customer_phone || 'Not provided'}</li>
              </ul>

              <h3>Move Details:</h3>
              <ul>
                <li><strong>Pickup Address:</strong> ${pickupAddress}</li>
                <li><strong>Delivery Address:</strong> ${deliveryAddress}</li>
                <li><strong>Requested Date:</strong> ${new Date(request.requested_date).toLocaleDateString()}</li>
                <li><strong>Property Size:</strong> ${request.estimated_size}</li>
                ${request.special_instructions ? `<li><strong>Special Instructions:</strong> ${request.special_instructions}</li>` : ''}
              </ul>
              
              <p>Please contact the customer directly to provide your quote and discuss the move details.</p>
              
              <p>You can also check your dashboard at <a href="https://mazmoves.com/company/dashboard">https://mazmoves.com/company/dashboard</a> for more information.</p>
            `
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error(`Error sending email notification to company: ${errorText}`);
        } else {
          console.log(`Successfully sent email to ${company_name} at ${company.contact_email}`);
          await supabase
            .from('rate_limit_logs')
            .insert({
              company_id: company_id,
              limit_type: 'hourly'
            });
        }
      } catch (emailError) {
        console.error(`Failed to send email to ${company_name}:`, emailError);
      }

      createdAssignments.push({ ...assignment, distance_km });
    }

    console.log(`Successfully created ${createdAssignments.length} assignments`);

    // If no companies were found within range
    if (createdAssignments.length === 0) {
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
        message: createdAssignments.length > 0 
          ? `Created ${createdAssignments.length} assignments within ${RADIUS_MILES} mile radius`
          : `No companies found within ${RADIUS_MILES} miles of pickup location`
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