import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { CompanyDetailsSection } from "./form/CompanyDetailsSection";
import { ContactDetailsSection } from "./form/ContactDetailsSection";
import { AddressSection } from "./form/AddressSection";
import { InsuranceSection } from "./form/InsuranceSection";

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
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileUpload = async (file: File, prefix: string) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${prefix}_${crypto.randomUUID()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('company_docs')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    return filePath;
  };

  const onSubmit = async (data: CompanyRegistrationForm) => {
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

      toast({
        title: "Registration successful",
        description: "Your company has been registered. Please wait for admin approval.",
      });

      navigate('/company/dashboard');
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "There was an error registering your company. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6 space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <CompanyDetailsSection register={register} errors={errors} />
        <ContactDetailsSection register={register} errors={errors} />
        <AddressSection register={register} errors={errors} />
        <InsuranceSection errors={errors} />

        <Button 
          type="submit" 
          className="w-full bg-[#040480] hover:bg-[#1f3dd2] transition-colors duration-300"
          disabled={uploading}
        >
          {uploading ? "Registering..." : "Register Company"}
        </Button>
      </form>
    </Card>
  );
}