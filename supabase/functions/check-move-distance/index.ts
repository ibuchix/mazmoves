import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RADIUS_MILES = 25;

// Haversine formula implementation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get move request details
    const { data: moveRequest, error: requestError } = await supabase
      .from('move_requests')
      .select('pickup_latitude, pickup_longitude')
      .eq('id', record.request_id)
      .single();

    if (requestError) throw requestError;

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('latitude, longitude')
      .eq('id', record.company_id)
      .single();

    if (companyError) throw companyError;

    // Calculate distance
    const distance = calculateDistance(
      moveRequest.pickup_latitude,
      moveRequest.pickup_longitude,
      company.latitude,
      company.longitude
    );

    console.log(`Distance calculated: ${distance} miles`);

    // If distance is greater than radius, delete the assignment
    if (distance > RADIUS_MILES) {
      const { error: deleteError } = await supabase
        .from('move_assignments')
        .delete()
        .eq('id', record.id);

      if (deleteError) throw deleteError;
      
      return new Response(
        JSON.stringify({ 
          message: `Assignment deleted - company is ${Math.round(distance)} miles away (outside ${RADIUS_MILES} mile radius)`,
          distance 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: `Assignment kept - company is ${Math.round(distance)} miles away`,
        distance 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-move-distance function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});