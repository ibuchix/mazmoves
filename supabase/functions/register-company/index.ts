import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  console.warn('WARNING: This endpoint is deprecated. Please use /register-company-v2 instead');
  
  return new Response(
    JSON.stringify({ 
      error: 'Endpoint deprecated',
      details: 'This endpoint is deprecated. Please use /register-company-v2 instead.'
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 410 // Gone status code
    }
  )
})