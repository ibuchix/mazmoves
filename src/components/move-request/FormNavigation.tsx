
import { Button } from "@/components/ui/button";

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
      {step < totalSteps ? (
        <Button 
          type="button" 
          onClick={onNext}
          className="bg-[#040480] hover:bg-[#1f3dd2] text-white ml-auto"
          disabled={isProcessing || !isValid}
        >
          Next
        </Button>
      ) : (
        <Button 
          type="submit"
          onClick={onSubmit} 
          disabled={isProcessing || !isValid}
          className={`ml-auto ${
            isProcessing || !isValid 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-[#040480] hover:bg-[#1f3dd2]"
          } text-white`}
        >
          {isProcessing ? "Submitting..." : "Submit Request"}
        </Button>
      )}
    </div>
  );
}
