import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface PasswordSectionProps {
  register: any;
  errors: any;
  getValues: any;
}

export function PasswordSection({ register, errors, getValues }: PasswordSectionProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
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
    </>
  );
}