
import { useState } from "react";
import { CompanyRegistrationForm } from "@/types/company";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { registerCompany } from "@/services/company/registration.service";

export function useCompanyRegistration() {
  const [uploading, setUploading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);

  const handleRegistration = async (data: CompanyRegistrationForm) => {
    setError(null);
    setUploading(true);
    
    try {
      console.log('Starting company registration process...', {
        name: data.name,
        email: data.email
      });
      
      const response = await registerCompany(data);

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
      
      // Parse error message from response if available
      let errorMessage = err.message;
      try {
        if (err.message && err.message.includes('{')) {
          const errorBody = JSON.parse(err.message);
          errorMessage = errorBody.details || errorBody.error || err.message;
        }
      } catch (e) {
        // If parsing fails, use original message
      }
      
      if (errorMessage?.includes('rate limit')) {
        setRateLimitExceeded(true);
        setError('rate_limit');
        toast.error("Rate Limit Exceeded", {
          description: "Too many registration attempts. Please try again later."
        });
        
        setTimeout(() => {
          setRateLimitExceeded(false);
          setError(null);
        }, 5 * 60 * 1000);
      }
      else if (errorMessage?.includes('already exists')) {
        setError('duplicate_email');
        toast.error("Registration Failed", {
          description: "An account with this email already exists."
        });
      }
      else {
        setError('unknown');
        toast.error("Registration Failed", {
          description: errorMessage || "An error occurred during registration. Please try again."
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
