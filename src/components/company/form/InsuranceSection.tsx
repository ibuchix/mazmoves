import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { FileUpload } from "lucide-react";

interface InsuranceSectionProps {
  errors: any;
}

export function InsuranceSection({ errors }: InsuranceSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[#040480]">Insurance Documents</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4 bg-white/50 backdrop-blur-sm">
          <div className="space-y-2">
            <Label htmlFor="transitInsurance" className="text-sm font-medium text-[#040480]">
              Goods in Transit Insurance
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="relative">
              <Input
                id="transitInsurance"
                type="file"
                accept=".pdf,.doc,.docx"
                required
                className="h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-[#040480] file:text-white hover:file:bg-[#1f3dd2] cursor-pointer"
              />
              <FileUpload className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#040480] w-5 h-5" />
            </div>
            {errors.transitInsurance && <p className="text-red-500 text-sm">{errors.transitInsurance.message}</p>}
          </div>
        </Card>

        <Card className="p-6 space-y-4 bg-white/50 backdrop-blur-sm">
          <div className="space-y-2">
            <Label htmlFor="liabilityInsurance" className="text-sm font-medium text-[#040480]">
              Public Liability Insurance
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="relative">
              <Input
                id="liabilityInsurance"
                type="file"
                accept=".pdf,.doc,.docx"
                required
                className="h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-[#040480] file:text-white hover:file:bg-[#1f3dd2] cursor-pointer"
              />
              <FileUpload className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#040480] w-5 h-5" />
            </div>
            {errors.liabilityInsurance && <p className="text-red-500 text-sm">{errors.liabilityInsurance.message}</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}