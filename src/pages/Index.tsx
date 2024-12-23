import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoveType } from "@/types/move-request";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { CallToAction } from "@/components/home/CallToAction";

export default function Index() {
  const [moveType, setMoveType] = useState<MoveType | null>(null);
  const navigate = useNavigate();

  const handleGetQuotes = () => {
    if (moveType) {
      navigate('/request-move', { state: { moveType } });
    }
  };

  return (
    <div className="flex-1">
      <HeroSection 
        moveType={moveType}
        setMoveType={setMoveType}
        onGetQuotes={handleGetQuotes}
      />
      <HowItWorksSection />
      <ServicesSection />
      <TestimonialsSection />
      <CallToAction />
    </div>
  );
}