import { EmailSection } from "./contact/EmailSection";
import { PasswordSection } from "./contact/PasswordSection";
import { ContactInfoSection } from "./contact/ContactInfoSection";

interface ContactDetailsSectionProps {
  register: any;
  errors: any;
  getValues: any;
}

export function ContactDetailsSection({ register, errors, getValues }: ContactDetailsSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[#040480]">Contact Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EmailSection register={register} errors={errors} getValues={getValues} />
        <PasswordSection register={register} errors={errors} getValues={getValues} />
        <ContactInfoSection register={register} errors={errors} />
      </div>
    </div>
  );
}