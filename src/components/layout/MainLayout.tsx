import { ReactNode } from "react";
import CookieConsent from "@/components/cookie/CookieConsent";
import { Toaster } from "sonner";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">{children}</main>
      <CookieConsent />
      <Toaster richColors position="top-center" />
    </div>
  );
};
