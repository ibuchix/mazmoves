import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { MoveAssignmentWithRequest, transformMoveAssignment } from "@/types/move";
import { CompanyDashboardStats } from "@/types/company";

export function useCompanyDashboard() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: company, isLoading: companyLoading, error: companyError, refetch } = useQuery({
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

  // Subscribe to real-time changes
  useEffect(() => {
    if (!session?.user?.email) return;

    const channel = supabase
      .channel('company_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'companies',
          filter: `contact_email=eq.${session.user.email}`,
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          // Invalidate all related queries
          queryClient.invalidateQueries({ queryKey: ["company"] });
          queryClient.invalidateQueries({ queryKey: ["assignments"] });
          queryClient.invalidateQueries({ queryKey: ["stats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.email, queryClient]);

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
        .eq("company_id", company?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ? data.map(transformMoveAssignment) : [];
    },
    enabled: !!company?.id,
  });

  const { data: stats } = useQuery<CompanyDashboardStats>({
    queryKey: ["stats", company?.id],
    queryFn: async () => {
      if (!assignments) return { active: 0, completed: 0, cancelled: 0, pending: 0 };
      
      return {
        active: assignments.filter(a => a.status === "active").length,
        completed: assignments.filter(a => a.status === "completed").length,
        cancelled: assignments.filter(a => a.status === "cancelled").length,
        pending: assignments.filter(a => !a.status).length
      };
    },
    enabled: !!assignments,
    initialData: { active: 0, completed: 0, cancelled: 0, pending: 0 }
  });

  const verificationMessage = company?.is_verified
    ? "Your company is verified and can receive move assignments"
    : "Your company is pending verification. You will be notified once verified.";

  return {
    company,
    companyLoading,
    companyError,
    assignments,
    stats,
    verificationMessage
  };
}