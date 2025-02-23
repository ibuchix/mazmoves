
import { useToast } from "@/hooks/use-toast";
import { MoveRequestForm, MoveType } from "@/types/move-request";
import { useSubmissionTracking } from "@/hooks/move-request/use-submission-tracking";
import { useCallback } from "react";

// Define type for validation functions
type ValidationFunctions = {
  validateField: (value: string, pattern: RegExp, minLength?: number) => boolean;
  sanitizeInput: (input: string) => string;
};

// Define return type for handleFormSubmit
type SubmissionResult = {
  success: boolean;
  error?: string;
  submissionData?: MoveRequestForm;
};

export function useFormSubmission() {
  const { toast } = useToast();
  const { logSubmissionAttempt, logSubmissionError, logSubmissionSuccess } = useSubmissionTracking();

  const validateSubmission = useCallback((
    data: MoveRequestForm,
    moveType: MoveType | null,
    { validateField }: ValidationFunctions
  ): { isValid: boolean; error?: string } => {
    // Validate move type first
    if (!moveType) {
      return { isValid: false, error: "Missing move type" };
    }

    // Validation checks
    const validations = [
      {
        condition: !validateField(data.email, /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i),
        error: "Invalid Email"
      },
      {
        condition: !validateField(data.phone, /^[0-9\s\-\+\(\)]{8,}$/),
        error: "Invalid Phone"
      },
      {
        condition: !validateField(data.fullName, /^[a-zA-Z\s-']+$/, 2),
        error: "Invalid Name"
      }
    ];

    for (const validation of validations) {
      if (validation.condition) {
        return { isValid: false, error: validation.error };
      }
    }

    return { isValid: true };
  }, []);

  const handleFormSubmit = useCallback((
    data: MoveRequestForm,
    moveType: MoveType | null,
    { validateField, sanitizeInput }: ValidationFunctions
  ): Promise<SubmissionResult> => {
    return new Promise((resolve) => {
      try {
        console.log("Starting form submission");
        logSubmissionAttempt(data);

        const validation = validateSubmission(data, moveType, { validateField, sanitizeInput });
        
        if (!validation.isValid) {
          toast({
            title: "Validation Error",
            description: validation.error,
            variant: "destructive",
          });
          return resolve({ success: false, error: validation.error });
        }

        // Sanitize data synchronously
        const submissionData = {
          ...data,
          moveType,
          fullName: sanitizeInput(data.fullName),
          email: sanitizeInput(data.email),
          phone: sanitizeInput(data.phone),
          specialInstructions: data.specialInstructions?.trim()
        };

        // Log success synchronously
        logSubmissionSuccess();
        
        resolve({ 
          success: true, 
          submissionData 
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown submission error";
        logSubmissionError(errorMessage);
        
        toast({
          title: "Submission Failed",
          description: "Please try again. If the problem persists, contact support.",
          variant: "destructive"
        });

        resolve({ success: false, error: errorMessage });
      }
    });
  }, [toast, logSubmissionAttempt, logSubmissionError, logSubmissionSuccess, validateSubmission]);

  return { handleFormSubmit };
}
