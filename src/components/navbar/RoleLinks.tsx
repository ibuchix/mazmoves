import { NavLink } from "react-router-dom";

interface RoleLinksProps {
  role: string;
}

export default function RoleLinks({ role }: RoleLinksProps) {
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