// TownRemovals.tsx - Dynamic per-town landing page at /removals/:slug.
// Reads the town record from src/data/locations.ts; redirects to /removals on unknown slug.
// Emits Service + LocalBusiness + FAQPage + BreadcrumbList JSON-LD.
// Polish pass:
//  - Wrapped intro in shared Section with a small brand-green accent bar.
//  - Inserted WhatAffectsYourQuote between PriceExplainer and CommonRoutes,
//    weaving the Removals Price Guide tidbits into every page.
//  - Passes per-town accessNote / surveyTip (from src/data/town-extras.ts) so each
//    page has at least one bespoke pricing line and one bespoke survey line.
//  - Lighter breadcrumbs with more breathing room.

import { useParams, Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SeoHead } from "@/components/seo/SeoHead";
import { getLocationBySlug } from "@/data/locations";
import { getTownExtras } from "@/data/town-extras";
import { sharedFaqs } from "@/data/shared-faqs";
import { TownHero } from "@/components/locations/TownHero";
import { PriceExplainer } from "@/components/locations/PriceExplainer";
import { CommonRoutes } from "@/components/locations/CommonRoutes";
import { VariantSections } from "@/components/locations/VariantBlocks";
import { TrustPoints } from "@/components/locations/TrustPoints";
import { TownFaq } from "@/components/locations/TownFaq";
import { NearbyTowns } from "@/components/locations/NearbyTowns";
import { WhatAffectsYourQuote } from "@/components/locations/WhatAffectsYourQuote";
import { Section } from "@/components/locations/Section";
import { MotionSection } from "@/components/locations/MotionSection";
import { ChevronRight } from "lucide-react";

const SITE = "https://housemove.co";

export default function TownRemovals() {
  const { slug } = useParams<{ slug: string }>();
  const loc = slug ? getLocationBySlug(slug) : undefined;

  if (!loc) return <Navigate to="/removals" replace />;

  const extras = getTownExtras(loc.slug);

  const title =
    loc.titleVariant === "manAndVan"
      ? `Man and Van in ${loc.name} | Free Quotes | HouseMove`
      : `Removals in ${loc.name} | Free Quotes | HouseMove`;

  const path = `/removals/${loc.slug}`;
  const url = `${SITE}${path}`;

  // FAQ JSON-LD should mirror the merged FAQs we actually render
  const mergedFaqs = [...loc.faqs, ...sharedFaqs(loc.name)];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "House removals and man-and-van services",
      areaServed: { "@type": "City", name: loc.name, addressRegion: loc.county, addressCountry: "GB" },
      provider: { "@type": "Organization", name: "HouseMove", url: SITE },
      url,
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: `HouseMove, Removals in ${loc.name}`,
      url,
      areaServed: { "@type": "City", name: loc.name, addressRegion: loc.county },
      priceRange: "££",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: mergedFaqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "Removals", item: SITE + "/removals" },
        { "@type": "ListItem", position: 3, name: loc.name, item: url },
      ],
    },
  ];

  return (
    <div className="flex-1">
      <SeoHead title={title} description={loc.metaDescription} path={path} type="website" />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-1 text-sm font-roboto text-gray-500"
      >
        <ol className="flex items-center gap-1.5 flex-wrap">
          <li>
            <Link to="/" className="hover:text-brand-slate transition-colors">Home</Link>
          </li>
          <ChevronRight className="w-3 h-3" />
          <li>
            <Link to="/removals" className="hover:text-brand-slate transition-colors">Removals</Link>
          </li>
          <ChevronRight className="w-3 h-3" />
          <li className="text-brand-slate font-medium">{loc.name}</li>
        </ol>
      </nav>

      <TownHero townName={loc.name} county={loc.county} trustWord={loc.trustWord} />

      {/* Intro */}
      <Section innerClassName="max-w-4xl">
        <MotionSection>
          <div className="border-l-4 border-brand-green pl-5">
            <p className="text-lg text-gray-700 font-roboto leading-relaxed">{loc.intro}</p>
          </div>
        </MotionSection>
      </Section>

      <PriceExplainer
        townName={loc.name}
        workedExample={loc.workedExample}
        pricingNote={loc.pricingNote}
        accessNote={extras?.accessNote}
      />

      <WhatAffectsYourQuote townName={loc.name} surveyTip={extras?.surveyTip} />

      <CommonRoutes townName={loc.name} routes={loc.commonRoutes} />

      <VariantSections
        townName={loc.name}
        sections={loc.sections}
        variantCopy={loc.variantCopy}
      />

      <TrustPoints townName={loc.name} points={loc.trustPoints} />

      <TownFaq townName={loc.name} faqs={loc.faqs} />

      <NearbyTowns nearbySlugs={loc.nearby} />
    </div>
  );
}
