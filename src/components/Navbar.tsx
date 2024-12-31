import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderAuthButton = () => {
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
  };

  const renderRoleSpecificLinks = () => {
    if (!session || !userData) return null;

    switch (userData.role) {
      case "company":
        return (
          <Link to="/company/dashboard" className="text-[#040480] hover:text-[#1f3dd2] font-medium">
            Dashboard
          </Link>
        );
      case "customer":
        return (
          <Link to="/request-move" className="text-[#040480] hover:text-[#1f3dd2] font-medium">
            Request Move
          </Link>
        );
      default:
        return null;
    }
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
            <Link to="/about" className="text-[#040480] hover:text-[#1f3dd2] font-medium">About</Link>
            <Link to="/contact" className="text-[#040480] hover:text-[#1f3dd2] font-medium">Contact</Link>
            {renderRoleSpecificLinks()}
          </div>

          <div className="hidden md:block">
            {renderAuthButton()}
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
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white rounded-lg shadow-lg border border-gray-100 mt-2">
              <Link 
                to="/" 
                className="block px-4 py-3 rounded-md text-[#040480] hover:text-[#1f3dd2] hover:bg-gray-50 font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/services" 
                className="block px-4 py-3 rounded-md text-[#040480] hover:text-[#1f3dd2] hover:bg-gray-50 font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/about" 
                className="block px-4 py-3 rounded-md text-[#040480] hover:text-[#1f3dd2] hover:bg-gray-50 font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="block px-4 py-3 rounded-md text-[#040480] hover:text-[#1f3dd2] hover:bg-gray-50 font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              {renderRoleSpecificLinks()}
              <div className="mt-4 px-4 pb-2">
                {renderAuthButton()}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}