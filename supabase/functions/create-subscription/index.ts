// Changes: require JWT; caller must be the company owner or an admin.
// Uses service role internally for the company lookup/update.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.18.0'
import { requireCompanyOwnerOrAdmin } from "../_shared/require-company-owner.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { company_id } = await req.json()
    if (!company_id) {
      return new Response(JSON.stringify({ error: 'company_id required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
      })
    }

    const auth = await requireCompanyOwnerOrAdmin(req, company_id, corsHeaders)
    if (auth instanceof Response) return auth
    const { company } = auth

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2023-10-16' })

    let customer_id = company.stripe_customer_id

    if (!customer_id) {
      const customer = await stripe.customers.create({
        email: company.contact_email,
        name: company.name,
        metadata: { company_id: company.id }
      })
      customer_id = customer.id

      await supabaseClient
        .from('companies')
        .update({ stripe_customer_id: customer_id })
        .eq('id', company.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer_id,
      line_items: [{ price: 'price_1Qgmm2EfeUtVrIvoQzJWnOyN', quantity: 1 }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/company/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/company/dashboard`,
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error creating subscription:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
