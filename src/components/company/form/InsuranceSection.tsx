import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RequiredInsuranceSection } from "./insurance/RequiredInsuranceSection";
import { InsuranceType } from "@/types/company";
import { UseFormRegister } from "react-hook-form";
import { CompanyRegistrationForm } from "@/types/company";

interface InsuranceSectionProps {
  errors: any;
  countryCode?: string;
  register: UseFormRegister<CompanyRegistrationForm>;
}

export function InsuranceSection({ errors, countryCode, register }: InsuranceSectionProps) {
  const [requiredInsurances, setRequiredInsurances] = useState<InsuranceType[]>([]);

  useEffect(() => {
    async function fetchInsuranceTypes() {
      if (!countryCode) return;
      
      console.log("Fetching required insurance types for country:", countryCode);
      
      const { data, error } = await supabase
        .from('insurance_types')
        .select('*')
        .eq('country_code', countryCode)
        .order('name');

      if (!error && data) {
        console.log("Fetched required insurance types:", data);
        setRequiredInsurances(data);
      } else if (error) {
        console.error("Error fetching insurance types:", error);
      }
    }

    fetchInsuranceTypes();
  }, [countryCode]);

  if (!countryCode) {
    console.log("No country code provided");
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[#040480]">Required Insurance Documents</h3>
      <RequiredInsuranceSection insurances={requiredInsurances} errors={errors} register={register} />
    </div>
  );
}