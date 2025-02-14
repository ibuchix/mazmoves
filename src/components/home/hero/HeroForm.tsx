
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
    <div className="overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.15)]">
      <div className="p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#040480] mb-6">
          Start Your Move
        </h2>
        <MoveTypeStep
          value={moveType}
          onChange={(value) => setMoveType(value)}
          onNext={onGetQuotes}
        />
        <Button 
          className="w-full mt-6 bg-[#d2491f] hover:bg-[#84d21f] text-white text-lg font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
          onClick={onGetQuotes}
          disabled={!moveType}
        >
          Get Free Quotes
        </Button>
        <div className="mt-4 text-center">
          <Link 
            to="/company/register"
            className="inline-block text-[#1f3dd2] hover:text-[#84d21f] font-semibold transition-colors duration-200"
          >
            Are you a moving company? Join us →
          </Link>
        </div>
      </div>
    </div>
  );
};
