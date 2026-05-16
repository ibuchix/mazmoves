// check-move-distance edge function
// Changes: Replaced spoofable origin-only guard with requireWebhookSecret (x-webhook-secret
// or service-role bearer). Validates record.id/request_id/company_id integrity by loading the
// move_assignments row server-side before any delete, preventing forged UUID combinations.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/verify-origin.ts";
import { requireWebhookSecret } from "../_shared/require-webhook-secret.ts";

const RADIUS_MILES = 25;

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authFail = requireWebhookSecret(req, "MOVE_ASSIGNMENT_WEBHOOK_SECRET", corsHeaders);
    if (authFail) return authFail;

    const { record } = await req.json();
    if (!record?.id || !record?.request_id || !record?.company_id) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the assignment row actually exists and its IDs match the payload
    const { data: assignment, error: assignmentError } = await supabase
      .from('move_assignments')
      .select('id, request_id, company_id')
      .eq('id', record.id)
      .maybeSingle();

    if (assignmentError) throw assignmentError;
    if (!assignment ||
        assignment.request_id !== record.request_id ||
        assignment.company_id !== record.company_id) {
      console.warn('check-move-distance: payload integrity mismatch, skipping', { record });
      return new Response(
        JSON.stringify({ skipped: true, reason: 'integrity_mismatch' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: moveRequest, error: requestError } = await supabase
      .from('move_requests')
      .select('pickup_latitude, pickup_longitude')
      .eq('id', record.request_id)
      .single();
    if (requestError) throw requestError;

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('latitude, longitude')
      .eq('id', record.company_id)
      .single();
    if (companyError) throw companyError;

    const distance = calculateDistance(
      moveRequest.pickup_latitude,
      moveRequest.pickup_longitude,
      company.latitude,
      company.longitude
    );

    console.log(`Distance calculated: ${distance} miles`);

    if (distance > RADIUS_MILES) {
      const { error: deleteError } = await supabase
        .from('move_assignments')
        .delete()
        .eq('id', record.id)
        .eq('request_id', record.request_id)
        .eq('company_id', record.company_id);

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
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
