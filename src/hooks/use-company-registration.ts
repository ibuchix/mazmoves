import { useState } from "react";
import { CompanyRegistrationForm } from "@/types/company";
import { createCompanyRecord } from "@/utils/company";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useCompanyRegistration() {
  const [uploading, setUploading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);
  const { toast } = useToast();

  const handleRegistration = async (data: CompanyRegistrationForm) => {
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

      // Now create the company record with the new auth user ID
      const response = await createCompanyRecord(data, authData.user.id);
      
      console.log('Registration successful:', response);
      setShowSuccessDialog(true);
      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account.",
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      
      if (err.message?.includes('rate limit')) {
        setRateLimitExceeded(true);
        setError('rate_limit');
        toast({
          variant: "destructive",
          title: "Rate Limit Exceeded",
          description: "Too many registration attempts. Please try again later.",
        });
        
        // Reset rate limit after 5 minutes
        setTimeout(() => {
          setRateLimitExceeded(false);
          setError(null);
        }, 5 * 60 * 1000);
      }
      else if (err.message?.includes('already exists')) {
        setError('duplicate_email');
      }
      else if (err.message?.includes('country')) {
        setError('country_not_supported');
      }
      else {
        setError('unknown');
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "An error occurred during registration. Please try again.",
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