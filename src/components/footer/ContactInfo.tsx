import { Mail, MapPin, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ContactInfo() {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col gap-4">
      <a
        href="mailto:ask@mazmoves.com"
        className="text-lg text-gray-300 hover:text-[#84d21f] transition-colors flex items-center gap-3"
      >
        <Mail className="w-6 h-6 flex-shrink-0" />
        <span>{t('footer.contact.email')}</span>
      </a>
      <a
        href="tel:+447388449110"
        className="text-lg text-gray-300 hover:text-[#84d21f] transition-colors flex items-center gap-3"
      >
        <Phone className="w-6 h-6 flex-shrink-0" />
        <span>{t('footer.contact.phone')}</span>
      </a>
      <div className="flex items-start gap-3">
        <MapPin className="w-6 h-6 mt-1 flex-shrink-0" />
        <span className="text-lg text-gray-300 text-left">
          {t('footer.contact.address')}
        </span>
      </div>
    </div>
  );
}