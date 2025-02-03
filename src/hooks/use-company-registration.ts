import { useState } from "react";
import { CompanyRegistrationForm } from "@/types/company";
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

      // Wait a short moment to ensure the auth user is fully created
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Now register the company using our new function
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
            latitude: null, // Will be set by geocoding trigger
            longitude: null // Will be set by geocoding trigger
          },
          auth_user_id: authData.user.id,
          user_email: data.email,
          user_full_name: data.managerName
        }
      );
      
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
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "An account with this email already exists.",
        });
      }
      else if (err.message?.includes('country')) {
        setError('country_not_supported');
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "Registration is not available in your country.",
        });
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