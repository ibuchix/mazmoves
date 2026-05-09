import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { MoveRequestForm } from "@/types/move-request";

interface ContactStepProps {
  register: UseFormRegister<MoveRequestForm>;
  errors: FieldErrors<MoveRequestForm>;
}

export function ContactStep({ register, errors }: ContactStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-brand-slate">Contact Information</h3>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium text-brand-slate">
            Full Name
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="fullName"
            {...register("fullName", { 
              required: "Full name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters"
              }
            })}
            className={`h-11 border-brand-slateLight focus:ring-brand-green transition-all duration-300 ${
              errors.fullName ? "border-red-500" : ""
            }`}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-brand-slate">
            Email Address
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email", {
              required: "Email address is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Please enter a valid email address"
              }
            })}
            className={`h-11 border-brand-slateLight focus:ring-brand-green transition-all duration-300 ${
              errors.email ? "border-red-500" : ""
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-brand-slate">
            Phone Number
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            {...register("phone", {
              required: "Phone number is required",
              pattern: {
                value: /^[0-9\s\-\+\(\)]{8,}$/,
                message: "Please enter a valid phone number"
              }
            })}
            className={`h-11 border-brand-slateLight focus:ring-brand-green transition-all duration-300 ${
              errors.phone ? "border-red-500" : ""
            }`}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="moveDate" className="text-sm font-medium text-brand-slate">
            Preferred Move Date
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="moveDate"
            type="date"
            {...register("moveDate", {
              required: "Move date is required",
              validate: (value) => {
                const date = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date >= today || "Move date cannot be in the past";
              }
            })}
            className={`h-11 border-brand-slateLight focus:ring-brand-green transition-all duration-300 ${
              errors.moveDate ? "border-red-500" : ""
            }`}
          />
          {errors.moveDate && (
            <p className="text-red-500 text-sm mt-1">{errors.moveDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialInstructions" className="text-sm font-medium text-brand-slate">
            Special Instructions (Optional)
          </Label>
          <Input
            id="specialInstructions"
            {...register("specialInstructions")}
            className="h-11 border-brand-slateLight focus:ring-brand-green transition-all duration-300"
          />
        </div>
      </div>
    </div>
  );
}