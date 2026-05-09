
import { MoveType } from "@/types/move-request";
import { HeroForm } from "./HeroForm";
import { HeroContent } from "./HeroContent";

interface HeroSectionProps {
  moveType: MoveType | null;
  setMoveType: (type: MoveType) => void;
  onGetQuotes: () => void;
}

export const HeroSection = ({ moveType, setMoveType, onGetQuotes }: HeroSectionProps) => {
  return (
    <section className="relative flex items-center px-4 sm:px-6 lg:px-8 pt-8 pb-16 md:pt-12 md:pb-24">
      {/* Background with slate grey gradient, shorter rectangle with curved corners */}
      <div className="absolute inset-x-4 sm:inset-x-6 lg:inset-x-8 top-8 md:top-12 bottom-16 md:bottom-24 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 shadow-2xl">
        <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')] bg-center" />
        <div className="absolute inset-0 bg-black/5" />
      </div>

      {/* Main content */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Form Section */}
          <div className="order-2 md:order-1 animate-fade-in">
            <HeroForm 
              moveType={moveType}
              setMoveType={setMoveType}
              onGetQuotes={onGetQuotes}
            />
          </div>
          
          {/* Content Section */}
          <div className="order-1 md:order-2 animate-fade-in [animation-delay:200ms]">
            <HeroContent />
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
};
