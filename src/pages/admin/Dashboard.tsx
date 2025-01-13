import { Link } from "react-router-dom";
import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import CompaniesTable from "@/components/admin/dashboard/CompaniesTable";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";

export default function AdminDashboard() {
  const { dashboardData, isLoading, error, stats } = useAdminDashboard();

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading dashboard data...</div>;
  }

  if (error) {
    console.error("Dashboard error:", error);
    return <div className="container mx-auto p-6">Error loading dashboard data. Please try again.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#040480]">Admin Dashboard</h1>
        <Link to="/admin/billing">
          <Button className="bg-[#040480] hover:bg-[#1f3dd2]">
            <Receipt className="w-4 h-4 mr-2" />
            View Billing
          </Button>
        </Link>
      </div>
      
      <DashboardStats {...stats} />

      {/* Only show companies table if we have detailed company data */}
      {'company_name' in (dashboardData?.[0] || {}) && (
        <CompaniesTable companies={dashboardData} />
      )}
    </div>
  );
}