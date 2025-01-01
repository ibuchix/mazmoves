import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { CompanyDetailsSection } from "./form/CompanyDetailsSection";
import { ContactDetailsSection } from "./form/ContactDetailsSection";
import { AddressSection } from "./form/AddressSection";
import { InsuranceSection } from "./form/InsuranceSection";
import { Separator } from "@/components/ui/separator";
import { RegistrationSuccessDialog } from "./RegistrationSuccessDialog";
import { useAuth } from "../AuthProvider";

interface CompanyRegistrationForm {
  name: string;
  registrationNumber: string;
  vatNumber?: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  managerName: string;
}

export function RegisterCompanyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<CompanyRegistrationForm>();
  const [uploading, setUploading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  const handleFileUpload = async (file: File, prefix: string) => {
    if (!session?.user?.id) {
      throw new Error("User must be authenticated to upload files");
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `${prefix}_${crypto.randomUUID()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('company_docs')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    return filePath;
  };

  const onSubmit = async (data: CompanyRegistrationForm) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to register a company");
      return;
    }

    try {
      setUploading(true);
      
      const transitInsuranceInput = document.getElementById('transitInsurance') as HTMLInputElement;
      const liabilityInsuranceInput = document.getElementById('liabilityInsurance') as HTMLInputElement;
      
      const transitInsurancePath = await handleFileUpload(
        transitInsuranceInput.files![0],
        'transit'
      );
      
      const liabilityInsurancePath = await handleFileUpload(
        liabilityInsuranceInput.files![0],
        'liability'
      );

      const { error: insertError } = await supabase
        .from('companies')
        .insert({
          name: data.name,
          registration_number: data.registrationNumber,
          vat_number: data.vatNumber || null,
          contact_email: session.user.email, // Use authenticated user's email
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

  return (
    <>
      <Card className="p-8 space-y-8 shadow-lg bg-white/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-8">
            <CompanyDetailsSection register={register} errors={errors} />
            <Separator className="my-8" />
            <ContactDetailsSection register={register} errors={errors} />
            <Separator className="my-8" />
            <AddressSection register={register} errors={errors} />
            <Separator className="my-8" />
            <InsuranceSection errors={errors} />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-[#040480] hover:bg-[#1f3dd2] text-white font-semibold py-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading}
            >
              {uploading ? "Registering..." : "Register Company"}
            </Button>
          </div>
        </form>
      </Card>

      <RegistrationSuccessDialog 
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
      />
    </>
  );
}