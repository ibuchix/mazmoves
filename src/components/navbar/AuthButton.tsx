import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";

interface AuthButtonProps {
  session: Session | null;
}

export default function AuthButton({ session }: AuthButtonProps) {
  const navigate = useNavigate();

  if (session) {
    return (
      <Button 
        variant="outline" 
        className="text-[#040480] border-[#040480] hover:bg-[#040480] hover:text-white"
        onClick={() => navigate('/login')}
      >
        Dashboard
      </Button>
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