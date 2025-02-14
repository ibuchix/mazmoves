
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
    <section className="relative min-h-[calc(100vh-5rem)] flex items-center">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#040480] via-[#1f3dd2] to-[#040480]">
        <div className="absolute inset-0 opacity-30 bg-[url('/grid.svg')] bg-center" />
      </div>

      {/* Overlay with subtle pattern */}
      <div className="absolute inset-0 bg-black/5" />

      {/* Main content */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
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
