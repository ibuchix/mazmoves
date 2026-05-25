// NearbyTowns.tsx - Internal-link block to nearby towns + hub page.
import { Link } from "react-router-dom";
import { getLocationBySlug } from "@/data/locations";
import { ArrowRight } from "lucide-react";

interface NearbyTownsProps {
  nearbySlugs: string[];
}

export function NearbyTowns({ nearbySlugs }: NearbyTownsProps) {
  const items = nearbySlugs.map(getLocationBySlug).filter((x): x is NonNullable<typeof x> => !!x);
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-brand-slate font-montserrat mb-4">
          Nearby areas we cover
        </h2>
        <div className="flex flex-wrap gap-3 mb-6">
          {items.map((loc) => (
            <Link
              key={loc.slug}
              to={`/removals/${loc.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-slate text-brand-slate hover:bg-brand-slate hover:text-white transition-colors font-roboto"
            >
              {loc.name}
              <ArrowRight className="w-4 h-4" />
            </Link>
          ))}
        </div>
        <Link
          to="/removals"
          className="text-brand-slate hover:text-brand-green underline font-roboto"
        >
          See all locations we cover →
        </Link>
      </div>
    </section>
  );
}
