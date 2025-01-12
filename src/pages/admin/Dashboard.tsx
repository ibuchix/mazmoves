import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, CheckCircle, AlertCircle } from "lucide-react";
import { AdminDashboardData } from "@/types/admin";
import { Tables } from "@/types/database";

type DashboardStats = {
  totalCompanies: number;
  verifiedCompanies: number;
  totalAssignments: number;
  totalRevenue: number;
};

type MaterializedViewData = {
  id: number;
  pending_companies: number;
  rejected_companies: number;
  total_companies: number;
  verified_companies: number;
};

type CompanyData = AdminDashboardData & {
  move_assignments?: { id: string; status: string }[];
  company_payments?: { amount: number }[];
};

export default function AdminDashboard() {
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
        
        return (companiesData as CompanyData[]).map((company) => ({
          company_id: company.id,
          company_name: company.name,
          contact_email: company.contact_email,
          registration_status: company.registration_status,
          registration_date: company.registration_date,
          is_verified: company.is_verified,
          subscription_status: company.subscription_status,
          last_payment_date: company.last_payment_date,
          total_assignments: company.move_assignments?.length || 0,
          active_assignments: company.move_assignments?.filter(a => a.status === 'active').length || 0,
          completed_assignments: company.move_assignments?.filter(a => a.status === 'completed').length || 0,
          total_payments: company.company_payments?.length || 0,
          total_paid_amount: company.company_payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
        }));
      }
      
      return mvData as MaterializedViewData[];
    },
  });

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading dashboard data...</div>;
  }

  if (error) {
    console.error("Dashboard error:", error);
    return <div className="container mx-auto p-6">Error loading dashboard data. Please try again.</div>;
  }

  const calculateStats = (): DashboardStats => {
    if (!dashboardData) {
      return {
        totalCompanies: 0,
        verifiedCompanies: 0,
        totalAssignments: 0,
        totalRevenue: 0
      };
    }

    // If it's materialized view data
    if ('total_companies' in dashboardData[0]) {
      const mvData = dashboardData as MaterializedViewData[];
      return {
        totalCompanies: mvData[0].total_companies,
        verifiedCompanies: mvData[0].verified_companies,
        totalAssignments: 0, // Not available in materialized view
        totalRevenue: 0 // Not available in materialized view
      };
    }

    // If it's detailed company data
    const companyData = dashboardData as AdminDashboardData[];
    return {
      totalCompanies: companyData.length,
      verifiedCompanies: companyData.filter(c => c.is_verified).length,
      totalAssignments: companyData.reduce((sum, c) => sum + (c.total_assignments || 0), 0),
      totalRevenue: companyData.reduce((sum, c) => sum + (c.total_paid_amount || 0), 0)
    };
  };

  const stats = calculateStats();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-[#040480] mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies.toString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Verified Companies</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedCompanies.toString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments.toString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Only show companies table if we have detailed company data */}
      {'company_name' in (dashboardData?.[0] || {}) && (
        <Card>
          <CardHeader>
            <CardTitle>Companies Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignments</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Last Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(dashboardData as AdminDashboardData[]).map((company) => (
                  <TableRow key={company.company_id}>
                    <TableCell className="font-medium">{company.company_name}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={company.is_verified ? "default" : "secondary"}
                        className={company.is_verified ? "bg-[#84d21f]" : ""}
                      >
                        {company.registration_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {company.total_assignments.toString()} 
                      {company.active_assignments > 0 && 
                        <span className="text-[#84d21f] ml-1">
                          ({company.active_assignments} active)
                        </span>
                      }
                    </TableCell>
                    <TableCell>${company.total_paid_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {company.last_payment_date 
                        ? new Date(company.last_payment_date).toLocaleDateString()
                        : 'No payments'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}