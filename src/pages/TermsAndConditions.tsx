// TermsAndConditions.tsx - Dedicated, official Terms & Conditions page.
// Updated contact email to help@housemove.co; phone removed; address omitted.

import { Card } from "@/components/ui/card";
import { SeoHead } from "@/components/seo/SeoHead";

export default function TermsAndConditions() {
  return (
    <div className="bg-background">
      <SeoHead
        title="Terms & Conditions — HouseMove"
        description="The rules that govern your use of the HouseMove platform for booking professional UK moving services."
        path="/terms-and-conditions"
        type="article"
      />
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <header className="mb-10 text-left">
          <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-brand-slate mb-3">
            Terms &amp; Conditions
          </h1>
          <p className="font-roboto text-brand-slateMuted">
            The rules that govern your use of the HouseMove platform.
          </p>
          <p className="font-roboto text-sm text-brand-slateMuted mt-2">
            Last updated: May 2026
          </p>
        </header>

        <Card className="p-8 md:p-10 space-y-8 border border-brand-slate/15 shadow-sm font-roboto text-brand-slate leading-relaxed text-left">
          <section className="space-y-3">
            <h2 className="font-montserrat font-semibold text-2xl text-brand-slate">
              1. Introduction
            </h2>
            <p>
              These terms govern your use of HouseMove ("we", "us", "our"). By
              submitting a move request or otherwise using the service, you
              agree to these terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat font-semibold text-2xl text-brand-slate">
              2. Our Service
            </h2>
            <p>
              HouseMove is a free service for movers. We connect you with
              vetted moving companies who can quote for your move. We are not
              the moving company and do not perform the move ourselves.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat font-semibold text-2xl text-brand-slate">
              3. Quotes &amp; Bookings
            </h2>
            <p>
              Any quote, booking, contract or payment for the move itself is
              made directly between you and the chosen moving company. Their
              terms, pricing and cancellation policy apply to that booking.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat font-semibold text-2xl text-brand-slate">
              4. Your Responsibilities
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide accurate move details.</li>
              <li>Use the service for lawful purposes only.</li>
              <li>Communicate respectfully with partner companies.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat font-semibold text-2xl text-brand-slate">
              5. Liability
            </h2>
            <p>
              To the maximum extent permitted by law, HouseMove is not liable
              for the conduct, performance, or pricing of any moving company
              you engage through the platform. Nothing in these terms limits
              liability that cannot lawfully be limited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat font-semibold text-2xl text-brand-slate">
              6. Changes to These Terms
            </h2>
            <p>
              We may update these terms from time to time. The "Last updated"
              date above shows when the latest version took effect.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat font-semibold text-2xl text-brand-slate">
              7. Contact
            </h2>
            <p>
              Questions about these terms? Email{" "}
              <a
                href="mailto:help@housemove.co"
                className="text-brand-orange hover:underline"
              >
                help@housemove.co
              </a>
              .
            </p>
          </section>
        </Card>
      </section>
    </div>
  );
}
