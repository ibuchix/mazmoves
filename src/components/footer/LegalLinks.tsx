import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CookiePreferences from "./CookiePreferences";

export default function LegalLinks() {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col gap-3">
      <Link
        to="/terms-and-conditions"
        className="text-lg text-gray-300 hover:text-[#84d21f] transition-colors"
      >
        {t('footer.legal.terms')}
      </Link>
      <Link
        to="/privacy-policy"
        className="text-lg text-gray-300 hover:text-[#84d21f] transition-colors"
      >
        {t('footer.legal.privacy')}
      </Link>
      <CookiePreferences />
    </div>
  );
}