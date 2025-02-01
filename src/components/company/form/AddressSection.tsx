import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddressSectionProps {
  register: any;
  errors: any;
}

export function AddressSection({ register, errors }: AddressSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[#040480]">Business Address</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="street" className="text-sm font-medium text-[#040480]">
            Street Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="street"
            {...register("address.street", { required: "Street address is required" })}
            className="h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300"
            placeholder="Enter street address"
          />
          {errors.address?.street && <p className="text-red-500 text-sm mt-1">{errors.address.street.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium text-[#040480]">
            City <span className="text-red-500">*</span>
          </Label>
          <Input
            id="city"
            {...register("address.city", { required: "City is required" })}
            className="h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300"
            placeholder="Enter city"
          />
          {errors.address?.city && <p className="text-red-500 text-sm mt-1">{errors.address.city.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state" className="text-sm font-medium text-[#040480]">
            State/Province <span className="text-red-500">*</span>
          </Label>
          <Input
            id="state"
            {...register("address.state", { required: "State is required" })}
            className="h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300"
            placeholder="Enter state or province"
          />
          {errors.address?.state && <p className="text-red-500 text-sm mt-1">{errors.address.state.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode" className="text-sm font-medium text-[#040480]">
            Postal Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="zipCode"
            {...register("address.zipCode", { required: "Postal code is required" })}
            className="h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300"
            placeholder="Enter postal code"
          />
          {errors.address?.zipCode && <p className="text-red-500 text-sm mt-1">{errors.address.zipCode.message}</p>}
        </div>
      </div>
    </div>
  );
}