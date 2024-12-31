import { Link } from "react-router-dom";
import AuthButton from "./AuthButton";
import RoleLinks from "./RoleLinks";
import { Session } from "@supabase/supabase-js";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  userRole?: string | null;
}

export default function MobileMenu({ isOpen, onClose, session, userRole }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 bg-white rounded-lg shadow-lg border border-gray-100 mt-2">
        <Link 
          to="/" 
          className="block px-4 py-3 rounded-md text-[#040480] hover:text-[#1f3dd2] hover:bg-gray-50 font-medium transition-colors duration-200"
          onClick={onClose}
        >
          Home
        </Link>
        <Link 
          to="/services" 
          className="block px-4 py-3 rounded-md text-[#040480] hover:text-[#1f3dd2] hover:bg-gray-50 font-medium transition-colors duration-200"
          onClick={onClose}
        >
          Services
        </Link>
        <Link 
          to="/about" 
          className="block px-4 py-3 rounded-md text-[#040480] hover:text-[#1f3dd2] hover:bg-gray-50 font-medium transition-colors duration-200"
          onClick={onClose}
        >
          About
        </Link>
        <Link 
          to="/contact" 
          className="block px-4 py-3 rounded-md text-[#040480] hover:text-[#1f3dd2] hover:bg-gray-50 font-medium transition-colors duration-200"
          onClick={onClose}
        >
          Contact
        </Link>
        <RoleLinks role={userRole} />
        <div className="mt-4 px-4 pb-2">
          <AuthButton session={session} />
        </div>
      </div>
    </div>
  );
}