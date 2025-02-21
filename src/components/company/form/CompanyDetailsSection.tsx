
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister, UseFormWatch } from "react-hook-form";
import { CompanyRegistrationForm } from "@/types/company";

interface CompanyDetailsSectionProps {
  register: UseFormRegister<CompanyRegistrationForm>;
  watch: UseFormWatch<CompanyRegistrationForm>;
  errors: any;
}

export function CompanyDetailsSection({ register, errors }: CompanyDetailsSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[#040480]">Company Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-[#040480]">
            Company Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            {...register("name", { required: "Company name is required" })}
            className="h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300"
            placeholder="Enter your company's legal name"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="registrationNumber" className="text-sm font-medium text-[#040480] flex items-center gap-2">
            Company Registration Number
            <span className="text-sm text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Input
            id="registrationNumber"
            {...register("registrationNumber")}
            className="h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300"
            placeholder="Enter official registration number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vatNumber" className="text-sm font-medium text-[#040480] flex items-center gap-2">
            VAT Registration Number
            <span className="text-sm text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Input
            id="vatNumber"
            {...register("vatNumber")}
            className="h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300"
            placeholder="Enter VAT number if applicable"
          />
        </div>
      </div>
    </div>
  );
}
