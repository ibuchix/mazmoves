// notify-companies edge function
// ------------------------------
// Given a `moveRequestId`, this function:
//   1. Loads the move request.
//   2. Finds verified, active companies within RADIUS_MILES of BOTH the
//      pickup AND delivery locations (union, deduped by company_id) — a
//      company near either endpoint is eligible to receive the job.
//   3. Inserts one row per unique matched company into `move_assignments`
//      so the job appears on each company's dashboard. Lets the `status`
//      column use its DB default (`'active'`).
//   4. Updates the move request status to `'assigned'` if at least one
//      assignment was created, otherwise `'no_companies_found'`.
//
// Email notifications are intentionally NOT sent here — they will be added
// back in a separate follow-up task alongside the customer confirmation
// email work.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyOrigin, corsHeaders } from "../_shared/verify-origin.ts";
import { findNearbyCompanies } from "./company-finder.ts";
import { RADIUS_MILES } from "./distance.ts";
import type { MoveRequest } from "./types.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!verifyOrigin(req)) {
      return new Response(
        JSON.stringify({ error: "Unauthorized origin" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Accept either { moveRequestId } or { requestId } for backwards compat
    // with the older client helper.
    const body = await req.json().catch(() => ({}));
    const moveRequestId: string | undefined = body.moveRequestId ?? body.requestId;

    if (!moveRequestId) {
      return new Response(
        JSON.stringify({ error: "moveRequestId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // 1. Load the move request.
    const { data: moveRequest, error: moveRequestError } = await supabase
      .from("move_requests")
      .select("*")
      .eq("id", moveRequestId)
      .single<MoveRequest>();

    if (moveRequestError || !moveRequest) {
      console.error("Move request not found:", moveRequestError);
      return new Response(
        JSON.stringify({ error: "Move request not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Find nearby companies — pickup first, then delivery.
    let { assignments: matches, locationUsed } = await findNearbyCompanies(
      supabase,
      moveRequest,
      false,
    );

    if (matches.length === 0) {
      const fallback = await findNearbyCompanies(supabase, moveRequest, true);
      matches = fallback.assignments;
      locationUsed = fallback.locationUsed;
    }

    console.log(
      `notify-companies: request ${moveRequestId} matched ${matches.length} companies via ${locationUsed} (radius ${RADIUS_MILES}mi)`,
    );

    // 3. Insert assignments. Let `status` use its default ('active').
    if (matches.length > 0) {
      const rows = matches.map((m) => ({
        request_id: moveRequestId,
        company_id: m.company.id,
      }));

      const { error: assignmentError } = await supabase
        .from("move_assignments")
        .insert(rows);

      if (assignmentError) {
        console.error("Failed to insert assignments:", assignmentError);
        return new Response(
          JSON.stringify({ error: assignmentError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // 4. Update the move request status.
    const newStatus = matches.length > 0 ? "assigned" : "no_companies_found";
    const { error: statusError } = await supabase
      .from("move_requests")
      .update({ status: newStatus })
      .eq("id", moveRequestId);

    if (statusError) {
      console.error("Failed to update move request status:", statusError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        companiesMatched: matches.length,
        locationUsed,
        status: newStatus,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in notify-companies function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
