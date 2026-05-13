// Contact.tsx - Official contact page. Phone removed and address left blank
// (in progress). Email updated to help@housemove.co.

import { Mail, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Contact() {
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://housemove.co/#localbusiness",
    name: "HouseMove",
    url: "https://housemove.co",
    image: "https://housemove.co/housemove-logo.png",
    email: "help@housemove.co",
    priceRange: "££",
    areaServed: "GB",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "16:00",
      },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "help@housemove.co",
      contactType: "customer support",
      availableLanguage: "en",
    },
  };

  return (
    <div className="bg-background">
      <SeoHead
        title="Contact HouseMove — Email & Support Hours"
        description="Get in touch with HouseMove. Email help@housemove.co, support Mon–Fri 08:00–18:00 and Sat 09:00–16:00."
        path="/contact"
        type="website"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <header className="text-center mb-12">
          <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-brand-slate mb-4">
            Contact Us
          </h1>
          <p className="font-roboto text-lg text-brand-slateMuted max-w-2xl mx-auto">
            We're here to help with your move. Reach out and our team will get
            back to you as soon as possible.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-8 border border-brand-slate/15 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-brand-orange/10 text-brand-orange">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-montserrat font-semibold text-xl text-brand-slate mb-2">
                  Email
                </h2>
                <a
                  href="mailto:help@housemove.co"
                  className="font-roboto text-base text-brand-slate hover:text-brand-orange transition-colors"
                >
                  help@housemove.co
                </a>
                <p className="text-sm text-brand-slateMuted mt-2">
                  Typical reply within one business day.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8 border border-brand-slate/15 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-brand-orange/10 text-brand-orange">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-montserrat font-semibold text-xl text-brand-slate mb-2">
                  Support Hours
                </h2>
                <ul className="font-roboto text-base text-brand-slate space-y-1">
                  <li>Monday – Friday: 8:00 – 18:00</li>
                  <li>Saturday: 9:00 – 16:00</li>
                  <li>Sunday: Closed</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-8 border border-brand-slate/15 shadow-sm md:col-span-2">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-brand-orange/10 text-brand-orange">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-montserrat font-semibold text-xl text-brand-slate mb-2">
                  Office Address
                </h2>
                <p className="font-roboto text-base text-brand-slateMuted italic">
                  Coming soon — our office address will be published here shortly.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
