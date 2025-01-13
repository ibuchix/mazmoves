import { Link } from "react-router-dom";
import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardStats from "@/components/company/dashboard/DashboardStats";
import RecentAssignments from "@/components/company/dashboard/RecentAssignments";
import VerificationStatus, { VerificationBadge } from "@/components/company/dashboard/VerificationStatus";
import { useCompanyDashboard } from "@/hooks/use-company-dashboard";
import { useRealtimeAssignments } from "@/hooks/use-realtime-assignments";

export default function CompanyDashboard() {
  useRealtimeAssignments();
  const { company, assignments, stats, verificationMessage } = useCompanyDashboard();

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Company Dashboard</h1>
          <div className="flex items-center gap-4">
            <VerificationBadge isVerified={company?.is_verified || false} />
            <Link to="/company/invoices">
              <Button className="bg-[#040480] hover:bg-[#1f3dd2]">
                <Receipt className="w-4 h-4 mr-2" />
                View Invoices
              </Button>
            </Link>
          </div>
        </div>
        <VerificationStatus 
          isVerified={company?.is_verified || false}
          verificationDate={company?.verification_date}
          message={verificationMessage}
        />
      </div>
      
      <DashboardStats stats={stats} />
      <RecentAssignments assignments={assignments} />
    </div>
  );
}