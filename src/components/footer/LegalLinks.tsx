import { Link } from "react-router-dom";
import CookiePreferences from "./CookiePreferences";

export default function LegalLinks() {
  return (
    <div className="flex flex-col gap-3">
      <Link
        to="/terms-and-conditions"
        className="text-sm text-gray-300 hover:text-[#84d21f] transition-colors"
      >
        Terms & Conditions
      </Link>
      <Link
        to="/privacy-policy"
        className="text-sm text-gray-300 hover:text-[#84d21f] transition-colors"
      >
        Privacy Policy
      </Link>
      <CookiePreferences />
    </div>
  );
}