import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface ContactDetailsSectionProps {
  register: any;
  errors: any;
  getValues: any;
}

export function ContactDetailsSection({ register, errors, getValues }: ContactDetailsSectionProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[#040480]">Contact Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <div className="space-y-2 relative">
          <Label htmlFor="password" className="text-sm font-medium text-[#040480]">
            Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password", { 
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters"
                }
              })}
              className={`h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300 pr-10 ${
                errors.password ? 'border-red-500' : ''
              }`}
              placeholder="Create a secure password"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <div className="space-y-2 relative">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#040480]">
            Confirm Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value: string) => {
                  const password = getValues("password");
                  return value === password || "Passwords do not match";
                }
              })}
              className={`h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300 pr-10 ${
                errors.confirmPassword ? 'border-red-500' : ''
              }`}
              placeholder="Confirm your password"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-[#040480]">
            Business Phone <span className="text-red-500">*</span>
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

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="managerName" className="text-sm font-medium text-[#040480]">
            Account Manager Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="managerName"
            {...register("managerName", { required: "Manager name is required" })}
            className={`h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300 ${
              errors.managerName ? 'border-red-500' : ''
            }`}
            placeholder="Enter account manager's full name"
          />
          {errors.managerName && <p className="text-red-500 text-sm mt-1">{errors.managerName.message}</p>}
        </div>
      </div>
    </div>
  );
}