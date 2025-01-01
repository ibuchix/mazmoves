import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { RADIUS_MILES } from '../notify-companies/distance.ts';

const BATCH_SIZE = 50; // Process 50 requests at a time

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

    // Get unprocessed move requests
    const { data: requests, error: requestError } = await supabase
      .from('move_requests')
      .select('*')
      .eq('status', 'pending')
      .limit(BATCH_SIZE);

    if (requestError) throw requestError;

    // Get all verified companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .eq('is_verified', true)
      .eq('is_active', true);

    if (companiesError) throw companiesError;

    const assignments = [];
    const processedRequests = new Set();

    for (const request of requests) {
      // Skip if no coordinates
      if (!request.pickup_location || !request.delivery_location) continue;

      const matchingCompanies = [];

      // Find companies within radius of pickup location
      const { data: nearbyCompanies, error: nearbyError } = await supabase
        .rpc('find_companies_within_radius', {
          point: request.pickup_location,
          radius_miles: RADIUS_MILES
        });

      if (nearbyError) throw nearbyError;

      for (const company of nearbyCompanies) {
        matchingCompanies.push({
          company_id: company.id,
          request_id: request.id,
          distance: company.distance,
          location_used: 'pickup'
        });
      }

      // If no companies found near pickup, try delivery location
      if (matchingCompanies.length === 0) {
        const { data: deliveryCompanies, error: deliveryError } = await supabase
          .rpc('find_companies_within_radius', {
            point: request.delivery_location,
            radius_miles: RADIUS_MILES
          });

        if (deliveryError) throw deliveryError;

        for (const company of deliveryCompanies) {
          matchingCompanies.push({
            company_id: company.id,
            request_id: request.id,
            distance: company.distance,
            location_used: 'delivery'
          });
        }
      }

      // Create assignments for matching companies
      if (matchingCompanies.length > 0) {
        assignments.push(...matchingCompanies);
        processedRequests.add(request.id);
      }
    }

    // Batch insert assignments
    if (assignments.length > 0) {
      const { error: assignError } = await supabase
        .from('move_assignments')
        .insert(assignments);

      if (assignError) throw assignError;

      // Update processed requests status
      const { error: updateError } = await supabase
        .from('move_requests')
        .update({ status: 'assigned' })
        .in('id', Array.from(processedRequests));

      if (updateError) throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedRequests.size,
        assignments: assignments.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-matches function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});