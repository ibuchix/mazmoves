import { Button } from "@/components/ui/button";
import { MoveTypeStep } from "@/components/move-request/MoveTypeStep";
import { MoveType } from "@/types/move-request";
import { Link } from "react-router-dom";

interface HeroFormProps {
  moveType: MoveType | null;
  setMoveType: (type: MoveType) => void;
  onGetQuotes: () => void;
}

export const HeroForm = ({ moveType, setMoveType, onGetQuotes }: HeroFormProps) => {
  return (
    <div className="bg-white/95 backdrop-blur-sm p-4 md:p-8 rounded-xl shadow-lg">
      <h2 className="text-lg md:text-2xl font-bold text-[#040480] mb-4 md:mb-6">Start Your Move</h2>
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
      <div className="mt-3 md:mt-4 text-center">
        <Link 
          to="/company/register"
          className="inline-block text-[#1f3dd2] hover:text-[#84d21f] font-semibold text-sm md:text-base"
        >
          Are you a moving company? Join us →
        </Link>
      </div>
    </div>
  );
};