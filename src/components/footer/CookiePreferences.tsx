import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function CookiePreferences() {
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="link" 
          className="text-gray-600 hover:text-[#84d21f] w-full sm:w-auto text-sm"
          size="sm"
        >
          Cookie Preferences
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Manage your cookie preferences. Necessary cookies are always enabled.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">Necessary Cookies</h4>
              <p className="text-xs text-muted-foreground">
                Required for the website to function
              </p>
            </div>
            <Switch checked disabled />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">Analytics Cookies</h4>
              <p className="text-xs text-muted-foreground">
                Help us improve our website
              </p>
            </div>
            <Switch
              checked={preferences.analytics}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, analytics: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">Marketing Cookies</h4>
              <p className="text-xs text-muted-foreground">
                Used for targeted advertising
              </p>
            </div>
            <Switch
              checked={preferences.marketing}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, marketing: checked }))
              }
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}