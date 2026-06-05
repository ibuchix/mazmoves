// NearbyTowns.tsx - Internal-link block to nearby towns + hub page.
// Polished to a uniform card grid with arrow that slides on hover, equal heights,
// and consistent section rhythm via the shared Section wrapper.
import { Link } from "react-router-dom";
import { getLocationBySlug } from "@/data/locations";
import { ArrowRight, MapPin } from "lucide-react";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { MotionSection } from "./MotionSection";

interface NearbyTownsProps {
  nearbySlugs: string[];
}

export function NearbyTowns({ nearbySlugs }: NearbyTownsProps) {
  const items = nearbySlugs.map(getLocationBySlug).filter((x): x is NonNullable<typeof x> => !!x);
  if (items.length === 0) return null;
  return (
    <Section tone="muted">
      <MotionSection>
        <SectionHeading eyebrow="Also nearby" title="Nearby areas we cover" />
      </MotionSection>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((loc, i) => (
          <MotionSection key={loc.slug} delay={i * 0.03}>
            <Link
              to={`/removals/${loc.slug}`}
              className="group flex items-center justify-between gap-3 px-5 py-4 rounded-xl border border-gray-200 bg-white text-brand-slate hover:border-brand-green hover:shadow-sm transition-all h-full"
            >
              <span className="flex items-center gap-2 font-roboto font-medium">
                <MapPin className="w-4 h-4 text-brand-green shrink-0" />
                {loc.name}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-green group-hover:translate-x-0.5 transition-all" />
            </Link>
          </MotionSection>
        ))}
      </div>
      <div className="mt-8">
        <Link
          to="/removals"
          className="inline-flex items-center gap-1 text-brand-slate hover:text-brand-green font-roboto font-medium"
        >
          See all locations we cover
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </Section>
  );
}
