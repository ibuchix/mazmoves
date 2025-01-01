import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadCompanyDocument } from "@/utils/fileUpload";
import { toast } from "sonner";
import { CompanyRegistrationForm } from "@/types/company";

export function useCompanyRegistration() {
  const [uploading, setUploading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleRegistration = async (data: CompanyRegistrationForm) => {
    try {
      setUploading(true);
      
      const transitInsuranceInput = document.getElementById('transitInsurance') as HTMLInputElement;
      const liabilityInsuranceInput = document.getElementById('liabilityInsurance') as HTMLInputElement;
      
      const transitInsurancePath = await uploadCompanyDocument(
        transitInsuranceInput.files![0],
        'transit'
      );
      
      const liabilityInsurancePath = await uploadCompanyDocument(
        liabilityInsuranceInput.files![0],
        'liability'
      );

      const { error: insertError } = await supabase
        .from('companies')
        .insert({
          name: data.name,
          registration_number: data.registrationNumber,
          vat_number: data.vatNumber || null,
          contact_email: data.email,
          contact_phone: data.phone,
          business_address: data.address,
          manager_name: data.managerName,
          insurance_docs: [
            { type: 'transit', path: transitInsurancePath },
            { type: 'liability', path: liabilityInsurancePath }
          ]
        });

      if (insertError) throw insertError;

      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
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