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

    const { invoiceId } = await req.json()

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('company_invoices')
      .select('*, companies(*)')
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found')
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(invoice.total * 100), // Convert to cents
      currency: 'usd',
      customer: invoice.stripe_customer_id,
      metadata: {
        invoice_id: invoice.id,
        company_id: invoice.company_id
      }
    })

    // Update invoice with payment intent
    const { error: updateError } = await supabaseClient
      .from('company_invoices')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        status: 'pending'
      })
      .eq('id', invoiceId)

    if (updateError) {
      throw new Error('Failed to update invoice')
    }

    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret
      }),
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