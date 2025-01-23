import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { MoveRequestForm } from "@/types/move-request";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface AddressStepProps {
  title: string;
  type: "pickup" | "delivery";
  register: UseFormRegister<MoveRequestForm>;
  errors: FieldErrors<MoveRequestForm>;
  isInternational?: boolean;
  isGeocoding?: boolean;
}

export function AddressStep({ 
  title, 
  type, 
  register, 
  errors, 
  isInternational = false, 
  isGeocoding = false 
}: AddressStepProps) {
  const addressErrors = errors[`${type}Address`];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#040480]">{title}</h3>
        {isGeocoding && (
          <div className="flex items-center text-sm text-[#1f3dd2]">
            <LoadingSpinner className="w-4 h-4 mr-2" />
            Verifying address...
          </div>
        )}
      </div>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${type}-street`} className="text-sm font-medium text-[#040480]">
            Street Address
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id={`${type}-street`}
            className={`h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300 ${
              addressErrors?.street ? "border-red-500" : ""
            }`}
            {...register(`${type}Address.street` as any, { 
              required: "Street address is required" 
            })}
            disabled={isGeocoding}
          />
          {addressErrors?.street && (
            <p className="text-red-500 text-sm mt-1">{addressErrors.street.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${type}-city`} className="text-sm font-medium text-[#040480]">
            City
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id={`${type}-city`}
            className={`h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300 ${
              addressErrors?.city ? "border-red-500" : ""
            }`}
            {...register(`${type}Address.city` as any, { 
              required: "City is required" 
            })}
            disabled={isGeocoding}
          />
          {addressErrors?.city && (
            <p className="text-red-500 text-sm mt-1">{addressErrors.city.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${type}-state`} className="text-sm font-medium text-[#040480]">
            State/Province
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id={`${type}-state`}
            className={`h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300 ${
              addressErrors?.state ? "border-red-500" : ""
            }`}
            {...register(`${type}Address.state` as any, { 
              required: "State/Province is required" 
            })}
            disabled={isGeocoding}
          />
          {addressErrors?.state && (
            <p className="text-red-500 text-sm mt-1">{addressErrors.state.message}</p>
          )}
        </div>

        {isInternational && (
          <div className="space-y-2">
            <Label htmlFor={`${type}-country`} className="text-sm font-medium text-[#040480]">
              Country
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id={`${type}-country`}
              className={`h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300 ${
                addressErrors?.country ? "border-red-500" : ""
              }`}
              {...register(`${type}Address.country` as any, { 
                required: "Country is required" 
              })}
              disabled={isGeocoding}
            />
            {addressErrors?.country && (
              <p className="text-red-500 text-sm mt-1">{addressErrors.country.message}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor={`${type}-zipCode`} className="text-sm font-medium text-[#040480]">
            Postal Code
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id={`${type}-zipCode`}
            className={`h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300 ${
              addressErrors?.zipCode ? "border-red-500" : ""
            }`}
            {...register(`${type}Address.zipCode` as any, { 
              required: "Postal code is required",
              pattern: {
                value: /^[A-Z0-9\s-]{3,10}$/i,
                message: "Please enter a valid postal code"
              }
            })}
            disabled={isGeocoding}
          />
          {addressErrors?.zipCode && (
            <p className="text-red-500 text-sm mt-1">{addressErrors.zipCode.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}