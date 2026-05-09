// MainLayout.tsx - Wraps every route with the persistent Navbar (top) and
// thin Footer (bottom), plus cookie consent and toaster. flex column ensures
// the footer sticks to the bottom on short pages.

import { ReactNode } from "react";
import CookieConsent from "@/components/cookie/CookieConsent";
import { Toaster } from "sonner";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <CookieConsent />
      <Toaster richColors position="top-center" />
    </div>
  );
};
