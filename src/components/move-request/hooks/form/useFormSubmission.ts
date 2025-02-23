
import { useToast } from "@/hooks/use-toast";
import { MoveRequestForm, MoveType } from "@/types/move-request";
import { useSubmissionTracking } from "@/hooks/move-request/use-submission-tracking";
import { supabase } from "@/integrations/supabase/client";

// Define type for validation/sanitization functions
type ValidationFunctions = {
  validateField: (value: string, pattern: RegExp, minLength?: number) => boolean;
  sanitizeInput: (input: string) => string;
};

export function useFormSubmission() {
  const { toast } = useToast();
  const { logSubmissionAttempt, logSubmissionError, logSubmissionSuccess } = useSubmissionTracking();

  const handleFormSubmit = async (
    data: MoveRequestForm,
    moveType: MoveType | null,
    { validateField, sanitizeInput }: ValidationFunctions
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      logSubmissionAttempt(data);

      // Validate move type first
      if (!moveType) {
        toast({
          title: "Move Type Required",
          description: "Please select a move type",
          variant: "destructive",
        });
        return { success: false, error: "Missing move type" };
      }

      // Validation checks
      const validations = [
        {
          condition: !validateField(data.email, /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i),
          error: { title: "Invalid Email", description: "Please enter a valid email address" }
        },
        {
          condition: !validateField(data.phone, /^[0-9\s\-\+\(\)]{8,}$/),
          error: { title: "Invalid Phone", description: "Please enter a valid phone number" }
        },
        {
          condition: !validateField(data.fullName, /^[a-zA-Z\s-']+$/, 2),
          error: { title: "Invalid Name", description: "Please enter a valid full name (minimum 2 characters)" }
        }
      ];

      for (const validation of validations) {
        if (validation.condition) {
          toast({ variant: "destructive", ...validation.error });
          return { success: false, error: validation.error.title };
        }
      }

      // Sanitize data
      const submissionData = {
        ...data,
        moveType,
        fullName: sanitizeInput(data.fullName),
        email: sanitizeInput(data.email),
        phone: sanitizeInput(data.phone),
        specialInstructions: data.specialInstructions?.trim()
      };

      // Send confirmation email via Supabase Edge Function
      try {
        const { error: emailError } = await supabase.functions.invoke(
          'send-confirmation-email',
          {
            body: {
              customerEmail: submissionData.email,
              customerName: submissionData.fullName
            }
          }
        );

        if (emailError) {
          console.error('Error sending confirmation email:', emailError);
          toast({
            title: "Email Notification Failed",
            description: "We couldn't send you a confirmation email, but your request was received",
            variant: "destructive"
          });
          // Continue with submission even if email fails
        }
      } catch (emailError) {
        console.error('Error in email sending process:', emailError);
        // Continue with submission even if email fails
      }

      logSubmissionSuccess();
      return { success: true };

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
  };

  return { handleFormSubmit };
}
