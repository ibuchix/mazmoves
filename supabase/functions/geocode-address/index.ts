// geocode-address edge function
// -----------------------------
// Forward-geocodes a free-form address string into latitude/longitude using
// the Mapbox Geocoding API. Public contract is unchanged from the previous
// OpenCage-backed implementation:
//   Request:  { address: string }
//   Response: { latitude: number, longitude: number }
// Errors return 500 with { error } so callers can either surface the failure
// or (for non-blocking submission flows) save the request without coords and
// let the backstop matcher retry later. No fallbacks per project rules.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address } = await req.json();

    if (!address || typeof address !== "string" || address.trim() === "") {
      return new Response(
        JSON.stringify({ error: "address is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const MAPBOX_ACCESS_TOKEN = Deno.env.get("MAPBOX_ACCESS_TOKEN");
    if (!MAPBOX_ACCESS_TOKEN) {
      throw new Error("MAPBOX_ACCESS_TOKEN is not configured");
    }

    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${
        encodeURIComponent(address)
      }.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`;

    const response = await fetch(url);
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(
        `Mapbox geocoding failed (${response.status}): ${errText}`,
      );
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new Error("No results found for address");
    }

    // Mapbox returns coordinates as [longitude, latitude].
    const [longitude, latitude] = data.features[0].center;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      throw new Error("Invalid coordinates in Mapbox response");
    }

    return new Response(
      JSON.stringify({ latitude, longitude }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in geocode-address function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
