import { Card } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-[#040480] mb-6">Privacy Policy</h1>
      
      <Card className="p-6 space-y-6 shadow-lg">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#1f3dd2]">1. Information We Collect</h2>
          <p className="text-gray-700 leading-relaxed">
            We collect information that you provide directly to us, including names, contact
            information, and details about your move.
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Contact information (email, phone, address)</li>
            <li>Move details and preferences</li>
            <li>Payment information</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#1f3dd2]">2. How We Use Your Information</h2>
          <p className="text-gray-700 leading-relaxed">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Provide and improve our services</li>
            <li>Communicate with you about your move</li>
            <li>Process payments and transactions</li>
            <li>Send you marketing communications (with your consent)</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#1f3dd2]">3. Information Sharing</h2>
          <p className="text-gray-700 leading-relaxed">
            We do not sell your personal information. We may share your information with:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Service providers and partners</li>
            <li>Legal authorities when required by law</li>
            <li>Professional advisors and insurers</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#1f3dd2]">4. Your Rights</h2>
          <p className="text-gray-700 leading-relaxed">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Access your personal information</li>
            <li>Request corrections to your data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#1f3dd2]">5. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">Email: ask@mazmoves.com</p>
            <p className="text-gray-700">Phone: +447388449110</p>
            <p className="text-gray-700">Address: 124 City Road, London, EC1V 2NX</p>
          </div>
        </section>

        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Last updated: March 2024
          </p>
        </div>
      </Card>
    </div>
  );
}