import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRealtimeAssignments } from "@/hooks/use-realtime-assignments";
import { Truck, Clock, CheckCircle, XCircle } from "lucide-react";

export default function CompanyDashboard() {
  const { session } = useAuth();
  const navigate = useNavigate();
  
  // Use realtime updates for assignments
  useRealtimeAssignments();

  // Redirect if not logged in or not a company
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

  // Fetch company data
  const { data: company } = useQuery({
    queryKey: ["company", session?.user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("contact_email", session?.user?.email)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.email,
  });

  // Fetch assignments
  const { data: assignments } = useQuery({
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
      return data;
    },
    enabled: !!company?.id,
  });

  const stats = {
    active: assignments?.filter(a => a.status === 'active').length || 0,
    completed: assignments?.filter(a => a.status === 'completed').length || 0,
    cancelled: assignments?.filter(a => a.status === 'cancelled').length || 0,
    pending: assignments?.filter(a => a.status === 'active' && !a.estimated_cost).length || 0,
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Company Dashboard</h1>
      
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