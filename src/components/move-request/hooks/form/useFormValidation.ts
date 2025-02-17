
import { useToast } from "@/hooks/use-toast";
import DOMPurify from "dompurify";
import { PropertySize } from "@/types/move-request";
import { Address } from "@/types/address";

export function useFormValidation() {
  const { toast } = useToast();

  const validateField = (value: string, pattern: RegExp, minLength = 0): boolean => {
    if (!value || value.length < minLength) return false;
    return pattern.test(value);
  };

  const sanitizeInput = (input: string): string => {
    return DOMPurify.sanitize(input.trim(), { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [] 
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

  const validateAddress = (address: Address | undefined, type: 'pickup' | 'delivery') => {
    if (!address?.street || !address?.city || !address?.state || !address?.zipCode) {
      toast({
        title: "Missing Information",
        description: `Please fill in all ${type} address fields before proceeding`,
        variant: "destructive"
      });
      return false;
    }

    // Validate postal code format and length
    if (!/^[A-Z0-9\s-]{3,10}$/i.test(address.zipCode)) {
      toast({
        title: "Invalid Postal Code",
        description: `Please enter a valid postal code for ${type} address (3-10 characters)`,
        variant: "destructive"
      });
      return false;
    }

    // Validate city format
    if (!/^[a-zA-Z\s\-']+$/.test(address.city) || address.city.length > 50) {
      toast({
        title: "Invalid City Name",
        description: `Please enter a valid city name for ${type} address`,
        variant: "destructive"
      });
      return false;
    }

    // Validate state format
    if (!/^[a-zA-Z\s\-']+$/.test(address.state) || address.state.length > 20) {
      toast({
        title: "Invalid State/Province",
        description: `Please enter a valid state/province for ${type} address`,
        variant: "destructive"
      });
      return false;
    }

    // Validate street address format
    if (!/^[a-zA-Z0-9\s,.\-#']+$/.test(address.street) || address.street.length > 100) {
      toast({
        title: "Invalid Street Address",
        description: `Please enter a valid street address for ${type} address`,
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
