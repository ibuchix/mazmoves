import { Link } from "react-router-dom";

interface RoleLinksProps {
  role?: string | null;
}

export default function RoleLinks({ role }: RoleLinksProps) {
  if (!role) return null;

  switch (role) {
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
}