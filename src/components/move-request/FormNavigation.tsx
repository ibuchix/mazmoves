// Navigation row for the move request wizard.
// - Step 1:    Previous button is rendered but disabled (persistent navbar handles Home navigation).
// - Step > 1:  Previous button is enabled.
// - Last step: swaps Next for a Submit button.

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface FormNavigationProps {
  step: number;
  totalSteps: number;
  isProcessing: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  isValid?: boolean;
}

export function FormNavigation({
  step,
  totalSteps,
  isProcessing,
  onPrevious,
  onNext,
  isValid = true,
}: FormNavigationProps) {
  const isLastStep = step === totalSteps;
  const isFirstStep = step === 1;
  const canProceed = !isProcessing && isValid;

  return (
    <div className="flex justify-between pt-4">
      {isFirstStep ? (
        <Button
          asChild
          type="button"
          variant="outline"
          className="bg-white hover:bg-gray-50"
          disabled={isProcessing}
        >
          <Link to="/" aria-label="Return to home">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          className="bg-white hover:bg-gray-50"
          disabled={isProcessing}
        >
          Previous
        </Button>
      )}

      {!isLastStep ? (
        <Button
          type="button"
          onClick={onNext}
          className="bg-brand-slate hover:bg-brand-slateLight text-white ml-auto"
          disabled={!canProceed}
        >
          Next
        </Button>
      ) : (
        <Button
          type="submit"
          className={`ml-auto inline-flex items-center space-x-2 ${
            !canProceed
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-brand-slate hover:bg-brand-slateLight"
          } text-white`}
          disabled={!canProceed}
        >
          {isProcessing ? (
            <>
              <LoadingSpinner size="sm" className="border-white" />
              <span>Submitting...</span>
            </>
          ) : (
            <span>Submit Request</span>
          )}
        </Button>
      )}
    </div>
  );
}
