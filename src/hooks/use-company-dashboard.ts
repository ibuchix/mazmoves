import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { MoveAssignmentWithRequest } from "@/types/move";

export function useCompanyDashboard() {
  const { session } = useAuth();
  const navigate = useNavigate();

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
        console.error("Error fetching company data:", error);
        throw error;
      }
      
      if (!data) {
        console.error("Company profile not found");
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

  const verificationMessage = company?.is_verified
    ? "Your company is verified and can receive move assignments"
    : "Your company is pending verification. You will be notified once verified.";

  return {
    company,
    assignments,
    stats,
    verificationMessage,
    refetch
  };
}