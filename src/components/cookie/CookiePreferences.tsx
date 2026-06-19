// CookiePreferences.tsx - Granular cookie preference dialog.
// Updated: copy now references Housemove as the service provider.

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface CookiePrefs {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const defaults: CookiePrefs = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export default function CookiePreferences() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>(defaults);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("cookieConsent");
    if (stored) {
      try {
        setPrefs(JSON.parse(stored));
      } catch {
        setPrefs(defaults);
      }
    }
  }, [open]);

  const save = () => {
    localStorage.setItem("cookieConsent", JSON.stringify(prefs));
    toast({
      title: "Preferences Saved",
      description: "Your cookie preferences have been updated.",
      duration: 2000,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto whitespace-nowrap text-sm"
        >
          Customize
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Choose which cookies you allow Housemove to use.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="necessary" className="flex flex-col">
              <span>Necessary</span>
              <span className="text-xs text-brand-slateLight">Required for the site to function</span>
            </Label>
            <Switch id="necessary" checked disabled />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="analytics" className="flex flex-col">
              <span>Analytics</span>
              <span className="text-xs text-brand-slateLight">Help us improve our service</span>
            </Label>
            <Switch
              id="analytics"
              checked={prefs.analytics}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="marketing" className="flex flex-col">
              <span>Marketing</span>
              <span className="text-xs text-brand-slateLight">Personalized content and ads</span>
            </Label>
            <Switch
              id="marketing"
              checked={prefs.marketing}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={save} className="bg-brand-slate hover:bg-brand-slateLight">
            Save preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
