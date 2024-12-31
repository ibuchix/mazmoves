import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactDetailsSectionProps {
  register: any;
  errors: any;
}

export function ContactDetailsSection({ register, errors }: ContactDetailsSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[#040480]">Contact Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-[#040480]">Business Email</Label>
          <Input
            id="email"
            type="email"
            {...register("email", { required: "Email is required" })}
            className="h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300"
            placeholder="Enter business email address"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-[#040480]">Business Phone</Label>
          <Input
            id="phone"
            type="tel"
            {...register("phone", { required: "Phone number is required" })}
            className="h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300"
            placeholder="Enter business phone number"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="managerName" className="text-sm font-medium text-[#040480]">Account Manager Name</Label>
          <Input
            id="managerName"
            {...register("managerName", { required: "Manager name is required" })}
            className="h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300"
            placeholder="Enter account manager's full name"
          />
          {errors.managerName && <p className="text-red-500 text-sm mt-1">{errors.managerName.message}</p>}
        </div>
      </div>
    </div>
  );
}