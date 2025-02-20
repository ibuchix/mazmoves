
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/cookie/CookieConsent";
import { Toaster } from "sonner";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="h-4" /> {/* Added 16px (1rem) spacing between navbar and content */}
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <CookieConsent />
      <Toaster richColors position="top-right" />
    </div>
  );
};
