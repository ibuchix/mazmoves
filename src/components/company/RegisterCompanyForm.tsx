import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

interface CompanyRegistrationForm {
  name: string;
  registrationNumber: string;
  vatNumber: string;
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
          vat_number: data.vatNumber,
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-[#040480]">Company Name</Label>
            <Input
              id="name"
              {...register("name", { required: true })}
              className="border-[#1f3dd2] focus:ring-[#84d21f]"
              placeholder="Enter company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationNumber" className="text-sm font-medium text-[#040480]">Registration Number</Label>
            <Input
              id="registrationNumber"
              {...register("registrationNumber", { required: true })}
              className="border-[#1f3dd2] focus:ring-[#84d21f]"
              placeholder="Enter registration number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vatNumber" className="text-sm font-medium text-[#040480]">VAT Registration Number</Label>
            <Input
              id="vatNumber"
              {...register("vatNumber", { required: true })}
              className="border-[#1f3dd2] focus:ring-[#84d21f]"
              placeholder="Enter VAT number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-[#040480]">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...register("email", { required: true })}
              className="border-[#1f3dd2] focus:ring-[#84d21f]"
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-[#040480]">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone", { required: true })}
              className="border-[#1f3dd2] focus:ring-[#84d21f]"
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="managerName" className="text-sm font-medium text-[#040480]">Account Manager Name</Label>
            <Input
              id="managerName"
              {...register("managerName", { required: true })}
              className="border-[#1f3dd2] focus:ring-[#84d21f]"
              placeholder="Enter manager's name"
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-medium text-[#040480]">Company Address</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Street Address"
              {...register("address.street", { required: true })}
              className="border-[#1f3dd2] focus:ring-[#84d21f]"
            />
            <Input
              placeholder="City"
              {...register("address.city", { required: true })}
              className="border-[#1f3dd2] focus:ring-[#84d21f]"
            />
            <Input
              placeholder="State/Province"
              {...register("address.state", { required: true })}
              className="border-[#1f3dd2] focus:ring-[#84d21f]"
            />
            <Input
              placeholder="Postal Code"
              {...register("address.zipCode", { required: true })}
              className="border-[#1f3dd2] focus:ring-[#84d21f]"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transitInsurance" className="text-sm font-medium text-[#040480]">Goods in Transit Insurance</Label>
            <Input
              id="transitInsurance"
              type="file"
              accept=".pdf,.doc,.docx"
              required
              className="border-[#1f3dd2] focus:ring-[#84d21f]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="liabilityInsurance" className="text-sm font-medium text-[#040480]">Public Liability Insurance</Label>
            <Input
              id="liabilityInsurance"
              type="file"
              accept=".pdf,.doc,.docx"
              required
              className="border-[#1f3dd2] focus:ring-[#84d21f]"
            />
          </div>
        </div>

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