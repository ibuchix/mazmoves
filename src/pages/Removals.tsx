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
        title="Removals Across the East of England & Home Counties | HouseMove"
        description="Compare free, no-obligation removal quotes from verified movers across 34 towns in the East of England and Home Counties, including Cambridge, Norwich, Milton Keynes and Southend. All movers carry public liability and goods-in-transit insurance."
        path="/removals"
        type="website"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <section className="bg-gradient-to-br from-brand-slate via-brand-slateLight to-brand-slate text-white px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-5xl mx-auto text-center">
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
