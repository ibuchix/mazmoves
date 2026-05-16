// Changes: require JWT; caller must own the invoice's company or be admin.
// Uses service role internally.
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
    const { invoiceId } = await req.json()
    if (!invoiceId) {
      return new Response(JSON.stringify({ error: 'invoiceId required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('company_invoices')
      .select('*, companies(*)')
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) throw new Error('Invoice not found')

    const auth = await requireCompanyOwnerOrAdmin(req, invoice.company_id, corsHeaders)
    if (auth instanceof Response) return auth

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2023-10-16' })

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(invoice.total * 100),
      currency: 'usd',
      customer: invoice.stripe_customer_id,
      metadata: { invoice_id: invoice.id, company_id: invoice.company_id }
    })

    const { error: updateError } = await supabaseClient
      .from('company_invoices')
      .update({ stripe_payment_intent_id: paymentIntent.id, status: 'pending' })
      .eq('id', invoiceId)

    if (updateError) throw new Error('Failed to update invoice')

    return new Response(
      JSON.stringify({ client_secret: paymentIntent.client_secret }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
