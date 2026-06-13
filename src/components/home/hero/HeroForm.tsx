// Hero form for selecting move type.
// Changes: CTA button stays fully orange (no disabled-dim) so users see it as a live CTA.
// Click without a move type selected shows a toast prompting selection — wizard is NOT
// advanced until a move type has been chosen, preserving the original guard.
// Fires TikTok ClickButton event when the user clicks "Get Free Quotes" so the
// lead-gen funnel (ViewContent → ClickButton → SubmitForm → CompleteRegistration) is complete.
// Also fires the internal campaign `move_type_selected` event when the user
// picks a move type, so admin campaign attribution captures hero selections.
// Includes a subtle SSL-encryption trust line under the button.
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoveTypeStep } from "@/components/move-request/MoveTypeStep";
import { MoveType } from "@/types/move-request";
import { trackEvent } from "@/utils/tracking/tiktok";
import { track } from "@/lib/campaign-tracking";
import { useToast } from "@/hooks/use-toast";

interface HeroFormProps {
  moveType: MoveType | null;
  setMoveType: (type: MoveType) => void;
  onGetQuotes: () => void;
}

export const HeroForm = ({ moveType, setMoveType, onGetQuotes }: HeroFormProps) => {
  const { toast } = useToast();

  const handleGetQuotes = () => {
    if (!moveType) {
      toast({
        title: "Select your move type",
        description: "Please choose Domestic, Commercial or International to continue.",
        variant: "destructive",
      });
      return;
    }
    trackEvent("ClickButton", {
      contents: [{ content_id: `move-${moveType}`, content_type: "product", content_name: `Move Request - ${moveType}` }],
    });
    onGetQuotes();
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.15)]">
      <div className="p-5 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-brand-slate mb-3">
          Start Your Move
        </h2>
        <MoveTypeStep
          value={moveType}
          onChange={(value) => {
            setMoveType(value);
            track({ event_type: "move_type_selected", move_type: value });
          }}
          onNext={handleGetQuotes}
        />
        <Button
          className="w-full mt-6 bg-brand-orange hover:bg-brand-orange/90 text-white text-lg font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
          onClick={handleGetQuotes}
          aria-disabled={!moveType}
        >
          Get Free Quotes
        </Button>
        <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-brand-green font-roboto font-medium">
          <Lock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Your information is protected by 128-bit SSL encryption.</span>
        </div>
      </div>
    </div>
  );
};
