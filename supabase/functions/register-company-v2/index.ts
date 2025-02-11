
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts"
import { verifyOrigin } from "../_shared/verify-origin.ts"
import { handleRegistration } from "./handlers.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Start a transaction for atomic operations
  const { data: client } = await supabase.rpc('begin_transaction');

  try {
    // Verify request origin
    if (!verifyOrigin(req)) {
      console.error('Registration failed: Invalid origin', {
        origin: req.headers.get('origin'),
        referer: req.headers.get('referer')
      });
      return new Response(
        JSON.stringify({ 
          error: 'Invalid origin',
          details: ['Request origin not allowed']
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result = await handleRegistration(req, supabase);
    
    // Commit transaction on success
    await supabase.rpc('commit_transaction');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Company registered successfully',
        company: result.company
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Registration error:', error);
    await supabase.rpc('rollback_transaction');

    // Parse error message and details
    let errorMessage = error.message;
    let details = [errorMessage];
    try {
      if (errorMessage.includes('{')) {
        const errorData = JSON.parse(errorMessage);
        errorMessage = errorData.error || errorMessage;
        details = errorData.details || details;
      }
    } catch (e) {
      // If parsing fails, use original message
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: details
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
