
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
    <section className="relative flex items-center px-4 sm:px-6 lg:px-8 pt-8 pb-8 md:pt-12 md:pb-24">
      {/* Background with slate grey gradient, shorter rectangle with curved corners */}
      <div className="absolute inset-x-4 sm:inset-x-6 lg:inset-x-8 top-8 md:top-12 bottom-8 md:bottom-24 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-brand-slate via-brand-slateLight to-brand-slate shadow-2xl">
        <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')] bg-center" />
        <div className="absolute inset-0 bg-black/5" />
      </div>

      {/* Main content */}
      <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 py-8 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-stretch">
          {/* Form Section — first on mobile, left on desktop */}
          <div className={`${isMobile ? "order-1" : "order-2 md:order-1"} animate-fade-in`}>
            <HeroForm
              moveType={moveType}
              setMoveType={setMoveType}
              onGetQuotes={onGetQuotes}
            />
          </div>

          {/* Content Section — below form on mobile, right on desktop */}
          <div className={`${isMobile ? "order-2" : "order-1 md:order-2"} animate-fade-in [animation-delay:200ms] flex flex-col justify-between h-full`}>
            <HeroContent />
          </div>
        </div>
      </div>

    </section>
  );
};
