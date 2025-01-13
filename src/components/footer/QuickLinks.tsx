import { Link } from "react-router-dom";

export default function QuickLinks() {
  return (
    <div className="flex flex-col gap-3">
      <Link
        to="/"
        className="text-lg text-gray-300 hover:text-[#84d21f] transition-colors"
      >
        Home
      </Link>
      <Link
        to="/services"
        className="text-lg text-gray-300 hover:text-[#84d21f] transition-colors"
      >
        Services
      </Link>
      <Link
        to="/about"
        className="text-lg text-gray-300 hover:text-[#84d21f] transition-colors"
      >
        About Us
      </Link>
      <Link
        to="/companies"
        className="text-lg text-gray-300 hover:text-[#84d21f] transition-colors"
      >
        Partner With Us
      </Link>
    </div>
  );
}