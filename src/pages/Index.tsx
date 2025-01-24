import { useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { MoveType } from "@/types/move-request";
import { AsyncContent } from "@/components/ui/async-content";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Lazy load components
const HeroSection = lazy(() => import("@/components/home/HeroSection"));
const HowItWorksSection = lazy(() => import("@/components/home/HowItWorksSection"));
const ServicesSection = lazy(() => import("@/components/home/ServicesSection"));
const TestimonialsSection = lazy(() => import("@/components/home/TestimonialsSection"));
const CallToAction = lazy(() => import("@/components/home/CallToAction"));

// Loading component
const SectionLoader = () => (
  <div className="flex items-center justify-center py-12">
    <LoadingSpinner size="lg" />
  </div>
);

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
        <ErrorBoundary>
          <Suspense fallback={<SectionLoader />}>
            <HeroSection 
              moveType={moveType}
              setMoveType={setMoveType}
              onGetQuotes={handleGetQuotes}
            />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<SectionLoader />}>
            <HowItWorksSection />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<SectionLoader />}>
            <ServicesSection />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<SectionLoader />}>
            <TestimonialsSection />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<SectionLoader />}>
            <CallToAction />
          </Suspense>
        </ErrorBoundary>
      </AsyncContent>
    </div>
  );
}