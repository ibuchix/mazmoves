// Changes: require JWT; caller must be the company owner (auth_user_id) or an admin.
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
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { companyId } = await req.json()
    if (!companyId) {
      return new Response(JSON.stringify({ error: 'companyId required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
      })
    }

    const auth = await requireCompanyOwnerOrAdmin(req, companyId, corsHeaders)
    if (auth instanceof Response) return auth
    const { company } = auth

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2023-10-16' })

    let stripeCustomerId = company.stripe_customer_id

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: company.contact_email,
        name: company.name,
        metadata: { company_id: company.id }
      })
      stripeCustomerId = customer.id

      const { error: updateError } = await supabaseClient
        .from('companies')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', companyId)

      if (updateError) throw new Error('Failed to update company with Stripe customer ID')
    }

    return new Response(
      JSON.stringify({ stripe_customer_id: stripeCustomerId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
