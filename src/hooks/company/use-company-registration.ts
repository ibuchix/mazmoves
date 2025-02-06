import { useState } from "react";
import { CompanyRegistrationForm } from "@/types/company";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useCompanyRegistration() {
  const [uploading, setUploading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);

  const handleRegistration = async (data: CompanyRegistrationForm) => {
    setError(null);
    setUploading(true);
    
    try {
      console.log('Starting company registration process...');
      
      // Call the register-company edge function with anon key
      const { data: response, error: registerError } = await supabase.functions.invoke(
        'register-company',
        {
          body: {
            companyData: {
              name: data.name,
              registration_number: data.registrationNumber,
              contact_email: data.email,
              contact_phone: data.phone,
              business_address: data.address,
              manager_name: data.managerName,
              country_code: data.country_code,
              country_name: data.country_name,
              password: data.password
            }
          },
          headers: {
            Authorization: `Bearer ${supabase.supabaseKey}`
          }
        }
      );

      if (registerError) {
        console.error('Registration error:', registerError);
        throw registerError;
      }
      
      if (!response?.success) {
        console.error('Registration failed:', response);
        throw new Error('Registration failed');
      }

      console.log('Registration successful:', response);
      setShowSuccessDialog(true);
      toast.success("Registration Successful", {
        description: "Please check your email to verify your account."
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      
      if (err.message?.includes('rate limit')) {
        setRateLimitExceeded(true);
        setError('rate_limit');
        toast.error("Rate Limit Exceeded", {
          description: "Too many registration attempts. Please try again later."
        });
        
        // Reset rate limit after 5 minutes
        setTimeout(() => {
          setRateLimitExceeded(false);
          setError(null);
        }, 5 * 60 * 1000);
      }
      else if (err.message?.includes('already exists')) {
        setError('duplicate_email');
        toast.error("Registration Failed", {
          description: "An account with this email already exists."
        });
      }
      else if (err.message?.includes('country')) {
        setError('country_not_supported');
        toast.error("Registration Failed", {
          description: "Registration is not available in your country."
        });
      }
      else {
        setError('unknown');
        toast.error("Registration Failed", {
          description: "An error occurred during registration. Please try again."
        });
      }
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