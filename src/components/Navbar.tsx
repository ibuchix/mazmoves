import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AuthButton from "./navbar/AuthButton";
import RoleLinks from "./navbar/RoleLinks";
import MobileMenu from "./navbar/MobileMenu";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { session } = useAuth();

  const { data: userData } = useQuery({
    queryKey: ["user", session?.user?.id],
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/">
              <img 
                src="/lovable-uploads/b700dde9-463e-4b6e-8523-ec9f718b3beb.png" 
                alt="MAZ Moves" 
                className="h-14 transform hover:scale-105 transition-transform duration-200" 
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-[#040480] hover:text-[#1f3dd2] font-medium">Home</Link>
            <Link to="/services" className="text-[#040480] hover:text-[#1f3dd2] font-medium">Services</Link>
            <Link to="/companies" className="text-[#040480] hover:text-[#1f3dd2] font-medium">Companies</Link>
            <Link to="/about" className="text-[#040480] hover:text-[#1f3dd2] font-medium">About</Link>
            <Link to="/contact" className="text-[#040480] hover:text-[#1f3dd2] font-medium">Contact</Link>
            <RoleLinks role={userData?.role} />
          </div>

          <div className="hidden md:block">
            <AuthButton session={session} />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-[#040480] hover:text-[#1f3dd2] p-2 rounded-md transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileMenu 
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          session={session}
          userRole={userData?.role}
        />
      </div>
    </nav>
  );
}