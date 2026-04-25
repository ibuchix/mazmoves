// Privacy policy page. Removed authenticated data-deletion request flow
// since the platform no longer has user accounts. Visitors can email us instead.
import { Card } from "@/components/ui/card";

export default function PrivacyPolicy() {

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-[#040480] mb-6">Privacy Policy & Data Processing Agreement</h1>
      
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
          <h2 className="text-2xl font-semibold text-[#1f3dd2]">2. Legal Basis for Processing (GDPR)</h2>
          <p className="text-gray-700 leading-relaxed">
            We process your data under the following legal bases:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Contract fulfillment - to provide our moving services</li>
            <li>Legal obligation - to comply with legal requirements</li>
            <li>Legitimate interests - to improve our services</li>
            <li>Consent - for marketing communications</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#1f3dd2]">3. Your Data Rights</h2>
          <p className="text-gray-700 leading-relaxed">
            Under GDPR, you have the following rights:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Right to access your personal data</li>
            <li>Right to rectification of inaccurate data</li>
            <li>Right to erasure ("right to be forgotten")</li>
            <li>Right to restrict processing</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#1f3dd2]">4. Data Processing Agreement</h2>
          <p className="text-gray-700 leading-relaxed">
            This section constitutes our data processing agreement:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>We process data only on documented instructions</li>
            <li>We ensure confidentiality of processing</li>
            <li>We implement appropriate security measures</li>
            <li>We assist with data subject rights requests</li>
            <li>We delete or return data at end of service</li>
            <li>We provide information to demonstrate compliance</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#1f3dd2]">5. Data Retention</h2>
          <p className="text-gray-700 leading-relaxed">
            We retain your data for as long as necessary to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Provide our services to you</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes</li>
            <li>Enforce our agreements</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#1f3dd2]">6. Data Deletion Request</h2>
          <p className="text-gray-700 leading-relaxed">
            You can request deletion of your personal data at any time:
          </p>
          <div className="mt-4">
            <Button 
              onClick={handleDataDeletionRequest}
              disabled={isSubmittingRequest}
              className="bg-[#040480] hover:bg-[#1f3dd2]"
            >
              {isSubmittingRequest ? "Submitting..." : "Request Data Deletion"}
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Note: Some data may be retained if required by law or legitimate business purposes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#1f3dd2]">7. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            For any privacy-related queries or to exercise your data rights:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">Email: ask@housemove.com</p>
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