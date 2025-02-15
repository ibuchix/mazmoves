
import { Separator } from "@/components/ui/separator";
import BackToTop from "./footer/BackToTop";
import LanguageSelector from "./footer/LanguageSelector";
import FooterLogo from "./footer/FooterLogo";
import SocialLinks from "./footer/SocialLinks";
import QuickLinks from "./footer/QuickLinks";
import LegalLinks from "./footer/LegalLinks";
import ContactInfo from "./footer/ContactInfo";
import MobileCollapsibleSection from "./footer/MobileCollapsibleSection";

export default function Footer() {
  return (
    <footer className="bg-[#040480] text-white py-3 md:py-4 relative">
      <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-6">
        {/* Logo and Description Section */}
        <div className="w-full mb-3 md:mb-4">
          <div className="max-w-2xl">
            <FooterLogo />
            <p className="text-sm md:text-base text-gray-300 mb-3 md:mb-4 font-light leading-relaxed text-left">
              Professional moving services for homes and businesses. We provide
              reliable, efficient, and secure moving solutions across the UK.
            </p>
            <SocialLinks />
          </div>
        </div>

        <Separator className="mb-3 md:mb-4 bg-white/20" />

        {/* Mobile Collapsible Sections */}
        <div className="md:hidden space-y-3">
          <MobileCollapsibleSection title="Quick Links">
            <QuickLinks />
          </MobileCollapsibleSection>

          <MobileCollapsibleSection title="Legal">
            <LegalLinks />
          </MobileCollapsibleSection>

          <MobileCollapsibleSection title="Contact Us">
            <ContactInfo />
          </MobileCollapsibleSection>
        </div>

        {/* Desktop Three Column Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          <div className="p-1">
            <h3 className="text-lg font-bold mb-2 text-[#d2491f]">Quick Links</h3>
            <QuickLinks />
          </div>

          <div className="p-1">
            <h3 className="text-lg font-bold mb-2 text-[#d2491f]">Legal</h3>
            <LegalLinks />
          </div>

          <div className="p-1">
            <h3 className="text-lg font-bold mb-2 text-[#d2491f]">Contact Us</h3>
            <ContactInfo />
          </div>
        </div>

        {/* Language Selector and Copyright */}
        <div className="mt-3 flex flex-col md:flex-row items-center justify-between gap-3">
          <LanguageSelector />
          <p className="text-xs text-center text-gray-400">
            &copy; {new Date().getFullYear()} MAZ Moves Ltd. All Rights Reserved.
          </p>
        </div>
      </div>

      <BackToTop />
    </footer>
  );
}
