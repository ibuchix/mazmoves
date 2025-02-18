
import { useToast } from "@/hooks/use-toast";
import { MoveRequestForm } from "@/types/move-request";

export function useSubmissionTracking() {
  const { toast } = useToast();

  const logSubmissionAttempt = (data: MoveRequestForm) => {
    console.log('Submission attempt:', {
      timestamp: new Date().toISOString(),
      formData: {
        ...data,
        // Mask sensitive information
        email: data.email ? '[REDACTED]' : undefined,
        phone: data.phone ? '[REDACTED]' : undefined
      }
    });
  };

  const logSubmissionError = (error: any) => {
    console.error('Submission error:', {
      timestamp: new Date().toISOString(),
      error: error?.message || 'Unknown error'
    });

    toast({
      title: "Submission Error",
      description: "There was an error submitting your request. Please try again.",
      variant: "destructive",
    });
  };

  const logSubmissionSuccess = () => {
    console.log('Submission successful:', {
      timestamp: new Date().toISOString()
    });
  };

  return {
    logSubmissionAttempt,
    logSubmissionError,
    logSubmissionSuccess
  };
}
