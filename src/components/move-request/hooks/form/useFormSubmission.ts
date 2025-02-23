
import type { MoveRequestForm, MoveType } from "@/types/move-request";
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSubmissionTracking } from "@/hooks/move-request/use-submission-tracking";

interface ValidationFunctions {
  validateField: (value: string, pattern: RegExp, minLength?: number) => boolean;
  sanitizeInput: (input: string) => string;
}

interface SubmissionResult {
  success: boolean;
  error?: string;
  submissionData?: MoveRequestForm;
}

export interface FormSubmissionHook {
  handleFormSubmit: (
    data: MoveRequestForm,
    moveType: MoveType | null,
    validationFns: ValidationFunctions
  ) => Promise<SubmissionResult>;
}

export function useFormSubmission(): FormSubmissionHook {
  const { toast } = useToast();
  const { logSubmissionAttempt, logSubmissionError, logSubmissionSuccess } = useSubmissionTracking();

  const validateSubmission = useCallback((
    data: MoveRequestForm,
    moveType: MoveType | null,
    { validateField }: ValidationFunctions
  ): { isValid: boolean; error?: string } => {
    if (!moveType) {
      return { isValid: false, error: "Missing move type" };
    }

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

  const handleFormSubmit = useCallback(async (
    data: MoveRequestForm,
    moveType: MoveType | null,
    { validateField, sanitizeInput }: ValidationFunctions
  ): Promise<SubmissionResult> => {
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
        return { success: false, error: validation.error };
      }

      const submissionData = {
        ...data,
        moveType,
        fullName: sanitizeInput(data.fullName),
        email: sanitizeInput(data.email),
        phone: sanitizeInput(data.phone),
        specialInstructions: data.specialInstructions?.trim()
      };

      logSubmissionSuccess();
      return { success: true, submissionData };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown submission error";
      logSubmissionError(errorMessage);
      
      toast({
        title: "Submission Failed",
        description: "Please try again. If the problem persists, contact support.",
        variant: "destructive"
      });

      return { success: false, error: errorMessage };
    }
  }, [toast, logSubmissionAttempt, logSubmissionError, logSubmissionSuccess, validateSubmission]);

  return { handleFormSubmit };
}
