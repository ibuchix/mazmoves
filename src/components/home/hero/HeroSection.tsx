
import { MoveType } from "@/types/move-request";
import { HeroForm } from "./HeroForm";
import { HeroContent } from "./HeroContent";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeroSectionProps {
  moveType: MoveType | null;
  setMoveType: (type: MoveType) => void;
  onGetQuotes: () => void;
}

export const HeroSection = ({ moveType, setMoveType, onGetQuotes }: HeroSectionProps) => {
  const isMobile = useIsMobile();

  return (
    <section className="relative flex items-center px-2 sm:px-6 lg:px-8 pt-6 pb-4 md:pt-12 md:pb-24">
      {/* Slate background covers the full section on mobile so section padding becomes
          the inset around the form, preventing the form from floating past the slate edge. */}
      <div className="absolute inset-x-2 sm:inset-x-6 lg:inset-x-8 inset-y-0 md:top-12 md:bottom-24 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-brand-slate via-brand-slateLight to-brand-slate shadow-2xl">
        <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')] bg-center" />
        <div className="absolute inset-0 bg-black/5" />
      </div>

      {/* Main content */}
      <div className="relative w-full max-w-7xl mx-auto px-3 sm:px-8 lg:px-8 py-6 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-stretch">
          {/* Content Section — below form on mobile, LEFT on desktop/tablet */}
          <div className={`${isMobile ? "order-2" : "order-1"} animate-fade-in [animation-delay:200ms] flex flex-col justify-between h-full min-w-0`}>
            <HeroContent />
          </div>

          {/* Form Section — first on mobile, RIGHT on desktop/tablet */}
          <div className={`${isMobile ? "order-1" : "order-2"} animate-fade-in min-w-0`}>
            <HeroForm
              moveType={moveType}
              setMoveType={setMoveType}
              onGetQuotes={onGetQuotes}
            />
          </div>
        </div>
      </div>

    </section>
  );
};

