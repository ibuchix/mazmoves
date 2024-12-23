import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UseFormRegister } from "react-hook-form";
import { MoveRequestForm } from "@/types/move-request";

interface ContactStepProps {
  register: UseFormRegister<MoveRequestForm>;
}

export function ContactStep({ register }: ContactStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Contact Information</h3>
      <div className="grid gap-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            {...register("fullName", { required: true })}
          />
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            {...register("email", { required: true })}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            {...register("phone", { required: true })}
          />
        </div>
        <div>
          <Label htmlFor="moveDate">Preferred Move Date</Label>
          <Input
            id="moveDate"
            type="date"
            {...register("moveDate", { required: true })}
          />
        </div>
        <div>
          <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
          <Input
            id="specialInstructions"
            {...register("specialInstructions")}
          />
        </div>
      </div>
    </div>
  );
}