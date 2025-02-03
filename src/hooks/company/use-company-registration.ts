import { CompanyRegistrationForm } from "@/types/company";
import { useToast } from "@/hooks/use-toast";
import { useRegistrationState } from "./use-registration-state";
import { registerCompany } from "@/services/company/registration.service";
import { verifyRegistration } from "@/services/company/verification.service";
import { validateRegistration } from "./use-registration-validation";
import { handleRegistrationError, REGISTRATION_ERROR_CODES } from "@/utils/error/registration-errors";

export function useCompanyRegistration() {
  const { toast } = useToast();
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
      toast({
        variant: "destructive",
        title: "Rate Limit Exceeded",
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

      // Verify registration completion
      await verifyRegistration(authData.user.id, response.company_id);

      console.log('Registration successful and verified:', response);
      setShowSuccessDialog(true);
      toast({
        title: "Registration Successful",
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

      toast({
        variant: "destructive",
        title: "Registration Failed",
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