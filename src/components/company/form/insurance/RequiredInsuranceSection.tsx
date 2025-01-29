import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { InsuranceType } from "@/types/company";
import { UseFormRegister } from "react-hook-form";
import { CompanyRegistrationForm } from "@/types/company";

interface RequiredInsuranceSectionProps {
  insurances: InsuranceType[];
  errors: any;
  register: UseFormRegister<CompanyRegistrationForm>;
}

export function RequiredInsuranceSection({ insurances, errors, register }: RequiredInsuranceSectionProps) {
  if (insurances.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {insurances.map((insurance) => (
        <Card key={insurance.id} className="p-6 space-y-4 bg-white/50 backdrop-blur-sm">
          <div className="space-y-2">
            <Label 
              htmlFor={`insurance_${insurance.id}`} 
              className="text-sm font-medium text-[#040480]"
            >
              {insurance.name}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            {insurance.description && (
              <p className="text-sm text-gray-500">{insurance.description}</p>
            )}
            <div className="relative group">
              <div className="relative flex items-center justify-center w-full h-11 px-4 border border-[#1f3dd2] rounded-md bg-white hover:bg-gray-50 cursor-pointer transition-all duration-300">
                <Input
                  id={`insurance_${insurance.id}`}
                  {...register(`insurance_${insurance.id}`, { required: "This insurance document is required" })}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex items-center gap-2 text-[#040480]">
                  <Upload className="w-5 h-5" />
                  <span className="text-sm font-medium">Choose File</span>
                </div>
              </div>
            </div>
            {errors[`insurance_${insurance.id}`] && (
              <p className="text-red-500 text-sm">{errors[`insurance_${insurance.id}`].message}</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}