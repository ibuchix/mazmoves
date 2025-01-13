import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.18.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
});

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
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        
        // Update company billing status
        const { error: updateError } = await supabaseClient
          .from('companies')
          .update({
            billing_status: 'paid_tier',
            stripe_customer_id: subscription.customer,
            subscription_status: subscription.status
          })
          .eq('stripe_customer_id', subscription.customer)

        if (updateError) {
          console.error('Error updating company:', updateError)
          throw updateError
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        
        // Update company billing status back to free tier
        const { error: updateError } = await supabaseClient
          .from('companies')
          .update({
            billing_status: 'free_tier',
            subscription_status: 'canceled',
            free_assignments_remaining: 7 // Reset free assignments
          })
          .eq('stripe_customer_id', subscription.customer)

        if (updateError) {
          console.error('Error updating company:', updateError)
          throw updateError
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