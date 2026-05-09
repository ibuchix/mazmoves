// Contact.tsx - Official contact page. Phone removed and address left blank
// (in progress). Email updated to help@housemove.co.

import { Mail, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Contact() {
  return (
    <div className="bg-background">
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
