import { Card } from "@/components/ui/card";

export default function TermsAndConditions() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-[#040480] mb-6">Terms and Conditions</h1>
      
      <Card className="p-6 space-y-6 shadow-lg">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#1f3dd2]">1. Introduction</h2>
          <p className="text-gray-700 leading-relaxed">
            Welcome to MAZ Moves Ltd. These terms and conditions outline the rules and regulations
            for the use of our services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#1f3dd2]">2. Services</h2>
          <p className="text-gray-700 leading-relaxed">
            MAZ Moves Ltd provides moving services including but not limited to residential moves,
            commercial moves, and international relocations.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#1f3dd2]">3. Booking and Payments</h2>
          <p className="text-gray-700 leading-relaxed">
            All bookings are subject to availability and confirmation. Payment terms and
            conditions apply as specified in your moving quote.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#1f3dd2]">4. Liability</h2>
          <p className="text-gray-700 leading-relaxed">
            Our liability is limited as per industry standards and applicable laws. We recommend
            reviewing our insurance options for additional protection.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#1f3dd2]">5. Cancellation Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            Cancellation terms vary depending on the service booked and timing of cancellation.
            Please refer to your booking confirmation for specific details.
          </p>
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