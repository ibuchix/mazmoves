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
    <section className="relative bg-gradient-to-r from-[#040480] to-[#1f3dd2] py-8 md:py-20">
      <div className="absolute inset-0 bg-black opacity-5"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
          {/* Form Section - Order changes based on screen size */}
          <div className="order-1 md:order-1">
            <HeroForm 
              moveType={moveType}
              setMoveType={setMoveType}
              onGetQuotes={onGetQuotes}
            />
          </div>
          
          {/* Content Section - Order changes based on screen size */}
          <div className="order-2 md:order-2">
            <HeroContent />
          </div>
        </div>
      </div>
    </section>
  );
};