// CommonRoutes.tsx - Town-specific table of common move routes with price bands.
// Polished: shared Section + SectionHeading, rounded-2xl border, zebra rows,
// hover row tint, brand-slate header that reads as "sticky-style".
import type { PriceRoute } from "@/data/locations";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { MotionSection } from "./MotionSection";

interface CommonRoutesProps {
  townName: string;
  routes: PriceRoute[];
}

export function CommonRoutes({ townName, routes }: CommonRoutesProps) {
  return (
    <Section tone="muted">
      <MotionSection>
        <SectionHeading
          eyebrow="Typical routes"
          title={`Common routes from ${townName}`}
          lede="Indicative bands for a small 1-2 bed move. Bigger properties, weekend timing or specialty items will sit above these ranges."
        />
      </MotionSection>
      <MotionSection delay={0.05}>
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-brand-slate text-white font-montserrat">
              <tr>
                <th className="px-5 py-4 text-sm font-semibold">From {townName} to</th>
                <th className="px-5 py-4 text-sm font-semibold">Typical band (1-2 bed)</th>
              </tr>
            </thead>
            <tbody className="font-roboto">
              {routes.map((r, i) => (
                <tr
                  key={r.to}
                  className={`border-t transition-colors hover:bg-brand-green/5 ${
                    i % 2 === 1 ? "bg-gray-50/60" : "bg-white"
                  }`}
                >
                  <td className="px-5 py-4 font-medium text-brand-slate">{r.to}</td>
                  <td className="px-5 py-4 text-gray-800">{r.oneBedBand}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MotionSection>
    </Section>
  );
}
