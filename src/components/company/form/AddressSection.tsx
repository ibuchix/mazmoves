import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddressSectionProps {
  register: any;
  errors: any;
}

export function AddressSection({ register, errors }: AddressSectionProps) {
  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-[#040480]">Company Address</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Street Address"
          {...register("address.street", { required: "Street address is required" })}
          className="border-[#1f3dd2] focus:ring-[#84d21f]"
        />
        <Input
          placeholder="City"
          {...register("address.city", { required: "City is required" })}
          className="border-[#1f3dd2] focus:ring-[#84d21f]"
        />
        <Input
          placeholder="State/Province"
          {...register("address.state", { required: "State is required" })}
          className="border-[#1f3dd2] focus:ring-[#84d21f]"
        />
        <Input
          placeholder="Postal Code"
          {...register("address.zipCode", { required: "Postal code is required" })}
          className="border-[#1f3dd2] focus:ring-[#84d21f]"
        />
      </div>
    </div>
  );
}