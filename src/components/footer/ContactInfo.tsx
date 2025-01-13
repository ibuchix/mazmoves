import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactInfo() {
  return (
    <div className="flex flex-col gap-4">
      <a
        href="mailto:ask@mazmoves.com"
        className="text-sm text-gray-300 hover:text-[#84d21f] transition-colors flex items-center gap-3"
      >
        <Mail className="w-5 h-5 flex-shrink-0" />
        <span>ask@mazmoves.com</span>
      </a>
      <a
        href="tel:+447388449110"
        className="text-sm text-gray-300 hover:text-[#84d21f] transition-colors flex items-center gap-3"
      >
        <Phone className="w-5 h-5 flex-shrink-0" />
        <span>+44 738 844 9110</span>
      </a>
      <div className="flex items-start gap-3">
        <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
        <span className="text-sm text-gray-300 text-left">
          124 City Road, London, EC1V 2NX
        </span>
      </div>
    </div>
  );
}