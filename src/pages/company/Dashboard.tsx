import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeAssignments } from "@/hooks/use-realtime-assignments";
import { MoveAssignmentWithRequest } from "@/types/move";
import { toast } from "sonner";
import DashboardStats from "@/components/company/dashboard/DashboardStats";
import RecentAssignments from "@/components/company/dashboard/RecentAssignments";
import VerificationStatus, { VerificationBadge } from "@/components/company/dashboard/VerificationStatus";
import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";

export default function CompanyDashboard() {
  const { session } = useAuth();
  const navigate = useNavigate();
  
  useRealtimeAssignments();

  useEffect(() => {
    const checkAuth = async () => {
      if (!session?.user) {
        navigate("/login");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (userData?.role !== "company") {
        navigate("/login");
      }
    };

    checkAuth();
  }, [session, navigate]);

  // Set up real-time subscription for company verification status
  useEffect(() => {
    if (!session?.user?.email) return;

    const channel = supabase
      .channel('public:companies')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'companies',
          filter: `contact_email=eq.${session.user.email}`,
        },
        () => {
          // Refetch company data when changes occur
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.email]);

  const { data: company, refetch } = useQuery({
    queryKey: ["company", session?.user?.email],
    queryFn: async () => {
      console.log("Fetching company data for:", session?.user?.email);
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("contact_email", session?.user?.email)
        .maybeSingle();

      if (error) {
        toast.error("Error fetching company data");
        throw error;
      }
      
      if (!data) {
        toast.error("Company profile not found");
        return null;
      }

      console.log("Company data:", data); // Debug log
      return data;
    },
    enabled: !!session?.user?.email,
  });

  const { data: assignments } = useQuery<MoveAssignmentWithRequest[]>({
    queryKey: ["assignments", company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("move_assignments")
        .select(`
          *,
          move_requests (
            *
          )
        `)
        .eq("company_id", company?.id);

      if (error) throw error;
      
      return data?.map(assignment => ({
        ...assignment,
        move_requests: {
          ...assignment.move_requests,
          pickup_address: assignment.move_requests.pickup_address as any,
          delivery_address: assignment.move_requests.delivery_address as any
        }
      })) as MoveAssignmentWithRequest[];
    },
    enabled: !!company?.id,
  });

  const stats = {
    active: assignments?.filter(a => a.status === 'active').length || 0,
    completed: assignments?.filter(a => a.status === 'completed').length || 0,
    cancelled: assignments?.filter(a => a.status === 'cancelled').length || 0,
    pending: assignments?.filter(a => a.status === 'active' && !a.estimated_cost).length || 0,
  };

  const verificationMessage = company?.is_verified
    ? "Your company is verified and can receive move assignments"
    : "Your company is pending verification. You will be notified once verified.";

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