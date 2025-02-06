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
      // First create the auth user
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

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user data returned from auth signup');
      }

      // Then register the company
      const { data: companyData, error: registerError } = await supabase.functions.invoke(
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
              auth_user_id: authData.user.id
            }
          }
        }
      );

      if (registerError) {
        console.error('Registration error:', registerError);
        throw registerError;
      }

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
      else {
        setError('unknown');
        toast.error("Registration Failed", {
          description: err.message || "An error occurred during registration. Please try again."
        });
      }
      throw err;
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