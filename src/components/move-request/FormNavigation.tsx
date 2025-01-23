import { Button } from "@/components/ui/button";

interface FormNavigationProps {
  step: number;
  totalSteps: number;
  isProcessing: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit?: () => void;
}

export function FormNavigation({ 
  step, 
  totalSteps, 
  isProcessing, 
  onPrevious, 
  onNext,
  onSubmit 
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
          disabled={isProcessing}
        >
          Next
        </Button>
      ) : (
        <Button 
          type="submit"
          onClick={onSubmit} 
          disabled={isProcessing}
          className="bg-[#040480] hover:bg-[#1f3dd2] text-white ml-auto"
        >
          {isProcessing ? "Submitting..." : "Submit Request"}
        </Button>
      )}
    </div>
  );
}