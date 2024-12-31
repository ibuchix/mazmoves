import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactDetailsSectionProps {
  register: any;
  errors: any;
}

export function ContactDetailsSection({ register, errors }: ContactDetailsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-[#040480]">Email Address</Label>
        <Input
          id="email"
          type="email"
          {...register("email", { required: "Email is required" })}
          className="border-[#1f3dd2] focus:ring-[#84d21f]"
          placeholder="Enter email address"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium text-[#040480]">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          {...register("phone", { required: "Phone number is required" })}
          className="border-[#1f3dd2] focus:ring-[#84d21f]"
          placeholder="Enter phone number"
        />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="managerName" className="text-sm font-medium text-[#040480]">Account Manager Name</Label>
        <Input
          id="managerName"
          {...register("managerName", { required: "Manager name is required" })}
          className="border-[#1f3dd2] focus:ring-[#84d21f]"
          placeholder="Enter manager's name"
        />
        {errors.managerName && <p className="text-red-500 text-sm">{errors.managerName.message}</p>}
      </div>
    </div>
  );
}