
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AuthButton from "./navbar/AuthButton";
import RoleLinks from "./navbar/RoleLinks";
import MobileMenu from "./navbar/MobileMenu";
import { Button } from "./ui/button";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
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

  // Check if user is registered company
  const isRegisteredCompany = userData?.role === 'company';

  // Handle logo error
  const handleLogoError = () => {
    console.error("Logo failed to load");
    setLogoError(true);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 transition-shadow duration-300 backdrop-blur-sm bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[88px]">
          <div className="flex-shrink-0 transition-transform duration-300 hover:-translate-y-0.5">
            <Link to="/" className="block">
              {!logoError ? (
                <img 
                  src="/lovable-uploads/b700dde9-463e-4b6e-8523-ec9f718b3beb.png" 
                  onError={handleLogoError}
                  alt="MAZ Moves - Your Trusted Moving Partner" 
                  className="h-[72px] w-auto"
                  loading="eager"
                  width="180"
                  height="72"
                />
              ) : (
                <div className="h-[72px] flex items-center">
                  <span className="text-[#040480] text-xl font-bold">MAZ Moves</span>
                </div>
              )}
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-[#040480] hover:text-[#1f3dd2] font-medium transition-all duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:-bottom-1 after:left-0 after:bg-[#1f3dd2] after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
            >
              Home
            </Link>
            <Link 
              to="/services" 
              className="text-[#040480] hover:text-[#1f3dd2] font-medium transition-all duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:-bottom-1 after:left-0 after:bg-[#1f3dd2] after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
            >
              Services
            </Link>
            <Link 
              to="/how-it-works" 
              className="text-[#040480] hover:text-[#1f3dd2] font-medium transition-all duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:-bottom-1 after:left-0 after:bg-[#1f3dd2] after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
            >
              How It Works
            </Link>
            <Link 
              to="/companies" 
              className="text-[#040480] hover:text-[#1f3dd2] font-medium transition-all duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:-bottom-1 after:left-0 after:bg-[#1f3dd2] after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
            >
              Companies
            </Link>
            
            {/* Only show role-specific links if user is logged in and registered */}
            {session && isRegisteredCompany && <RoleLinks role={userData?.role} />}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {!session && (
              <Button 
                className="bg-[#d2491f] hover:bg-[#84d21f] text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                onClick={() => window.location.href = '/companies'}
              >
                Partner With Us
              </Button>
            )}
            {session && <AuthButton session={session} />}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-[#040480] hover:text-[#1f3dd2] p-2 rounded-md transition-colors duration-200 hover:bg-gray-100"
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
