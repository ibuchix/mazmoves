import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, Facebook, Twitter } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import BackToTop from "./footer/BackToTop";
import LanguageSelector from "./footer/LanguageSelector";
import CookiePreferences from "./footer/CookiePreferences";
import FooterLogo from "./footer/FooterLogo";

export default function Footer() {
  return (
    <footer className="bg-[#040480] text-white py-4 md:py-6 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Logo and Description Section - Full Width */}
        <div className="w-full mb-4 md:mb-6">
          <div className="max-w-2xl">
            <FooterLogo />
            <p className="text-base md:text-lg text-gray-300 mb-4 md:mb-6 font-light leading-relaxed text-left">
              Professional moving services for homes and businesses. We provide
              reliable, efficient, and secure moving solutions across the UK.
            </p>
            <div className="flex items-center gap-4 md:gap-6">
              <a
                href="https://wa.me/447388449110"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#84d21f] transition-all transform hover:scale-110"
                aria-label="WhatsApp"
              >
                <svg
                  className="w-7 h-7 md:w-8 md:h-8"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#84d21f] transition-all transform hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-7 h-7 md:w-8 md:h-8" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#84d21f] transition-all transform hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="w-7 h-7 md:w-8 md:h-8" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="mb-4 md:mb-6 bg-white/20" />

        {/* Mobile Collapsible Sections */}
        <div className="md:hidden space-y-4">
          <Collapsible>
            <CollapsibleTrigger className="flex w-full items-center justify-between p-2">
              <span className="text-xl font-bold text-[#d2491f]">Quick Links</span>
              <ChevronDown className="h-5 w-5" />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-2 space-y-4">
              <Link
                to="/"
                className="block text-lg text-gray-300 hover:text-[#84d21f] transition-colors"
              >
                Home
              </Link>
              <Link
                to="/services"
                className="block text-lg text-gray-300 hover:text-[#84d21f] transition-colors"
              >
                Services
              </Link>
              <Link
                to="/about"
                className="block text-lg text-gray-300 hover:text-[#84d21f] transition-colors"
              >
                About Us
              </Link>
              <Link
                to="/companies"
                className="block text-lg text-gray-300 hover:text-[#84d21f] transition-colors"
              >
                Partner With Us
              </Link>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex w-full items-center justify-between p-2">
              <span className="text-xl font-bold text-[#d2491f]">Legal</span>
              <ChevronDown className="h-5 w-5" />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-2 space-y-4">
              <Link
                to="/terms-and-conditions"
                className="block text-lg text-gray-300 hover:text-[#84d21f] transition-colors"
              >
                Terms & Conditions
              </Link>
              <Link
                to="/privacy-policy"
                className="block text-lg text-gray-300 hover:text-[#84d21f] transition-colors"
              >
                Privacy Policy
              </Link>
              <CookiePreferences />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex w-full items-center justify-between p-2">
              <span className="text-xl font-bold text-[#d2491f]">Contact Us</span>
              <ChevronDown className="h-5 w-5" />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-2 space-y-4">
              <a
                href="mailto:ask@mazmoves.com"
                className="flex items-center gap-3 text-lg text-gray-300 hover:text-[#84d21f] transition-colors"
              >
                <Mail className="w-6 h-6 flex-shrink-0" />
                <span>ask@mazmoves.com</span>
              </a>
              <a
                href="tel:+447388449110"
                className="flex items-center gap-3 text-lg text-gray-300 hover:text-[#84d21f] transition-colors"
              >
                <Phone className="w-6 h-6 flex-shrink-0" />
                <span>+44 738 844 9110</span>
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="w-6 h-6 mt-1 flex-shrink-0" />
                <span className="text-lg text-gray-300">
                  124 City Road, London, EC1V 2NX
                </span>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Desktop Three Column Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {/* Navigation Links */}
          <div className="p-2">
            <h3 className="text-xl font-bold mb-4 text-[#d2491f]">Quick Links</h3>
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
          </div>

          {/* Legal Links */}
          <div className="p-2">
            <h3 className="text-xl font-bold mb-4 text-[#d2491f]">Legal</h3>
            <div className="flex flex-col gap-3">
              <Link
                to="/terms-and-conditions"
                className="text-lg text-gray-300 hover:text-[#84d21f] transition-colors"
              >
                Terms & Conditions
              </Link>
              <Link
                to="/privacy-policy"
                className="text-lg text-gray-300 hover:text-[#84d21f] transition-colors"
              >
                Privacy Policy
              </Link>
              <CookiePreferences />
            </div>
          </div>

          {/* Contact Information */}
          <div className="p-2">
            <h3 className="text-xl font-bold mb-4 text-[#d2491f]">Contact Us</h3>
            <div className="flex flex-col gap-4">
              <a
                href="mailto:ask@mazmoves.com"
                className="text-lg text-gray-300 hover:text-[#84d21f] transition-colors flex items-center gap-3"
              >
                <Mail className="w-6 h-6 flex-shrink-0" />
                <span>ask@mazmoves.com</span>
              </a>
              <a
                href="tel:+447388449110"
                className="text-lg text-gray-300 hover:text-[#84d21f] transition-colors flex items-center gap-3"
              >
                <Phone className="w-6 h-6 flex-shrink-0" />
                <span>+44 738 844 9110</span>
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="w-6 h-6 mt-1 flex-shrink-0" />
                <span className="text-lg text-gray-300">
                  124 City Road, London, EC1V 2NX
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Language Selector and Additional Features */}
        <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <LanguageSelector />
          <p className="text-sm text-center text-gray-400">
            &copy; {new Date().getFullYear()} MAZ Moves Ltd. All Rights Reserved.
          </p>
        </div>
      </div>

      <BackToTop />
    </footer>
  );
}