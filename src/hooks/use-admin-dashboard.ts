
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminDashboardData } from "@/types/admin";
import { Tables } from "@/integrations/supabase/types";

type DashboardStats = {
  totalCompanies: number;
  verifiedCompanies: number;
  totalAssignments: number;
  totalRevenue: number;
};

type MaterializedViewData = {
  id: string;
  name: string;
  contact_email: string;
  registration_status: string;
  created_at: string;
  total_assignments: number;
  completed_assignments: number;
};

type RawCompanyData = Tables<'companies'> & {
  move_assignments?: { id: string; status: string }[];
  company_payments?: { amount: number }[];
};

export function useAdminDashboard() {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      // First try to fetch from the materialized view
      const { data: mvData, error: mvError } = await supabase
        .from('admin_dashboard_mv')
        .select('*');
      
      if (mvError) {
        console.error("Error fetching from materialized view:", mvError);
        // Fallback to direct companies query if mv fails
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select(`
            *,
            move_assignments (
              id,
              status
            ),
            company_payments (
              amount
            )
          `);
        
        if (companiesError) {
          throw companiesError;
        }
        
        // Transform the raw data to match AdminDashboardData type
        return (companiesData as RawCompanyData[]).map((company): AdminDashboardData => ({
          company_id: company.id,
          company_name: company.name,
          contact_email: company.contact_email,
          registration_status: (company.registration_status as "pending" | "approved" | "rejected") || "pending",
          registration_date: company.registration_date || '',
          is_verified: company.is_verified || false,
          subscription_status: (company.subscription_status as "trial" | "active" | "suspended" | "terminated") || "trial",
          last_payment_date: company.last_payment_date || null,
          total_assignments: company.move_assignments?.length || 0,
          active_assignments: company.move_assignments?.filter(a => a.status === 'active').length || 0,
          completed_assignments: company.move_assignments?.filter(a => a.status === 'completed').length || 0,
          total_payments: company.company_payments?.length || 0,
          total_paid_amount: company.company_payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
        }));
      }
      
      // Transform materialized view data to match AdminDashboardData
      const mvResults = mvData as MaterializedViewData[];
      return mvResults.map((company): AdminDashboardData => ({
        company_id: company.id,
        company_name: company.name,
        contact_email: company.contact_email,
        registration_status: company.registration_status as "pending" | "approved" | "rejected",
        registration_date: company.created_at,
        is_verified: false, // Default value since it's not in the view
        subscription_status: "trial", // Default value since it's not in the view
        last_payment_date: null,
        total_assignments: company.total_assignments,
        active_assignments: 0, // Not available in the view
        completed_assignments: company.completed_assignments,
        total_payments: 0, // Not available in the view
        total_paid_amount: 0 // Not available in the view
      }));
    },
  });

  const calculateStats = (): DashboardStats => {
    if (!dashboardData) {
      return {
        totalCompanies: 0,
        verifiedCompanies: 0,
        totalAssignments: 0,
        totalRevenue: 0
      };
    }

    return {
      totalCompanies: dashboardData.length,
      verifiedCompanies: dashboardData.filter(c => c.is_verified).length,
      totalAssignments: dashboardData.reduce((sum, c) => sum + (c.total_assignments || 0), 0),
      totalRevenue: dashboardData.reduce((sum, c) => sum + (c.total_paid_amount || 0), 0)
    };
  };

  return {
    dashboardData,
    isLoading,
    error,
    stats: calculateStats()
  };
}
