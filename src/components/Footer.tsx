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
    <footer className="bg-[#040480] text-white py-4 md:py-6 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Logo and Description Section */}
        <div className="w-full mb-4 md:mb-6">
          <div className="max-w-2xl">
            <FooterLogo />
            <p className="text-base md:text-lg text-gray-300 mb-4 md:mb-6 font-light leading-relaxed text-left">
              Professional moving services for homes and businesses. We provide
              reliable, efficient, and secure moving solutions across the UK.
            </p>
            <SocialLinks />
          </div>
        </div>

        <Separator className="mb-4 md:mb-6 bg-white/20" />

        {/* Mobile Collapsible Sections */}
        <div className="md:hidden space-y-4">
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
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          <div className="p-2">
            <h3 className="text-xl font-bold mb-4 text-[#d2491f]">Quick Links</h3>
            <QuickLinks />
          </div>

          <div className="p-2">
            <h3 className="text-xl font-bold mb-4 text-[#d2491f]">Legal</h3>
            <LegalLinks />
          </div>

          <div className="p-2">
            <h3 className="text-xl font-bold mb-4 text-[#d2491f]">Contact Us</h3>
            <ContactInfo />
          </div>
        </div>

        {/* Language Selector and Copyright */}
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