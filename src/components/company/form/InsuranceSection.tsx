import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface InsuranceSectionProps {
  errors: any;
  countryCode?: string;
}

interface InsuranceType {
  id: string;
  name: string;
  description: string;
  is_required: boolean;
}

export function InsuranceSection({ errors, countryCode }: InsuranceSectionProps) {
  const [insuranceTypes, setInsuranceTypes] = useState<InsuranceType[]>([]);

  useEffect(() => {
    async function fetchInsuranceTypes() {
      if (!countryCode) return;
      
      const { data, error } = await supabase
        .from('insurance_types')
        .select('*')
        .eq('country_code', countryCode)
        .order('is_required', { ascending: false });

      if (!error && data) {
        setInsuranceTypes(data);
      }
    }

    fetchInsuranceTypes();
  }, [countryCode]);

  if (!countryCode) {
    return null;
  }

  const requiredInsurances = insuranceTypes.filter(type => type.is_required);
  const optionalInsurances = insuranceTypes.filter(type => !type.is_required);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[#040480]">Insurance Documents</h3>
      
      {/* Required Insurance Documents */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-[#1f3dd2]">Required Documents</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requiredInsurances.map((insurance) => (
            <Card key={insurance.id} className="p-6 space-y-4 bg-white/50 backdrop-blur-sm">
              <div className="space-y-2">
                <Label 
                  htmlFor={`insurance_${insurance.id}`} 
                  className="text-sm font-medium text-[#040480]"
                >
                  {insurance.name}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                {insurance.description && (
                  <p className="text-sm text-gray-500">{insurance.description}</p>
                )}
                <div className="relative">
                  <Input
                    id={`insurance_${insurance.id}`}
                    name={`insurance_${insurance.id}`}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    required
                    className="h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-[#040480] file:text-white hover:file:bg-[#1f3dd2] cursor-pointer"
                  />
                  <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#040480] w-5 h-5" />
                </div>
                {errors[`insurance_${insurance.id}`] && (
                  <p className="text-red-500 text-sm">{errors[`insurance_${insurance.id}`].message}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Optional Insurance Documents */}
      {optionalInsurances.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-[#1f3dd2]">Optional Documents</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {optionalInsurances.map((insurance) => (
              <Card key={insurance.id} className="p-6 space-y-4 bg-white/50 backdrop-blur-sm">
                <div className="space-y-2">
                  <Label 
                    htmlFor={`insurance_${insurance.id}`} 
                    className="text-sm font-medium text-[#040480]"
                  >
                    {insurance.name}
                    <span className="text-gray-400 ml-2">(Optional)</span>
                  </Label>
                  {insurance.description && (
                    <p className="text-sm text-gray-500">{insurance.description}</p>
                  )}
                  <div className="relative">
                    <Input
                      id={`insurance_${insurance.id}`}
                      name={`insurance_${insurance.id}`}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="h-11 border-[#1f3dd2] focus:ring-[#84d21f] transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-[#040480] file:text-white hover:file:bg-[#1f3dd2] cursor-pointer"
                    />
                    <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#040480] w-5 h-5" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}