import { useAuth } from "./AuthProvider";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles = [] }: ProtectedRouteProps) {
  const { session, loading, resendVerificationEmail } = useAuth();
  
  // Query to get user role and verification status
  const { data: userData, isLoading: roleLoading } = useQuery({
    queryKey: ["user-role", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      // Check if email is verified
      if (!session.user.email_confirmed_at) {
        toast.error("Please verify your email address", {
          description: (
            <div className="flex flex-col gap-2">
              <p>Check your inbox for the verification link</p>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  resendVerificationEmail();
                }}
                className="text-sm underline text-blue-500 hover:text-blue-600"
              >
                Resend verification email
              </button>
            </div>
          ),
          duration: 8000
        });
        await supabase.auth.signOut();
        return null;
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching user role:", error);
          toast.error("Error checking permissions", {
            description: "Please try again or contact support",
            duration: 5000
          });
          return null;
        }

        if (!data) {
          console.error("No user found with ID:", session.user.id);
          toast.error("User profile not found", {
            description: "Please try logging in again",
            duration: 5000
          });
          return null;
        }

        return data;
      } catch (error: any) {
        // Handle network errors
        console.error("Network error:", error);
        toast.error("Network error", {
          description: "Please check your connection and try again",
          duration: 5000
        });
        return null;
      }
    },
    enabled: !!session?.user?.id,
    retry: 2, // Retry failed requests twice
    retryDelay: 1000, // Wait 1 second between retries
  });

  // Show loading state
  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#040480]"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!session) {
    toast.error("Please login to access this page", {
      description: "You need to be logged in to view this content",
      duration: 5000
    });
    return <Navigate to="/login" replace />;
  }

  // Check role access if roles are specified
  if (allowedRoles.length > 0) {
    if (!userData || !allowedRoles.includes(userData.role)) {
      toast.error("Access denied", {
        description: "Please contact an administrator if you believe this is a mistake",
        duration: 5000
      });
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}