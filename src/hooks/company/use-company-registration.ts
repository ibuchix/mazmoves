import { CompanyRegistrationForm } from "@/types/company";
import { toast } from "sonner";
import { useRegistrationState } from "./use-registration-state";
import { registerCompany } from "@/services/company/registration.service";
import { validateRegistration } from "./use-registration-validation";
import { REGISTRATION_ERROR_CODES, handleRegistrationError } from "@/utils/error/registration-errors";

export function useCompanyRegistration() {
  const {
    uploading,
    setUploading,
    showSuccessDialog,
    setShowSuccessDialog,
    error,
    setError,
    rateLimitExceeded,
    setRateLimitExceeded
  } = useRegistrationState();

  const handleRegistration = async (data: CompanyRegistrationForm) => {
    if (rateLimitExceeded) {
      toast.error("Rate Limit Exceeded", {
        description: "Please wait a few minutes before trying again."
      });
      return;
    }

    setError(null);
    setUploading(true);
    
    try {
      // Validate registration attempt
      await validateRegistration(data);

      // Register company
      const { authData, response } = await registerCompany(data);

      console.log('Registration successful:', response);
      setShowSuccessDialog(true);
      toast.success("Registration Successful", {
        description: "Please check your email to verify your account.",
      });
    } catch (err: any) {
      const registrationError = handleRegistrationError(err);
      console.error('Registration error:', registrationError);
      
      setError(registrationError.code);
      
      if (registrationError.code === REGISTRATION_ERROR_CODES.RATE_LIMIT) {
        setRateLimitExceeded(true);
        // Reset rate limit after 5 minutes
        setTimeout(() => {
          setRateLimitExceeded(false);
          setError(null);
        }, 5 * 60 * 1000);
      }

      toast.error("Registration Failed", {
        description: registrationError.message
      });
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    showSuccessDialog,
    setShowSuccessDialog,
    handleRegistration,
    error,
    rateLimitExceeded
  };
}