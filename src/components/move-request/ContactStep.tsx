// ContactStep
// Step 5 of the move request wizard: collects name, email, phone, move date,
// and special instructions. Updated to sync browser/password-manager autofill
// values back into react-hook-form so the "Submit" button enables correctly
// when fields are populated by Chrome / Safari / iOS Keychain / 1Password etc.
// (Native autofill does not always fire `input`/`change` events, which left
// RHF's internal state empty and kept the CTA disabled.)

import { useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { MoveRequestForm } from "@/types/move-request";

interface ContactStepProps {
  register: UseFormRegister<MoveRequestForm>;
  errors: FieldErrors<MoveRequestForm>;
  setValue?: UseFormSetValue<MoveRequestForm>;
}

const AUTOFILL_FIELDS = ["fullName", "email", "phone", "moveDate", "specialInstructions"] as const;

export function ContactStep({ register, errors, setValue }: ContactStepProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Re-read raw DOM values into react-hook-form. Called on autofill animation
  // events and on mount (covers values populated before the step rendered).
  useEffect(() => {
    if (!setValue || !containerRef.current) return;
    const root = containerRef.current;

    const syncAll = () => {
      AUTOFILL_FIELDS.forEach((name) => {
        const el = root.querySelector<HTMLInputElement>(`#${name}`);
        if (el && el.value) {
          setValue(name as any, el.value, { shouldValidate: true, shouldDirty: true });
        }
      });
    };

    // Initial sync (some browsers autofill before mount/focus).
    const t1 = window.setTimeout(syncAll, 100);
    const t2 = window.setTimeout(syncAll, 600);

    const onAnimStart = (e: AnimationEvent) => {
      if (e.animationName !== "onAutoFillStart") return;
      const target = e.target as HTMLInputElement | null;
      if (!target || !target.id) return;
      if ((AUTOFILL_FIELDS as readonly string[]).includes(target.id)) {
        setValue(target.id as any, target.value, { shouldValidate: true, shouldDirty: true });
      }
    };

    root.addEventListener("animationstart", onAnimStart, true);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      root.removeEventListener("animationstart", onAnimStart, true);
    };
  }, [setValue]);

  return (
    <div className="space-y-4" ref={containerRef}>
      <h3 className="text-lg font-semibold text-brand-slate">Contact Information</h3>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium text-brand-slate">
            Full Name
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="fullName"
            autoComplete="name"
            {...register("fullName", {
              required: "Full name is required",
              minLength: { value: 2, message: "Name must be at least 2 characters" }
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
            autoComplete="email"
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
            autoComplete="tel"
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
