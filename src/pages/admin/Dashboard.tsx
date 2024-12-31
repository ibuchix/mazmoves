import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, CheckCircle, AlertCircle } from "lucide-react";
import { AdminDashboardData } from "@/types/admin";

export default function AdminDashboard() {
  const { data: dashboardData } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_dashboard_mv')
        .select('*');
      
      if (error) throw error;
      return data as AdminDashboardData[];
    },
  });

  const stats = {
    totalCompanies: dashboardData?.length || 0,
    verifiedCompanies: dashboardData?.filter(c => c.is_verified).length || 0,
    totalAssignments: dashboardData?.reduce((sum, c) => sum + (c.total_assignments || 0), 0) || 0,
    totalRevenue: dashboardData?.reduce((sum, c) => sum + (parseFloat(c.total_paid_amount) || 0), 0) || 0,
  };

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
              {dashboardData?.map((company) => (
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
                  <TableCell>${parseFloat(company.total_paid_amount).toFixed(2)}</TableCell>
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
    </div>
  );
}