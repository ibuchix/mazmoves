import { useAuth } from "@/components/AuthProvider";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function useRoleGuard(allowedRoles: string[]) {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!session?.user) {
        navigate("/login");
        return;
      }

      const { data: userData, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error || !userData || !allowedRoles.includes(userData.role)) {
        navigate("/");
      }
    };

    checkUserRole();
  }, [session, navigate, allowedRoles]);
}