import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CompanyRegistrationForm {
  name: string;
  registrationNumber: string;
  vatNumber: string;
  email: string;
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
          vat_number: data.vatNumber,
          contact_email: data.email,
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Company Name</Label>
          <Input
            id="name"
            {...register("name", { required: true })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="registrationNumber">Registration Number</Label>
          <Input
            id="registrationNumber"
            {...register("registrationNumber", { required: true })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="vatNumber">VAT Registration Number</Label>
          <Input
            id="vatNumber"
            {...register("vatNumber", { required: true })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            {...register("email", { required: true })}
            className="mt-1"
          />
        </div>

        <div className="space-y-4">
          <Label>Company Address</Label>
          <Input
            placeholder="Street Address"
            {...register("address.street", { required: true })}
          />
          <Input
            placeholder="City"
            {...register("address.city", { required: true })}
          />
          <Input
            placeholder="State/Province"
            {...register("address.state", { required: true })}
          />
          <Input
            placeholder="Postal Code"
            {...register("address.zipCode", { required: true })}
          />
        </div>

        <div>
          <Label htmlFor="managerName">Account Manager Name</Label>
          <Input
            id="managerName"
            {...register("managerName", { required: true })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="transitInsurance">Goods in Transit Insurance</Label>
          <Input
            id="transitInsurance"
            type="file"
            accept=".pdf,.doc,.docx"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="liabilityInsurance">Public Liability Insurance</Label>
          <Input
            id="liabilityInsurance"
            type="file"
            accept=".pdf,.doc,.docx"
            required
            className="mt-1"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-[#040480] hover:bg-[#1f3dd2]"
        disabled={uploading}
      >
        {uploading ? "Registering..." : "Register Company"}
      </Button>
    </form>
  );
}