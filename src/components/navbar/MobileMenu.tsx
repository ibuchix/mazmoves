
import { Link, useNavigate } from "react-router-dom";
import AuthButton from "./AuthButton";
import RoleLinks from "./RoleLinks";
import { Session } from "@supabase/supabase-js";
import { Button } from "../ui/button";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  userRole?: string | null;
}

export default function MobileMenu({ isOpen, onClose, session, userRole }: MobileMenuProps) {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  const handlePartnerClick = () => {
    navigate('/companies');
    onClose();
  };

  return (
    <div className="md:hidden">
      <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-[5rem] h-[calc(100vh-5rem)] w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
            <Link 
              to="/" 
              className="block px-4 py-2 rounded-lg text-[#040480] hover:text-[#1f3dd2] hover:bg-gray-50 font-medium transition-colors duration-200"
              onClick={onClose}
            >
              Home
            </Link>
            <Link 
              to="/services" 
              className="block px-4 py-2 rounded-lg text-[#040480] hover:text-[#1f3dd2] hover:bg-gray-50 font-medium transition-colors duration-200"
              onClick={onClose}
            >
              Services
            </Link>
            <Link 
              to="/companies" 
              className="block px-4 py-2 rounded-lg text-[#040480] hover:text-[#1f3dd2] hover:bg-gray-50 font-medium transition-colors duration-200"
              onClick={onClose}
            >
              Companies
            </Link>
            {session && userRole === 'company' && <RoleLinks role={userRole} />}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            {!session ? (
              <Button 
                className="w-full bg-[#d2491f] hover:bg-[#84d21f] text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                onClick={handlePartnerClick}
              >
                Partner With Us
              </Button>
            ) : (
              <div className="w-full">
                <AuthButton session={session} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
