import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InsuranceSectionProps {
  errors: any;
}

export function InsuranceSection({ errors }: InsuranceSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="transitInsurance" className="text-sm font-medium text-[#040480]">Goods in Transit Insurance</Label>
        <Input
          id="transitInsurance"
          type="file"
          accept=".pdf,.doc,.docx"
          required
          className="border-[#1f3dd2] focus:ring-[#84d21f]"
        />
        {errors.transitInsurance && <p className="text-red-500 text-sm">{errors.transitInsurance.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="liabilityInsurance" className="text-sm font-medium text-[#040480]">Public Liability Insurance</Label>
        <Input
          id="liabilityInsurance"
          type="file"
          accept=".pdf,.doc,.docx"
          required
          className="border-[#1f3dd2] focus:ring-[#84d21f]"
        />
        {errors.liabilityInsurance && <p className="text-red-500 text-sm">{errors.liabilityInsurance.message}</p>}
      </div>
    </div>
  );
}