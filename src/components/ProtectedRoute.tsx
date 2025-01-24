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
  const { session, loading } = useAuth();
  
  // Query to get user role and verification status
  const { data: userData, isLoading: roleLoading } = useQuery({
    queryKey: ["user-role", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      // Check if email is verified
      if (!session.user.email_confirmed_at) {
        toast.error("Please verify your email address before accessing this page");
        await supabase.auth.signOut();
        return null;
      }

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching user role:", error);
        toast.error("Error checking user permissions");
        return null;
      }

      if (!data) {
        console.error("No user found with ID:", session.user.id);
        toast.error("User profile not found");
        return null;
      }

      return data;
    },
    enabled: !!session?.user?.id,
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
    toast.error("Please login to access this page");
    return <Navigate to="/login" replace />;
  }

  // Check role access if roles are specified
  if (allowedRoles.length > 0) {
    if (!userData || !allowedRoles.includes(userData.role)) {
      toast.error("You don't have permission to access this page");
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}