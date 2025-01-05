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
      
      // Create auth user and verify creation
      const authData = await createAuthUser(data.email, data.password);
      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Create company record
      await createCompanyRecord(data, authData.user.id);

      // Send welcome email
      await sendWelcomeEmail(data.email, data.name);

      setShowSuccessDialog(true);
      toast.success("Registration successful! Please check your email to confirm your address.");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
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