import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { InsuranceType } from "@/types/company";
import { UseFormRegister } from "react-hook-form";
import { CompanyRegistrationForm } from "@/types/company";

interface OptionalInsuranceSectionProps {
  insurances: InsuranceType[];
  register: UseFormRegister<CompanyRegistrationForm>;
}

export function OptionalInsuranceSection({ insurances, register }: OptionalInsuranceSectionProps) {
  if (insurances.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium text-[#1f3dd2]">Optional Documents</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insurances.map((insurance) => (
          <Card key={insurance.id} className="p-6 space-y-4 bg-white/50 backdrop-blur-sm">
            <div className="space-y-2">
              <Label 
                htmlFor={`insurance_${insurance.id}`} 
                className="text-sm font-medium text-[#040480]"
              >
                {insurance.name}
                <span className="text-gray-400 ml-2">(Optional)</span>
              </Label>
              {insurance.description && (
                <p className="text-sm text-gray-500">{insurance.description}</p>
              )}
              <div className="relative">
                <Input
                  id={`insurance_${insurance.id}`}
                  {...register(`insurance_${insurance.id}` as keyof CompanyRegistrationForm)}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-[#040480] file:text-white hover:file:bg-[#1f3dd2] cursor-pointer"
                />
                <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#040480] w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}