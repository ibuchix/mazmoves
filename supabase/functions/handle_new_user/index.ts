import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const payload = await req.json()
  const { record } = payload

  if (!record?.id || !record?.email) {
    return new Response(
      JSON.stringify({ message: 'No user data found in payload' }),
      { status: 400 }
    )
  }

  const { error } = await supabaseClient
    .from('users')
    .upsert({
      id: record.id,
      email: record.email,
      role: record.user_metadata?.role || 'company',
      full_name: record.email // Using email as full_name temporarily
    }, {
      onConflict: 'email'
    })

  if (error) {
    console.error('Error creating user record:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    )
  }

  return new Response(
    JSON.stringify({ message: 'User record created successfully' }),
    { status: 200 }
  )
})