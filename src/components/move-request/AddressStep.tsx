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
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="grid gap-4">
        <div>
          <Label htmlFor={`${type}-street`}>Street Address</Label>
          <Input
            id={`${type}-street`}
            {...register(`${type}Address.street` as any, { required: true })}
          />
        </div>
        <div>
          <Label htmlFor={`${type}-city`}>City</Label>
          <Input
            id={`${type}-city`}
            {...register(`${type}Address.city` as any, { required: true })}
          />
        </div>
        <div>
          <Label htmlFor={`${type}-state`}>State/Province</Label>
          <Input
            id={`${type}-state`}
            {...register(`${type}Address.state` as any, { required: true })}
          />
        </div>
        {isInternational && (
          <div>
            <Label htmlFor={`${type}-country`}>Country</Label>
            <Input
              id={`${type}-country`}
              {...register(`${type}Address.country` as any, { required: true })}
            />
          </div>
        )}
        <div>
          <Label htmlFor={`${type}-zipCode`}>Postal Code</Label>
          <Input
            id={`${type}-zipCode`}
            {...register(`${type}Address.zipCode` as any, { required: true })}
          />
        </div>
      </div>
    </div>
  );
}