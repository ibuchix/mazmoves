import { useEffect, useState } from "react";
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
      className: "bg-white p-2 text-sm w-auto max-w-[250px]",
      duration: 2000,
    });
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col space-y-4">
          <div>
            <p className="text-sm text-gray-600">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
              By clicking "Accept All", you consent to our use of cookies.
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
              className="w-full sm:w-auto bg-[#84d21f] hover:bg-[#d2491f] whitespace-nowrap text-sm"
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