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

      // Create form data for API
      const companyData = {
        name: data.name,
        registration_number: data.registrationNumber,
        vat_number: data.vatNumber || null,
        contact_email: data.email,
        contact_phone: data.phone,
        business_address: data.address,
        manager_name: data.managerName,
        country_code: data.country_code,
        country_name: data.country_name,
        registration_status: 'pending'
      };

      // Call the registration edge function
      const { data: response, error } = await supabase.functions.invoke('register-company', {
        body: { companyData }
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