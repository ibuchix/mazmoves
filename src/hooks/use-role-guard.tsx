import { useAuth } from "@/components/AuthProvider";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useRoleGuard(allowedRoles: string[]) {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!session?.user) {
        toast.error("Please login to access this page");
        navigate("/login");
        return;
      }

      const { data: userData, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error || !userData || !allowedRoles.includes(userData.role)) {
        toast.error("You don't have permission to access this page");
        navigate("/");
      }
    };

    checkUserRole();
  }, [session, navigate, allowedRoles]);
}