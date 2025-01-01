import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Address } from "@/types/address";
import { UseFormRegister } from "react-hook-form";
import { MoveRequestForm } from "@/types/move-request";

interface AddressStepProps {
  title: string;
  type: "pickup" | "delivery";
  register: UseFormRegister<MoveRequestForm>;
  isInternational?: boolean;
}

export function AddressStep({ title, type, register, isInternational = false }: AddressStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#040480]">{title}</h3>
      <div className="grid gap-4">
        <div>
          <Label htmlFor={`${type}-street`} className="text-sm font-medium text-[#040480]">Street Address</Label>
          <Input
            id={`${type}-street`}
            className="h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300"
            {...register(`${type}Address.street` as any, { required: true })}
          />
        </div>
        <div>
          <Label htmlFor={`${type}-city`} className="text-sm font-medium text-[#040480]">City</Label>
          <Input
            id={`${type}-city`}
            className="h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300"
            {...register(`${type}Address.city` as any, { required: true })}
          />
        </div>
        <div>
          <Label htmlFor={`${type}-state`} className="text-sm font-medium text-[#040480]">State/Province</Label>
          <Input
            id={`${type}-state`}
            className="h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300"
            {...register(`${type}Address.state` as any, { required: true })}
          />
        </div>
        {isInternational && (
          <div>
            <Label htmlFor={`${type}-country`} className="text-sm font-medium text-[#040480]">Country</Label>
            <Input
              id={`${type}-country`}
              className="h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300"
              {...register(`${type}Address.country` as any, { required: true })}
            />
          </div>
        )}
        <div>
          <Label htmlFor={`${type}-zipCode`} className="text-sm font-medium text-[#040480]">Postal Code</Label>
          <Input
            id={`${type}-zipCode`}
            className="h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300"
            {...register(`${type}Address.zipCode` as any, { required: true })}
          />
        </div>
      </div>
    </div>
  );
}