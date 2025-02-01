import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactInfoSectionProps {
  register: any;
  errors: any;
}

export function ContactInfoSection({ register, errors }: ContactInfoSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium text-[#040480]">
          Phone Number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          {...register("phone", { required: "Phone number is required" })}
          className={`h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300 ${
            errors.phone ? 'border-red-500' : ''
          }`}
          placeholder="Enter business phone number"
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="managerName" className="text-sm font-medium text-[#040480]">
          Account Manager Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="managerName"
          {...register("managerName", { required: "Account manager name is required" })}
          className={`h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300 ${
            errors.managerName ? 'border-red-500' : ''
          }`}
          placeholder="Enter account manager's name"
        />
        {errors.managerName && <p className="text-red-500 text-sm mt-1">{errors.managerName.message}</p>}
      </div>
    </>
  );
}