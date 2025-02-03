import { CompanyRegistrationForm } from "@/types/company";
import { toast } from "sonner";
import { useRegistrationState } from "./use-registration-state";
import { supabase } from "@/integrations/supabase/client";
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
      console.log('Starting company registration process...');
      
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.managerName,
            role: 'company'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from auth signup');

      // Wait a short moment to ensure the auth user is fully created
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Register the company using our secure function
      const { data: response, error: registerError } = await supabase.rpc(
        'register_company',
        {
          company_data: {
            name: data.name,
            registration_number: data.registrationNumber,
            contact_phone: data.phone,
            business_address: data.address,
            manager_name: data.managerName,
            country_code: data.country_code,
            country_name: data.country_name,
            latitude: null,
            longitude: null
          },
          auth_user_id: authData.user.id,
          user_email: data.email,
          user_full_name: data.managerName
        }
      );
      
      if (registerError) throw registerError;

      console.log('Registration successful:', response);
      setShowSuccessDialog(true);
      toast.success("Registration Successful", {
        description: "Please check your email to verify your account."
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      
      const registrationError = handleRegistrationError(err);
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