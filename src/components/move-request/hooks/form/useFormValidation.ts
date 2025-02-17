
import { useToast } from "@/hooks/use-toast";
import DOMPurify from "dompurify";
import { PropertySize } from "@/types/move-request";

export function useFormValidation() {
  const { toast } = useToast();

  const validateField = (value: string, pattern: RegExp, minLength = 0): boolean => {
    if (!value || value.length < minLength) return false;
    return pattern.test(value);
  };

  const sanitizeInput = (input: string): string => {
    return DOMPurify.sanitize(input.trim(), { 
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [] // No attributes allowed
    });
  };

  const validatePropertySize = (propertySize: PropertySize | undefined) => {
    if (!propertySize) {
      toast({
        title: "Missing Information",
        description: "Please select a property size before proceeding",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const validateAddress = (address: any, type: 'pickup' | 'delivery') => {
    if (!address?.street || !address?.city || !address?.state || !address?.zipCode) {
      toast({
        title: "Missing Information",
        description: `Please fill in all ${type} address fields before proceeding`,
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  return {
    validateField,
    sanitizeInput,
    validatePropertySize,
    validateAddress
  };
}
