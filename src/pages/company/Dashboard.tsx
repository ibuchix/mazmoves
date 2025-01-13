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

  // Strict boolean check for verification status
  const isVerified = company?.is_verified === true;
  
  console.log("Dashboard render verification status:", { 
    company,
    isVerified,
    verificationDate: company?.verification_date 
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Company Dashboard</h1>
          <div className="flex items-center gap-4">
            <VerificationBadge isVerified={isVerified} />
            <Link to="/company/invoices">
              <Button className="bg-[#040480] hover:bg-[#1f3dd2]">
                <Receipt className="w-4 h-4 mr-2" />
                View Invoices
              </Button>
            </Link>
          </div>
        </div>
        <VerificationStatus 
          isVerified={isVerified}
          verificationDate={company?.verification_date}
          message={verificationMessage}
        />
      </div>
      
      <DashboardStats stats={stats} />
      <RecentAssignments assignments={assignments} />
    </div>
  );
}