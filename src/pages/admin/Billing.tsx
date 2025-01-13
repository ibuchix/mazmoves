import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BillingStats from "@/components/admin/billing/BillingStats";
import BillingTable from "@/components/admin/billing/BillingTable";

export default function AdminBilling() {
  const { data: billingData, isLoading } = useQuery({
    queryKey: ["admin-billing"],
    queryFn: async () => {
      const { data: invoices, error: invoicesError } = await supabase
        .from("company_invoices")
        .select(`
          id,
          total,
          status,
          companies (
            name,
            contact_email
          )
        `);

      if (invoicesError) throw invoicesError;

      const stats = {
        totalRevenue: invoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.total : 0), 0),
        pendingAmount: invoices.reduce((sum, inv) => sum + (inv.status === 'pending' ? inv.total : 0), 0),
        totalInvoices: invoices.length,
        paidInvoices: invoices.filter(inv => inv.status === 'paid').length
      };

      return {
        stats,
        invoices
      };
    }
  });

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading billing data...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-[#040480] mb-8">Billing Dashboard</h1>
      
      <BillingStats stats={billingData?.stats} />
      <BillingTable invoices={billingData?.invoices} />
    </div>
  );
}