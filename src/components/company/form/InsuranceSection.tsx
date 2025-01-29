import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RequiredInsuranceSection } from "./insurance/RequiredInsuranceSection";
import { OptionalInsuranceSection } from "./insurance/OptionalInsuranceSection";
import { InsuranceType } from "@/types/company";

interface InsuranceSectionProps {
  errors: any;
  countryCode?: string;
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
      <RequiredInsuranceSection insurances={requiredInsurances} errors={errors} />
      <OptionalInsuranceSection insurances={optionalInsurances} />
    </div>
  );
}