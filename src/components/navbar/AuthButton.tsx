import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthButtonProps {
  session: Session | null;
}

export default function AuthButton({ session }: AuthButtonProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (session) {
    return (
      <Button 
        onClick={handleLogout}
        className="bg-[#d2491f] hover:bg-[#84d21f] text-white px-4 py-1 h-8 text-sm font-medium"
      >
        Logout
      </Button>
    );
  }

  return (
    <Link to="/login">
      <Button className="bg-[#d2491f] hover:bg-[#84d21f] text-white px-4 py-1 h-8 text-sm font-medium">
        Login
      </Button>
    </Link>
  );
}