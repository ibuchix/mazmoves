
import { useToast } from "@/hooks/use-toast";
import { MoveRequestForm, MoveType } from "@/types/move-request";
import { useSubmitMoveRequest } from "@/hooks/use-submit-move-request";

export function useFormSubmission() {
  const { toast } = useToast();
  const { handleSubmit: onSubmit } = useSubmitMoveRequest();

  const handleFormSubmit = (
    data: MoveRequestForm,
    moveType: MoveType | null,
    validateField: (value: string, pattern: RegExp, minLength?: number) => boolean,
    sanitizeInput: (input: string) => string
  ) => {
    if (!moveType) {
      toast({
        title: "Missing Move Type",
        description: "Please select a move type before submitting",
        variant: "destructive"
      });
      return;
    }

    // Final validation before submission
    const formData = {
      ...data,
      moveType,
      fullName: sanitizeInput(data.fullName),
      email: sanitizeInput(data.email),
      phone: sanitizeInput(data.phone),
      specialInstructions: data.specialInstructions ? sanitizeInput(data.specialInstructions) : undefined,
      moveDate: data.moveDate
    };

    // Validate email format
    if (!validateField(formData.email, /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    // Validate phone format
    if (!validateField(formData.phone, /^[0-9\s\-\+\(\)]{8,}$/)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    // Validate name length and format
    if (!validateField(formData.fullName, /^[a-zA-Z\s-']+$/, 2)) {
      toast({
        title: "Invalid Name",
        description: "Please enter a valid full name (minimum 2 characters)",
        variant: "destructive"
      });
      return;
    }

    onSubmit(formData);
  };

  return { handleFormSubmit };
}
