import { Button } from "@/components/ui/button";
import { MoveTypeStep } from "@/components/move-request/MoveTypeStep";
import { MoveType } from "@/types/move-request";

interface HeroSectionProps {
  moveType: MoveType | null;
  setMoveType: (type: MoveType) => void;
  onGetQuotes: () => void;
}

export const HeroSection = ({ moveType, setMoveType, onGetQuotes }: HeroSectionProps) => {
  return (
    <section className="relative bg-gradient-to-r from-[#040480] to-[#1f3dd2] py-12 md:py-20">
      <div className="absolute inset-0 bg-black opacity-5"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Form Section */}
          <div className="bg-white/95 backdrop-blur-sm p-6 md:p-8 rounded-xl shadow-lg order-2 md:order-1">
            <h2 className="text-xl md:text-2xl font-bold text-[#040480] mb-4 md:mb-6">Start Your Move</h2>
            <MoveTypeStep
              value={moveType}
              onChange={(value) => setMoveType(value)}
            />
            <Button 
              className="w-full mt-4 md:mt-6 bg-[#d2491f] hover:bg-[#84d21f] text-white text-base px-6 py-2 transition-colors duration-200"
              onClick={onGetQuotes}
              disabled={!moveType}
            >
              Get Free Quotes
            </Button>
          </div>
          
          {/* Content Section */}
          <div className="text-white flex flex-col justify-center space-y-6 md:space-y-8 md:pl-8 order-1 md:order-2">
            <p className="text-xl md:text-2xl text-gray-100 font-light">
              Get instant quotes from trusted movers. Free to use, no obligations.
            </p>
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center space-x-3 md:space-x-4 bg-white/10 backdrop-blur-sm p-3 md:p-4 rounded-lg">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-[#84d21f] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-lg md:text-xl">Verified Professional Movers</span>
              </div>
              <div className="flex items-center space-x-3 md:space-x-4 bg-white/10 backdrop-blur-sm p-3 md:p-4 rounded-lg">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-[#84d21f] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-lg md:text-xl">Compare Multiple Quotes</span>
              </div>
              <div className="flex items-center space-x-3 md:space-x-4 bg-white/10 backdrop-blur-sm p-3 md:p-4 rounded-lg">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-[#84d21f] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-lg md:text-xl">100% Free Service</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};