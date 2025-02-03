import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CompanyDetailsSection } from "./form/CompanyDetailsSection";
import { ContactDetailsSection } from "./form/ContactDetailsSection";
import { AddressSection } from "./form/AddressSection";
import { Separator } from "@/components/ui/separator";
import { RegistrationSuccessDialog } from "./RegistrationSuccessDialog";
import { useCompanyRegistration } from "@/hooks/company/use-company-registration";
import { CompanyRegistrationForm } from "@/types/company";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function RegisterCompanyForm() {
  const { register, handleSubmit, watch, getValues, formState: { errors } } = useForm<CompanyRegistrationForm>();
  const { 
    uploading, 
    showSuccessDialog, 
    setShowSuccessDialog, 
    handleRegistration, 
    error, 
    rateLimitExceeded 
  } = useCompanyRegistration();
  const [selectedCountry, setSelectedCountry] = useState<{code: string, name: string}>();
  const { toast } = useToast();
  
  // Watch for country changes
  const countryValue = watch('country');
  
  // Update selected country when the country field changes
  useEffect(() => {
    if (countryValue) {
      try {
        const countryData = JSON.parse(countryValue);
        setSelectedCountry(countryData);
      } catch (e) {
        console.error('Error parsing country data:', e);
      }
    }
  }, [countryValue]);

  const onSubmit = async (data: CompanyRegistrationForm) => {
    if (rateLimitExceeded) {
      toast({
        variant: "destructive",
        title: "Rate Limit Exceeded",
        description: "Please wait a few minutes before trying again."
      });
      return;
    }

    if (selectedCountry) {
      data.country_code = selectedCountry.code;
      data.country_name = selectedCountry.name;
    }
    await handleRegistration(data);
  };

  return (
    <>
      <Card className="p-8 space-y-8 shadow-lg bg-white/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error === 'duplicate_email' 
                  ? 'This email is already registered. Please use a different email or login to your existing account.'
                  : error === 'country_not_supported'
                  ? 'Registration is not available in your country at this time.'
                  : 'An error occurred during registration. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-8">
            <CompanyDetailsSection register={register} errors={errors} />
            <Separator className="my-8" />
            <ContactDetailsSection register={register} errors={errors} getValues={getValues} />
            <Separator className="my-8" />
            <AddressSection register={register} errors={errors} />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-[#040480] hover:bg-[#1f3dd2] text-white font-semibold py-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative"
              disabled={uploading || rateLimitExceeded}
            >
              {uploading ? (
                <>
                  <span className="animate-pulse">Registering...</span>
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                </>
              ) : rateLimitExceeded ? (
                "Please wait before trying again"
              ) : (
                "Register Company"
              )}
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