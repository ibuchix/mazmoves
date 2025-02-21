
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

  // Query to get user role and company data
  const { data: userData, isLoading } = useQuery({
    queryKey: ["user-role", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      console.log("Fetching user data for:", session.user.email);
      
      // First check if there's a company profile
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("contact_email", session.user.email)
        .single();
      
      if (companyError) {
        console.error("Error fetching company:", companyError);
        return null;
      }

      if (!companyData) {
        console.log("No company profile found for:", session.user.email);
        toast.error("Company profile not found", {
          description: "Please contact support if you believe this is an error"
        });
        return null;
      }

      console.log("Company data found:", companyData);
      
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();
      
      if (userError) {
        console.error("Error fetching user role:", userError);
        return null;
      }

      return {
        role: userData?.role || 'company',
        company: companyData
      };
    },
    enabled: !!session?.user?.id,
  });

  const handleDashboardClick = () => {
    if (!session) {
      navigate('/login');
      return;
    }

    if (isLoading) {
      toast.info("Loading your profile...");
      return;
    }

    // Navigate based on user role and company status
    if (userData?.company) {
      if (!userData.company.is_verified) {
        toast.error("Your company is pending verification", {
          description: "You will be notified once verified"
        });
        return;
      }
      navigate('/company/dashboard');
    } else {
      toast.error("No company profile found", {
        description: "Please contact support if you believe this is an error"
      });
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
