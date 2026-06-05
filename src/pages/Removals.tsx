// Removals.tsx - Hub page at /removals listing all 34 town landing pages by county.
import { Helmet } from "react-helmet-async";
import { SeoHead } from "@/components/seo/SeoHead";
import { LocationsGrid } from "@/components/locations/LocationsGrid";
import { locations } from "@/data/locations";

const SITE = "https://housemove.co";

export default function Removals() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Removals across the East of England & Home Counties",
    url: `${SITE}/removals`,
    hasPart: locations.map((l) => ({
      "@type": "WebPage",
      name: `Removals in ${l.name}`,
      url: `${SITE}/removals/${l.slug}`,
    })),
  };

  return (
    <div className="flex-1">
      <SeoHead
        title="Removals in East England & Home Counties | HouseMove"
        description="Free quotes from verified removal companies across 34 towns in the East of England and Home Counties. Insured movers, no obligation."
        path="/removals"
        type="website"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <section className="relative px-2 sm:px-6 lg:px-8 pt-4 md:pt-12 pb-8 md:pb-16">
        <div className="absolute inset-x-2 sm:inset-x-6 lg:inset-x-8 inset-y-0 md:top-12 md:bottom-16 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-brand-slate via-brand-slateLight to-brand-slate shadow-2xl">
          <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')] bg-center" />
          <div className="absolute inset-0 bg-black/5" />
        </div>
        <div className="relative max-w-5xl mx-auto text-center text-white px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <h1 className="text-4xl md:text-5xl font-bold font-montserrat mb-4">
            Removals across the East of England & Home Counties
          </h1>
          <p className="text-lg text-white/90 font-roboto max-w-3xl mx-auto">
            HouseMove connects you with verified removal companies in 34 towns across Bedfordshire,
            Buckinghamshire, Cambridgeshire, Essex, Norfolk and Suffolk. Pick your town to see local
            price guidance, common routes, and FAQs, then request free quotes in one place. Every
            mover in our network carries public liability and goods-in-transit insurance, so your
            property is protected throughout the move.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <LocationsGrid />
      </div>
    </div>
  );
}
