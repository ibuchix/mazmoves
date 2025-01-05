import { useState } from "react";
import { toast } from "sonner";
import { CompanyRegistrationForm } from "@/types/company";
import { createAuthUser } from "@/utils/auth";
import { createCompanyRecord, sendWelcomeEmail } from "@/utils/company";

export function useCompanyRegistration() {
  const [uploading, setUploading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleRegistration = async (data: CompanyRegistrationForm) => {
    try {
      setUploading(true);
      console.log('Starting registration process with data:', data);
      
      // Create auth user and verify creation
      console.log('Creating auth user...');
      const authData = await createAuthUser(data.email, data.password);
      if (!authData?.user) {
        throw new Error('Failed to create user account');
      }
      console.log('Auth user created successfully:', authData.user.id);

      // Create company record
      console.log('Creating company record...');
      await createCompanyRecord(data, authData.user.id);
      console.log('Company record created successfully');

      // Send welcome email
      console.log('Sending welcome email...');
      await sendWelcomeEmail(data.email, data.name);
      console.log('Welcome email sent successfully');

      setShowSuccessDialog(true);
      toast.success("Registration successful! Please check your email to confirm your address.", {
        duration: 6000
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please try again.", {
        duration: 6000
      });
      setShowSuccessDialog(false);
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