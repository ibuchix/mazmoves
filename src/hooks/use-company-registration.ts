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
      
      // Create auth user
      console.log('Creating auth user...');
      const authData = await createAuthUser(data.email, data.password);
      if (!authData?.user) {
        throw new Error('Failed to create user account. Please try again.');
      }
      console.log('Auth user created successfully:', authData.user.id);

      // Create company record
      console.log('Creating company record...');
      await createCompanyRecord(data, authData.user.id);
      console.log('Company record created successfully');

      // Show success immediately
      setShowSuccessDialog(true);
      toast.success("Registration successful! Please check your email to confirm your address.", {
        duration: 6000
      });

      // Send welcome email in background
      sendWelcomeEmail(data.email, data.name)
        .then(result => {
          if (!result.success) {
            toast.error("There was an issue sending the welcome email. Our team will reach out shortly.", {
              duration: 6000
            });
          }
        })
        .catch(console.error); // Non-blocking

    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed. ";
      
      if (error.message.includes('auth')) {
        errorMessage += "There was an issue creating your account. ";
      } else if (error.message.includes('already exists')) {
        errorMessage += "An account with this email already exists. ";
      } else if (error.message.includes('Insurance')) {
        errorMessage += "Please ensure all required insurance documents are uploaded. ";
      } else {
        errorMessage += "Please try again or contact support if the issue persists. ";
      }
      
      toast.error(errorMessage, {
        duration: 6000
      });
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