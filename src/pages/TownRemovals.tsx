// TownRemovals.tsx - Dynamic per-town landing page at /removals/:slug.
// Reads the town record from src/data/locations.ts; redirects to /removals on unknown slug.
// Emits Service + LocalBusiness + FAQPage + BreadcrumbList JSON-LD.

import { useParams, Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SeoHead } from "@/components/seo/SeoHead";
import { getLocationBySlug } from "@/data/locations";
import { TownHero } from "@/components/locations/TownHero";
import { PriceExplainer } from "@/components/locations/PriceExplainer";
import { CommonRoutes } from "@/components/locations/CommonRoutes";
import { VariantSections } from "@/components/locations/VariantBlocks";
import { TrustPoints } from "@/components/locations/TrustPoints";
import { TownFaq } from "@/components/locations/TownFaq";
import { NearbyTowns } from "@/components/locations/NearbyTowns";
import { ChevronRight } from "lucide-react";

const SITE = "https://housemove.co";

export default function TownRemovals() {
  const { slug } = useParams<{ slug: string }>();
  const loc = slug ? getLocationBySlug(slug) : undefined;

  if (!loc) return <Navigate to="/removals" replace />;

  const title =
    loc.titleVariant === "manAndVan"
      ? `Man and Van in ${loc.name} | Free Quotes | HouseMove`
      : `Removals in ${loc.name} | Free Quotes | HouseMove`;

  const path = `/removals/${loc.slug}`;
  const url = `${SITE}${path}`;

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
      mainEntity: loc.faqs.map((f) => ({
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
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 text-sm font-roboto text-gray-600"
      >
        <ol className="flex items-center gap-1 flex-wrap">
          <li>
            <Link to="/" className="hover:text-brand-slate">Home</Link>
          </li>
          <ChevronRight className="w-3 h-3" />
          <li>
            <Link to="/removals" className="hover:text-brand-slate">Removals</Link>
          </li>
          <ChevronRight className="w-3 h-3" />
          <li className="text-brand-slate font-medium">{loc.name}</li>
        </ol>
      </nav>

      <TownHero townName={loc.name} county={loc.county} trustWord={loc.trustWord} />

      {/* Intro */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 font-roboto leading-relaxed">{loc.intro}</p>
        </div>
      </section>

      <PriceExplainer
        townName={loc.name}
        workedExample={loc.workedExample}
        pricingNote={loc.pricingNote}
      />

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
