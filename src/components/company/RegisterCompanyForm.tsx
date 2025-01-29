import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CompanyDetailsSection } from "./form/CompanyDetailsSection";
import { ContactDetailsSection } from "./form/ContactDetailsSection";
import { AddressSection } from "./form/AddressSection";
import { InsuranceSection } from "./form/InsuranceSection";
import { Separator } from "@/components/ui/separator";
import { RegistrationSuccessDialog } from "./RegistrationSuccessDialog";
import { useCompanyRegistration } from "@/hooks/use-company-registration";
import { CompanyRegistrationForm } from "@/types/company";
import { useState, useEffect } from "react";

export function RegisterCompanyForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CompanyRegistrationForm>();
  const { uploading, showSuccessDialog, setShowSuccessDialog, handleRegistration } = useCompanyRegistration();
  const [selectedCountry, setSelectedCountry] = useState<string>();
  
  // Watch for country changes
  const countryValue = watch('country');
  
  // Update selected country when the country field changes
  useEffect(() => {
    if (countryValue) {
      try {
        const countryData = JSON.parse(countryValue);
        setSelectedCountry(countryData.code);
      } catch (e) {
        console.error('Error parsing country data:', e);
      }
    }
  }, [countryValue]);

  return (
    <>
      <Card className="p-8 space-y-8 shadow-lg bg-white/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit(handleRegistration)} className="space-y-8">
          <div className="space-y-8">
            <CompanyDetailsSection register={register} errors={errors} />
            <Separator className="my-8" />
            <ContactDetailsSection register={register} errors={errors} />
            <Separator className="my-8" />
            <AddressSection register={register} errors={errors} />
            <Separator className="my-8" />
            <InsuranceSection errors={errors} countryCode={selectedCountry} />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-[#040480] hover:bg-[#1f3dd2] text-white font-semibold py-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading}
            >
              {uploading ? "Registering..." : "Register Company"}
            </Button>
          </div>
        </form>
      </Card>

      <RegistrationSuccessDialog 
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
      />
    </>
  );
}