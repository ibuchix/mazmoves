import { RegisterCompanyForm } from "@/components/company/RegisterCompanyForm";

export default function RegisterCompany() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#040480] mb-8">Register Your Moving Company</h1>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <RegisterCompanyForm />
        </div>
      </div>
    </div>
  );
}