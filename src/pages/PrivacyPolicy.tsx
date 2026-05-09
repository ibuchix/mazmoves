// PrivacyPolicy.tsx - Dedicated, official Privacy Policy page.
// Updated contact email to help@housemove.co; phone removed; address omitted.

import { Card } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="bg-background">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <header className="mb-10 text-left">
          <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-brand-slate mb-3">
            Privacy Policy
          </h1>
          <p className="font-roboto text-brand-slateMuted">
            How HouseMove collects, uses and protects your personal data.
          </p>
          <p className="font-roboto text-sm text-brand-slateMuted mt-2">
            Last updated: May 2026
          </p>
        </header>

        <Card className="p-8 md:p-10 space-y-8 border border-brand-slate/15 shadow-sm font-roboto text-brand-slate leading-relaxed text-left">
          <section className="space-y-3">
            <h2 className="font-montserrat font-semibold text-2xl text-brand-slate">
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly to us when you submit
              a move request, including your name, email, and details about
              your move (origin, destination, property size, dates).
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Contact information (email)</li>
              <li>Move details and preferences</li>
              <li>Technical data (IP address, device, browser) for security</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat font-semibold text-2xl text-brand-slate">
              2. Legal Basis for Processing (UK GDPR)
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Contract — to match you with moving companies.</li>
              <li>Legitimate interests — to improve and secure our service.</li>
              <li>Legal obligation — to comply with applicable law.</li>
              <li>Consent — for any optional marketing communications.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat font-semibold text-2xl text-brand-slate">
              3. How We Share Your Data
            </h2>
            <p>
              When you submit a move request, your contact and move details are
              shared with vetted moving companies in the relevant area so they
              can prepare a quote for you. We do not sell your data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat font-semibold text-2xl text-brand-slate">
              4. Your Rights
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request erasure ("right to be forgotten")</li>
              <li>Restrict or object to processing</li>
              <li>Data portability</li>
              <li>Lodge a complaint with the ICO</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat font-semibold text-2xl text-brand-slate">
              5. Data Retention
            </h2>
            <p>
              We retain your data only for as long as necessary to provide our
              service, comply with legal obligations, resolve disputes and
              enforce our agreements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat font-semibold text-2xl text-brand-slate">
              6. Data Deletion Requests
            </h2>
            <p>
              You can request deletion of your personal data at any time by
              emailing{" "}
              <a
                href="mailto:help@housemove.co"
                className="text-brand-orange hover:underline"
              >
                help@housemove.co
              </a>
              . Please include the email you used when submitting your move
              request.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat font-semibold text-2xl text-brand-slate">
              7. Contact
            </h2>
            <p>
              For any privacy-related queries, contact us at{" "}
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
