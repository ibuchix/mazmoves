import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoveType } from "@/types/move-request";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { CallToAction } from "@/components/home/CallToAction";
import { AsyncContent } from "@/components/ui/async-content";
import { Button } from "@/components/ui/button";

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

  const testSentry = () => {
    throw new Error("Test error for Sentry monitoring!");
  };

  return (
    <div className="flex-1">
      <AsyncContent 
        loading={isLoading} 
        error={error}
        loadingMessage="Loading content..."
      >
        <div className="w-full max-w-7xl mx-auto px-4 mb-8">
          <Button 
            variant="destructive"
            onClick={testSentry}
            className="mt-4"
          >
            Test Sentry Error
          </Button>
        </div>
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