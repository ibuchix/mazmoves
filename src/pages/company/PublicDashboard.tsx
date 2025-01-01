import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MoveAssignmentWithRequest, transformMoveAssignment } from "@/types/move";
import { toast } from "sonner";

export default function PublicDashboard() {
  const { token } = useParams();
  const [company, setCompany] = useState<any>(null);
  const [assignments, setAssignments] = useState<MoveAssignmentWithRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("public_access_token", token)
          .single();

        if (companyError) throw companyError;
        if (!companyData) {
          toast.error("Company not found");
          return;
        }

        setCompany(companyData);

        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from("move_assignments")
          .select(`
            *,
            move_requests (*)
          `)
          .eq("company_id", companyData.id);

        if (assignmentsError) throw assignmentsError;
        
        // Transform the data to match our types
        const transformedAssignments = assignmentsData.map(transformMoveAssignment);
        setAssignments(transformedAssignments);
      } catch (error) {
        console.error("Error fetching company data:", error);
        toast.error("Error loading company dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCompanyData();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#040480]"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-red-500">Company Not Found</h1>
      </div>
    );
  }

  const stats = {
    active: assignments?.filter(a => a.status === 'active').length || 0,
    completed: assignments?.filter(a => a.status === 'completed').length || 0,
    cancelled: assignments?.filter(a => a.status === 'cancelled').length || 0,
    pending: assignments?.filter(a => a.status === 'active' && !a.estimated_cost).length || 0,
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">{company.name} Dashboard</h1>
      
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