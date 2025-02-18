
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
  onSubmit,
  isValid = true
}: FormNavigationProps) {
  const isLastStep = step === totalSteps;
  const canProceed = !isProcessing && isValid;

  return (
    <div className="flex justify-between pt-4">
      {step > 1 && (
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
          className="bg-[#040480] hover:bg-[#1f3dd2] text-white ml-auto"
          disabled={!canProceed}
        >
          Next
        </Button>
      ) : (
        <Button 
          type="submit"
          onClick={onSubmit}
          disabled={!canProceed}
          className={`ml-auto inline-flex items-center space-x-2 ${
            !canProceed
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-[#040480] hover:bg-[#1f3dd2]"
          } text-white`}
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
