// process-matches edge function (backstop)
// ----------------------------------------
// Sweeps pending move_requests and runs the same matching logic as
// notify-companies. This is the safety net for any request whose inline
// match failed (e.g. geocoding returned late, function timed out, no
// companies were available at the time, etc.).
//
// For each pending request:
//   1. Search verified+active companies within RADIUS_MILES of BOTH
//      pickup_location AND delivery_location, then UNION + dedupe by
//      company_id (a company near either endpoint is eligible).
//   2. Insert one move_assignments row per unique matched company
//      (status defaults to 'active').
//   3. Update the move_request status to 'assigned' or
//      'no_companies_found' so it isn't re-processed every cycle.
//
// Email notifications are intentionally NOT sent here — deferred to the
// follow-up email task.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Kept in sync with supabase/functions/notify-companies/distance.ts
const RADIUS_MILES = 25;
const BATCH_SIZE = 50;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PendingRequest {
  id: string;
  pickup_location: unknown | null;
  delivery_location: unknown | null;
}

const matchOne = async (
  supabase: any,
  request: PendingRequest,
): Promise<{ companyIds: string[]; breakdown: { pickup: number; delivery: number; both: number; unique: number } }> => {
  const tryPoint = async (
    point: unknown,
    label: "pickup" | "delivery",
  ): Promise<string[]> => {
    if (!point) return [];
    const { data, error } = await supabase.rpc("find_companies_within_radius", {
      point,
      radius_miles: RADIUS_MILES,
    });
    if (error) {
      console.error(`process-matches: RPC error for ${label} on ${request.id}:`, error);
      return [];
    }
    return (data ?? []).map((row: { id: string }) => row.id);
  };

  const pickupIds = await tryPoint(request.pickup_location, "pickup");
  const deliveryIds = await tryPoint(request.delivery_location, "delivery");

  const pickupSet = new Set(pickupIds);
  const deliverySet = new Set(deliveryIds);
  const unionSet = new Set<string>([...pickupIds, ...deliveryIds]);
  const both = [...unionSet].filter((id) => pickupSet.has(id) && deliverySet.has(id)).length;

  return {
    companyIds: [...unionSet],
    breakdown: {
      pickup: pickupIds.length,
      delivery: deliveryIds.length,
      both,
      unique: unionSet.size,
    },
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: requests, error: requestError } = await supabase
      .from("move_requests")
      .select("id, pickup_location, delivery_location")
      .eq("status", "pending")
      .limit(BATCH_SIZE);

    if (requestError) throw requestError;

    let assignmentsCreated = 0;
    let requestsAssigned = 0;
    let requestsUnmatched = 0;

    for (const request of (requests ?? []) as PendingRequest[]) {
      // No coordinates at all — leave it for now (it'll be picked up once
      // geocoding fills locations in, e.g. via a future re-run).
      if (!request.pickup_location && !request.delivery_location) continue;

      const { companyIds } = await matchOne(supabase, request);

      if (companyIds.length === 0) {
        await supabase
          .from("move_requests")
          .update({ status: "no_companies_found" })
          .eq("id", request.id);
        requestsUnmatched += 1;
        continue;
      }

      const rows = companyIds.map((cid) => ({
        request_id: request.id,
        company_id: cid,
      }));

      // Idempotent insert — relies on the (request_id, company_id) UNIQUE
      // constraint to ignore rows already created by a prior cron sweep
      // or by notify-companies at submission time.
      const { error: insertErr } = await supabase
        .from("move_assignments")
        .upsert(rows, { onConflict: "request_id,company_id", ignoreDuplicates: true });

      if (insertErr) {
        console.error(`process-matches: insert failed for ${request.id}:`, insertErr);
        continue;
      }

      const { error: statusErr } = await supabase
        .from("move_requests")
        .update({ status: "assigned" })
        .eq("id", request.id);

      if (statusErr) {
        console.error(`process-matches: status update failed for ${request.id}:`, statusErr);
      }

      assignmentsCreated += rows.length;
      requestsAssigned += 1;
    }

    return new Response(
      JSON.stringify({
        success: true,
        scanned: requests?.length ?? 0,
        requestsAssigned,
        requestsUnmatched,
        assignmentsCreated,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in process-matches function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
