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

  // Simulate loading for demonstration
  const simulateLoading = () => {
    setIsLoading(true);
    setError(null);
    
    // Simulate an API call that takes 3 seconds
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  };

  // Simulate error for demonstration
  const simulateError = () => {
    setIsLoading(true);
    setError(null);
    
    // Simulate an API call that fails after 1 second
    setTimeout(() => {
      setIsLoading(false);
      setError(new Error("This is a simulated error to demonstrate error handling"));
    }, 1000);
  };

  return (
    <div className="flex-1">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button 
          onClick={simulateLoading}
          disabled={isLoading}
          variant="outline"
        >
          Simulate Loading
        </Button>
        <Button 
          onClick={simulateError}
          disabled={isLoading}
          variant="outline"
          className="bg-red-100 hover:bg-red-200"
        >
          Simulate Error
        </Button>
      </div>

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