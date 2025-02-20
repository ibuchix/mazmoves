
import { useToast } from "@/hooks/use-toast";
import { MoveRequestForm, MoveType } from "@/types/move-request";
import { useSubmissionTracking } from "@/hooks/move-request/use-submission-tracking";

export function useFormSubmission() {
  const { toast } = useToast();
  const { logSubmissionAttempt, logSubmissionError, logSubmissionSuccess } = useSubmissionTracking();

  const handleFormSubmit = async (
    data: MoveRequestForm,
    moveType: MoveType | null,
    validateField: (value: string, pattern: RegExp, minLength?: number) => boolean,
    sanitizeInput: (input: string) => string
  ) => {
    try {
      logSubmissionAttempt(data);

      if (!moveType) {
        throw new Error("Move type is required");
      }

      // Validate email format
      if (!validateField(data.email, /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive"
        });
        return;
      }

      // Validate phone format
      if (!validateField(data.phone, /^[0-9\s\-\+\(\)]{8,}$/)) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid phone number",
          variant: "destructive"
        });
        return;
      }

      // Validate name length and format
      if (!validateField(data.fullName, /^[a-zA-Z\s-']+$/, 2)) {
        toast({
          title: "Invalid Name",
          description: "Please enter a valid full name (minimum 2 characters)",
          variant: "destructive"
        });
        return;
      }

      // Create sanitized submission data
      const submissionData = {
        ...data,
        fullName: sanitizeInput(data.fullName),
        email: sanitizeInput(data.email),
        phone: sanitizeInput(data.phone),
        specialInstructions: data.specialInstructions 
          ? sanitizeInput(data.specialInstructions) 
          : undefined
      };

      // We'll remove the success toast from here since it's handled in use-submit-move-request.tsx
      logSubmissionSuccess();
      
    } catch (error) {
      logSubmissionError(error);
    }
  };

  return { handleFormSubmit };
}
