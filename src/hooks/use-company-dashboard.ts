import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { MoveAssignmentWithRequest, transformMoveAssignment } from "@/types/move";
import { CompanyDashboardStats } from "@/types/company";
import { toast } from "sonner";
import * as Sentry from '@sentry/react';

export function useCompanyDashboard() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: company, isLoading: companyLoading, error: companyError, refetch } = useQuery({
    queryKey: ["company", session?.user?.email],
    queryFn: async () => {
      if (!session?.user?.email) {
        const error = new Error("No user email found in session");
        Sentry.captureException(error, {
          tags: {
            location: 'useCompanyDashboard',
            errorType: 'auth_error'
          }
        });
        throw error;
      }

      const email = session.user.email;
      console.log("Fetching company data for email:", email);

      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .ilike("contact_email", email);

      if (error) {
        console.error("Error fetching company:", error);
        Sentry.captureException(error, {
          tags: {
            location: 'useCompanyDashboard',
            errorType: 'database_error',
            email: email
          },
          extra: {
            query: 'companies.select',
            emailUsed: email
          }
        });
        toast.error("Failed to fetch company data");
        throw error;
      }

      // Log email matching issues
      if (!data || data.length === 0) {
        const noMatchError = new Error(`No company found for email: ${email}`);
        Sentry.captureMessage("Email matching failure", {
          level: 'warning',
          tags: {
            location: 'useCompanyDashboard',
            errorType: 'email_match_failure'
          },
          extra: {
            email: email,
            normalizedEmail: email.toLowerCase(),
            sessionEmail: session.user.email
          }
        });
        toast.error("Company profile not found");
        return null;
      }

      if (data.length > 1) {
        const duplicateError = new Error(`Multiple companies found for email: ${email}`);
        Sentry.captureException(duplicateError, {
          level: 'error',
          tags: {
            location: 'useCompanyDashboard',
            errorType: 'duplicate_company'
          },
          extra: {
            email: email,
            companiesFound: data.length
          }
        });
      }

      // Log raw data for debugging
      console.log("Raw company data from database:", data[0]);
      console.log("Verification status:", {
        is_verified: data[0].is_verified,
        verification_date: data[0].verification_date,
        type: typeof data[0].is_verified
      });
      
      return {
        ...data[0],
        is_verified: data[0].is_verified === true // Strict boolean comparison
      };
    },
    enabled: !!session?.user?.email,
    retry: 1
  });

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
          filter: `contact_email=eq.${session.user.email.toLowerCase()}`,
        },
        (payload) => {
          console.log('Real-time update received:', payload);
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

      if (error) {
        Sentry.captureException(error, {
          tags: {
            location: 'useCompanyDashboard',
            errorType: 'assignments_error'
          },
          extra: {
            companyId: company?.id
          }
        });
        throw error;
      }
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
    ? `Your company has been verified. You can now receive move assignments.`
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
