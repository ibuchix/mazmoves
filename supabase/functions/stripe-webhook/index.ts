import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.18.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    )

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        const { invoice_id } = paymentIntent.metadata

        // Update invoice status
        const { error: updateError } = await supabaseClient
          .from('company_invoices')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString()
          })
          .eq('id', invoice_id)

        if (updateError) {
          throw new Error('Failed to update invoice status')
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        const { invoice_id } = paymentIntent.metadata

        // Update invoice status
        const { error: updateError } = await supabaseClient
          .from('company_invoices')
          .update({
            status: 'failed'
          })
          .eq('id', invoice_id)

        if (updateError) {
          throw new Error('Failed to update invoice status')
        }

        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    )
  }
})