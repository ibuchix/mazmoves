// Changes: require service-role bearer (cron path) or admin JWT.
// Switched internal client to service role so RLS does not block invoice creation.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.18.0'
import { requireAdminOrService } from "../_shared/require-admin-or-service.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const auth = await requireAdminOrService(req, corsHeaders)
    if (auth instanceof Response) return auth

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    const { companyId, billingCycleId } = await req.json()

    // Get company details
    const { data: company, error: companyError } = await supabaseClient
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      throw new Error('Company not found')
    }

    // Get billing cycle details
    const { data: billingCycle, error: cycleError } = await supabaseClient
      .from('billing_cycles')
      .select('*')
      .eq('id', billingCycleId)
      .single()

    if (cycleError || !billingCycle) {
      throw new Error('Billing cycle not found')
    }

    // Get completed assignments for the billing cycle
    const { data: assignments, error: assignmentsError } = await supabaseClient
      .from('move_assignments')
      .select(`
        id,
        actual_cost,
        completion_notes,
        move_requests (
          pickup_address,
          delivery_address
        )
      `)
      .eq('company_id', companyId)
      .eq('status', 'completed')
      .gte('completed_at', billingCycle.start_date)
      .lte('completed_at', billingCycle.end_date)

    if (assignmentsError) {
      throw new Error('Failed to fetch assignments')
    }

    // Calculate totals
    const subtotal = assignments.reduce((sum, assignment) => sum + (assignment.actual_cost || 0), 0)
    const taxRate = 0.1 // 10% tax rate
    const tax = subtotal * taxRate
    const total = subtotal + tax

    // Create Stripe invoice
    const stripeInvoice = await stripe.invoices.create({
      customer: company.stripe_customer_id,
      collection_method: 'send_invoice',
      days_until_due: 30,
      metadata: {
        billing_cycle_id: billingCycleId,
        company_id: companyId
      }
    })

    // Create invoice in database
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('company_invoices')
      .insert({
        company_id: companyId,
        billing_cycle_id: billingCycleId,
        stripe_invoice_id: stripeInvoice.id,
        stripe_customer_id: company.stripe_customer_id,
        subtotal,
        tax,
        total,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft'
      })
      .select()
      .single()

    if (invoiceError) {
      throw new Error('Failed to create invoice')
    }

    // Create invoice items
    const invoiceItems = assignments.map(assignment => ({
      invoice_id: invoice.id,
      assignment_id: assignment.id,
      amount: assignment.actual_cost,
      description: `Move service from ${assignment.move_requests.pickup_address.city} to ${assignment.move_requests.delivery_address.city}`
    }))

    const { error: itemsError } = await supabaseClient
      .from('invoice_items')
      .insert(invoiceItems)

    if (itemsError) {
      throw new Error('Failed to create invoice items')
    }

    return new Response(
      JSON.stringify({ invoice_id: invoice.id }),
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