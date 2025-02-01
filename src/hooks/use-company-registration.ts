import { useState } from "react";
import { toast } from "sonner";
import { CompanyRegistrationForm } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";

export function useCompanyRegistration() {
  const [uploading, setUploading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleRegistration = async (data: CompanyRegistrationForm) => {
    try {
      setUploading(true);
      console.log('Starting registration process with data:', data);
      
      // Get file inputs
      const transitInsuranceInput = document.getElementById('insurance_transit') as HTMLInputElement;
      const liabilityInsuranceInput = document.getElementById('insurance_liability') as HTMLInputElement;
      
      if (!transitInsuranceInput?.files?.length || !liabilityInsuranceInput?.files?.length) {
        throw new Error('Insurance documents are required');
      }

      // Create form data
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('name', data.name);
      formData.append('registrationNumber', data.registrationNumber);
      formData.append('vatNumber', data.vatNumber || '');
      formData.append('phone', data.phone);
      formData.append('managerName', data.managerName);
      formData.append('address', JSON.stringify(data.address));
      formData.append('transitInsurance', transitInsuranceInput.files[0]);
      formData.append('liabilityInsurance', liabilityInsuranceInput.files[0]);
      formData.append('country', data.country);

      // Call the registration edge function
      const { data: response, error } = await supabase.functions.invoke('register-company', {
        body: formData,
      });

      if (error) {
        // Check if the error is about existing email
        if (error.message.includes('already exists')) {
          toast.error("This email is already registered. Please use a different email or login to your existing account.");
          return;
        }
        throw error;
      }

      // Show success dialog and toast
      setShowSuccessDialog(true);
      toast.success("Registration successful! Please check your email to confirm your address.");

    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed. ";
      
      if (error.message.includes('auth')) {
        errorMessage += "There was an issue creating your account. ";
      } else if (error.message.includes('already exists')) {
        errorMessage += "An account with this email already exists. Please use a different email or login. ";
      } else if (error.message.includes('Insurance')) {
        errorMessage += "Please ensure all required insurance documents are uploaded. ";
      } else if (error.message.includes('Registration is not available in this country')) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please try again or contact support if the issue persists. ";
      }
      
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    showSuccessDialog,
    setShowSuccessDialog,
    handleRegistration
  };
}