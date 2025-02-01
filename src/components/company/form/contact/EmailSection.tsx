import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailSectionProps {
  register: any;
  errors: any;
  getValues: any;
}

export function EmailSection({ register, errors, getValues }: EmailSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-[#040480]">
          Business Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          {...register("email", { 
            required: "Email is required",
            validate: {
              validEmail: (value: string) => {
                const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
                return emailRegex.test(value) || "Please enter a valid email address";
              }
            }
          })}
          className={`h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300 ${
            errors.email ? 'border-red-500' : ''
          }`}
          placeholder="Enter business email address"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">
            {errors.email.type === 'exists' 
              ? "This email is already registered. Please use a different email or login to your existing account."
              : errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmEmail" className="text-sm font-medium text-[#040480]">
          Confirm Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="confirmEmail"
          type="email"
          {...register("confirmEmail", {
            required: "Please confirm your email",
            validate: (value: string) => {
              const email = getValues("email");
              return value === email || "Email addresses do not match";
            }
          })}
          className={`h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300 ${
            errors.confirmEmail ? 'border-red-500' : ''
          }`}
          placeholder="Confirm business email address"
        />
        {errors.confirmEmail && (
          <p className="text-red-500 text-sm mt-1">{errors.confirmEmail.message}</p>
        )}
      </div>
    </>
  );
}