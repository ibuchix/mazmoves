import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRealtimeAssignments } from "@/hooks/use-realtime-assignments";
import { Truck, Clock, CheckCircle, XCircle, ShieldCheck, AlertCircle } from "lucide-react";
import { MoveAssignmentWithRequest } from "@/types/move";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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
          company.refetch();
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

  const getVerificationStatus = () => {
    if (company?.is_verified) {
      return {
        badge: (
          <Badge 
            className="flex items-center gap-1 bg-[#84d21f] hover:bg-[#84d21f] text-white px-3 py-1"
          >
            <ShieldCheck className="h-4 w-4" />
            Verified Company
          </Badge>
        ),
        message: "Your company is verified and can receive move assignments"
      };
    } else {
      return {
        badge: (
          <Badge 
            className="flex items-center gap-1 bg-[#d2491f] hover:bg-[#d2491f] text-white px-3 py-1"
          >
            <AlertCircle className="h-4 w-4" />
            Pending Verification
          </Badge>
        ),
        message: "Your company is pending verification. You will be notified once verified."
      };
    }
  };

  const verificationStatus = getVerificationStatus();

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Company Dashboard</h1>
          {verificationStatus.badge}
        </div>
        <Card className="bg-slate-50">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">
              {verificationStatus.message}
              {company?.verification_date && (
                <span className="block mt-1 text-xs">
                  Verified on: {new Date(company.verification_date).toLocaleDateString()}
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Estimates</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Moves</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignments?.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">
                    {assignment.move_requests.pickup_address.city} to{" "}
                    {assignment.move_requests.delivery_address.city}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Customer: {assignment.move_requests.customer_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Requested for: {new Date(assignment.move_requests.requested_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    Status: {assignment.status}
                  </span>
                  {assignment.estimated_cost && (
                    <span className="text-sm font-medium">
                      Est. Cost: ${assignment.estimated_cost}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}