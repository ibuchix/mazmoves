import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface DataRequest {
  type: 'deletion' | 'export';
  userId: string;
  userEmail: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { type, userId, userEmail } = await req.json() as DataRequest

    // Send email notification about the request
    const { error: emailError } = await supabaseClient.functions.invoke('send-email', {
      body: {
        to: 'ask@mazmoves.com',
        subject: `Data ${type} Request`,
        html: `
          <p>A user has requested their data to be ${type === 'deletion' ? 'deleted' : 'exported'}.</p>
          <p>User ID: ${userId}</p>
          <p>User Email: ${userEmail}</p>
          <p>Please process this request within 30 days.</p>
        `
      }
    })

    if (emailError) throw emailError

    // Log the request
    const { error: logError } = await supabaseClient
      .from('data_requests')
      .insert({
        user_id: userId,
        request_type: type,
        status: 'pending'
      })

    if (logError) throw logError

    return new Response(
      JSON.stringify({ message: 'Request submitted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})