import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoveType } from "@/types/move-request";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { CallToAction } from "@/components/home/CallToAction";
import { AsyncContent } from "@/components/ui/async-content";

export default function Index() {
  const [moveType, setMoveType] = useState<MoveType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const handleGetQuotes = () => {
    if (moveType) {
      navigate('/request-move', { 
        state: { moveType },
        replace: true 
      });
    }
  };

  return (
    <div className="flex-1">
      <AsyncContent 
        loading={isLoading} 
        error={error}
        loadingMessage="Loading content..."
      >
        <HeroSection 
          moveType={moveType}
          setMoveType={setMoveType}
          onGetQuotes={handleGetQuotes}
        />
        <HowItWorksSection />
        <ServicesSection />
        <TestimonialsSection />
        <CallToAction />
      </AsyncContent>
    </div>
  );
}