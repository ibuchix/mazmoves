import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadCompanyDocument } from "@/utils/fileUpload";
import { toast } from "sonner";
import { CompanyRegistrationForm } from "@/types/company";
import { geocodeAddress } from "@/utils/geocoding";

export function useCompanyRegistration() {
  const [uploading, setUploading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleRegistration = async (data: CompanyRegistrationForm) => {
    try {
      setUploading(true);
      
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            role: 'company'
          }
        }
      });

      if (authError) throw authError;

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

      // Geocode the company's address
      const coordinates = await geocodeAddress(data.address);

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
          ],
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          auth_user_id: authData.user?.id
        });

      if (insertError) throw insertError;

      // Create user record
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user?.id,
          email: data.email,
          role: 'company',
          full_name: data.managerName
        });

      if (userError) throw userError;

      // Send welcome email
      const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
        body: { 
          email: data.email,
          companyName: data.name
        }
      });

      if (emailError) {
        console.error("Error sending welcome email:", emailError);
      }

      setShowSuccessDialog(true);
      toast.success("Registration successful! Please check your email to confirm your address.");
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