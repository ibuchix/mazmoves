import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { CompanyDetailsSection } from "./form/CompanyDetailsSection";
import { ContactDetailsSection } from "./form/ContactDetailsSection";
import { AddressSection } from "./form/AddressSection";
import { Separator } from "@/components/ui/separator";
import { RegistrationSuccessDialog } from "./RegistrationSuccessDialog";
import { useCompanyRegistration } from "@/hooks/company/use-company-registration";
import { CompanyRegistrationForm } from "@/types/company";
import { toast } from "sonner";
import { RegistrationAlert } from "./form/registration/RegistrationAlert";
import { RegistrationSubmitButton } from "./form/registration/RegistrationSubmitButton";

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

  const onSubmit = async (data: CompanyRegistrationForm) => {
    if (rateLimitExceeded) {
      toast.error("Rate Limit Exceeded", {
        description: "Please wait a few minutes before trying again."
      });
      return;
    }

    await handleRegistration(data);
  };

  return (
    <>
      <Card className="p-8 space-y-8 shadow-lg bg-white/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <RegistrationAlert error={error} />

          <div className="space-y-8">
            <CompanyDetailsSection 
              register={register} 
              errors={errors} 
              watch={watch}
            />
            <Separator className="my-8" />
            <ContactDetailsSection register={register} errors={errors} getValues={getValues} />
            <Separator className="my-8" />
            <AddressSection register={register} errors={errors} />
          </div>

          <div className="pt-4">
            <RegistrationSubmitButton 
              uploading={uploading}
              rateLimitExceeded={rateLimitExceeded}
            />
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