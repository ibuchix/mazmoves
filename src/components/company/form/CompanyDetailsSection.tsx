import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CompanyDetailsSectionProps {
  register: any;
  errors: any;
}

export function CompanyDetailsSection({ register, errors }: CompanyDetailsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-[#040480]">Company Name</Label>
        <Input
          id="name"
          {...register("name", { required: "Company name is required" })}
          className="border-[#1f3dd2] focus:ring-[#84d21f]"
          placeholder="Enter company name"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="registrationNumber" className="text-sm font-medium text-[#040480]">
          Company Registration Number
          <span className="text-red-500">*</span>
        </Label>
        <Input
          id="registrationNumber"
          {...register("registrationNumber", { required: "Company registration number is required" })}
          className="border-[#1f3dd2] focus:ring-[#84d21f]"
          placeholder="Enter company registration number"
        />
        {errors.registrationNumber && <p className="text-red-500 text-sm">{errors.registrationNumber.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="vatNumber" className="text-sm font-medium text-[#040480]">
          VAT Registration Number (Optional)
        </Label>
        <Input
          id="vatNumber"
          {...register("vatNumber")}
          className="border-[#1f3dd2] focus:ring-[#84d21f]"
          placeholder="Enter VAT number (if applicable)"
        />
      </div>
    </div>
  );
}