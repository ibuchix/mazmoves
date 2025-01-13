import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.18.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    const { companyId } = await req.json()

    // Get company details
    const { data: company, error: companyError } = await supabaseClient
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      throw new Error('Company not found')
    }

    // Create or get Stripe customer
    let stripeCustomerId = company.stripe_customer_id

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: company.contact_email,
        name: company.name,
        metadata: {
          company_id: company.id
        }
      })

      stripeCustomerId = customer.id

      // Update company with Stripe customer ID
      const { error: updateError } = await supabaseClient
        .from('companies')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', companyId)

      if (updateError) {
        throw new Error('Failed to update company with Stripe customer ID')
      }
    }

    return new Response(
      JSON.stringify({ stripe_customer_id: stripeCustomerId }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})