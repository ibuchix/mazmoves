import { useAuth } from "./AuthProvider";
import { Navigate } from "react-router-dom";
import { useRoleGuard } from "@/hooks/use-role-guard";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles = [] }: ProtectedRouteProps) {
  const { session, loading } = useAuth();
  
  // Use the role guard if roles are specified
  if (allowedRoles.length > 0) {
    useRoleGuard(allowedRoles);
  }

  // Show loading state
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}