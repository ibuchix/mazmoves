import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, DollarSign, Calendar, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { format } from "date-fns";
import InvoiceList from "@/components/company/invoices/InvoiceList";
import InvoiceStats from "@/components/company/invoices/InvoiceStats";

export default function CompanyInvoices() {
  const { session } = useAuth();

  const { data: invoiceStats, isLoading: statsLoading } = useQuery({
    queryKey: ["invoice-stats", session?.user?.id],
    queryFn: async () => {
      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("auth_user_id", session?.user?.id)
        .single();

      if (!company) return null;

      const { data, error } = await supabase
        .from("company_invoices")
        .select(`
          id,
          total,
          status,
          paid_at,
          due_date
        `)
        .eq("company_id", company.id);

      if (error) throw error;

      const stats = {
        totalInvoices: data.length,
        totalPaid: data.filter(inv => inv.status === 'paid').length,
        totalAmount: data.reduce((sum, inv) => sum + (inv.total || 0), 0),
        nextDueDate: data
          .filter(inv => inv.status === 'pending' && new Date(inv.due_date) > new Date())
          .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]?.due_date
      };

      return stats;
    },
    enabled: !!session?.user?.id
  });

  if (statsLoading) {
    return <div className="container mx-auto p-6">Loading invoice data...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-[#040480] mb-8">Company Invoices</h1>
      
      <InvoiceStats stats={invoiceStats} />
      <InvoiceList />
    </div>
  );
}