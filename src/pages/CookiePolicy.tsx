// CookiePolicy.tsx - Dedicated Cookie Policy page.
// Updated: clearly identifies the business as Housemove (Housemove NB Ltd).

import { Card } from "@/components/ui/card";
import { SeoHead } from "@/components/seo/SeoHead";

export default function CookiePolicy() {
  return (
    <div className="bg-background">
      <SeoHead
        title="Cookie Policy — Housemove"
        description="How Housemove (Housemove NB Ltd) uses cookies and similar technologies on housemove.co."
        path="/cookie-policy"
        type="article"
      />
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <header className="mb-10 text-left">
          <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-brand-slate mb-3">
            Cookie Policy
          </h1>
          <p className="font-roboto text-brand-slateLight">
            How Housemove uses cookies and similar technologies.
          </p>
          <p className="font-roboto text-sm text-brand-slateLight mt-2">
            Last updated: June 2026
          </p>
        </header>

        <Card className="p-8 md:p-10 space-y-8 border border-brand-slate/15 shadow-sm font-roboto text-brand-slate leading-relaxed text-left">
          <section className="space-y-3">
            <h2 className="font-montserrat font-semibold text-2xl text-brand-slate">
              1. Who we are
            </h2>
            <p>
              This website is operated by <strong>Housemove NB Ltd</strong>, trading as <strong>Housemove</strong>. In this Cookie Policy, "Housemove", "we", "us" or "our" refers to Housemove NB Ltd.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat font-semibold text-2xl text-brand-slate">
              2. What are cookies?
            </h2>
            <p>
              Cookies are small text files that are stored on your device when you visit a website. They help the site remember your preferences, understand how you use the site, and enable features such as analytics and personalised marketing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat font-semibold text-2xl text-brand-slate">
              3. How we use cookies
            </h2>
            <p>
              Housemove uses cookies for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Necessary cookies:</strong> essential for the website to function and cannot be disabled. They enable core features such as remembering your cookie preferences and keeping your session secure.
              </li>
              <li>
                <strong>Analytics cookies:</strong> help us understand how visitors interact with the website, so we can improve our service.
              </li>
              <li>
                <strong>Marketing cookies:</strong> used to deliver relevant content and measure the effectiveness of our advertising campaigns.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat font-semibold text-2xl text-brand-slate">
              4. Managing your cookie preferences
            </h2>
            <p>
              You can change your cookie preferences at any time by clicking the cookie settings link in the footer or by clearing your browser cookies and refreshing the page. When you first visit housemove.co, you can choose to accept all cookies, only necessary cookies, or customise your preferences.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat font-semibold text-2xl text-brand-slate">
              5. Changes to this policy
            </h2>
            <p>
              We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated "Last updated" date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat font-semibold text-2xl text-brand-slate">
              6. Contact us
            </h2>
            <p>
              If you have any questions about our use of cookies, please contact us at{" "}
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
