import { NavLink } from "react-router-dom";
import { Shield } from "lucide-react";

interface RoleLinksProps {
  role: string;
}

export default function RoleLinks({ role }: RoleLinksProps) {
  if (role === 'admin') {
    return (
      <>
        <NavLink 
          to="/admin/dashboard"
          className={({ isActive }) => 
            `text-sm font-medium transition-colors hover:text-primary ${
              isActive ? 'text-[#040480]' : 'text-muted-foreground'
            }`
          }
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/admin/verification"
          className={({ isActive }) => 
            `text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
              isActive ? 'text-[#040480]' : 'text-muted-foreground'
            }`
          }
        >
          <Shield className="h-4 w-4" />
          Verification
        </NavLink>
      </>
    );
  }

  if (role === 'company') {
    return (
      <NavLink 
        to="/company/dashboard"
        className={({ isActive }) => 
          `text-sm font-medium transition-colors hover:text-primary ${
            isActive ? 'text-[#040480]' : 'text-muted-foreground'
          }`
        }
      >
        Dashboard
      </NavLink>
    );
  }

  return null;
}