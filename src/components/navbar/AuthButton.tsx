import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface AuthButtonProps {
  session: Session | null;
}

export default function AuthButton({ session }: AuthButtonProps) {
  const navigate = useNavigate();

  // Query to get user role
  const { data: userData } = useQuery({
    queryKey: ["user-role", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const handleDashboardClick = () => {
    if (!session) {
      navigate('/login');
      return;
    }

    // Navigate based on user role
    if (userData?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (userData?.role === 'company') {
      navigate('/company/dashboard');
    } else {
      // For other roles or if role not found
      navigate('/');
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Logged out successfully");
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error("Error logging out");
    }
  };

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="text-[#040480] border-[#040480] hover:bg-[#040480] hover:text-white"
          >
            Dashboard
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleDashboardClick}>
            View Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleLogout}
            className="text-red-600 focus:text-red-600 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button 
      className="bg-[#d2491f] hover:bg-[#84d21f] text-white transition-all duration-300"
      onClick={() => navigate('/companies')}
    >
      Join Us
    </Button>
  );
}