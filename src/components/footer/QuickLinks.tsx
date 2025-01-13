import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function QuickLinks() {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col gap-3">
      <Link
        to="/"
        className="text-lg text-gray-300 hover:text-[#84d21f] transition-colors"
      >
        {t('footer.quickLinks.home')}
      </Link>
      <Link
        to="/services"
        className="text-lg text-gray-300 hover:text-[#84d21f] transition-colors"
      >
        {t('footer.quickLinks.services')}
      </Link>
      <Link
        to="/about"
        className="text-lg text-gray-300 hover:text-[#84d21f] transition-colors"
      >
        {t('footer.quickLinks.about')}
      </Link>
      <Link
        to="/companies"
        className="text-lg text-gray-300 hover:text-[#84d21f] transition-colors"
      >
        {t('footer.quickLinks.partner')}
      </Link>
    </div>
  );
}