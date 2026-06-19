// CookieConsent.tsx - First-visit cookie consent banner.
// Updated: banner copy now identifies the controller as Housemove (Housemove NB Ltd)
// and links to the dedicated Cookie Policy page.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CookiePreferences from "@/components/cookie/CookiePreferences";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const hasConsent = localStorage.getItem("cookieConsent");
    if (!hasConsent) {
      setShowBanner(true);
    } else {
      setPreferences(JSON.parse(hasConsent));
    }
  }, []);

  const acceptAll = () => {
    const allConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allConsent);
  };

  const acceptNecessary = () => {
    savePreferences(defaultPreferences);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem("cookieConsent", JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    toast({
      title: "Preferences Saved",
      description: "Your cookie preferences have been updated.",
      className: "bg-background p-2 text-sm w-auto max-w-[250px]",
      duration: 2000,
    });
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 bg-background border-t border-border p-4 shadow-lg z-50">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              <strong>Housemove</strong> (Housemove NB Ltd) uses cookies to enhance your browsing experience, serve personalised content, and analyse our traffic. By clicking "Accept All", you consent to our use of cookies.{" "}
              <Link
                to="/cookie-policy"
                className="underline hover:text-brand-orange transition-colors"
              >
                Read our Cookie Policy
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <CookiePreferences />
            <Button
              variant="outline"
              onClick={acceptNecessary}
              className="w-full sm:w-auto whitespace-nowrap text-sm"
              size="sm"
            >
              Necessary Only
            </Button>
            <Button
              onClick={acceptAll}
              className="w-full sm:w-auto bg-brand-green hover:bg-brand-orange text-brand-slate hover:text-white whitespace-nowrap text-sm font-semibold"
              size="sm"
            >
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
