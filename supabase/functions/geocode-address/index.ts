import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address } = await req.json();
    const OPENCAGE_API_KEY = Deno.env.get('OPENCAGE_API_KEY');

    if (!OPENCAGE_API_KEY) {
      throw new Error('OpenCage API key not configured');
    }

    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${OPENCAGE_API_KEY}`
    );

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error('No results found for address');
    }

    const { lat, lng } = data.results[0].geometry;

    return new Response(
      JSON.stringify({ latitude: lat, longitude: lng }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in geocode-address function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});