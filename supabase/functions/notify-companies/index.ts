import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
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

    // Create assignments for companies within 30km
    const assignments = [];
    for (const company of companies) {
      // Create assignment
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

      assignments.push(assignment);
    }

    return new Response(
      JSON.stringify({ success: true, assignmentCount: assignments.length }),
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