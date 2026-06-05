// TrustPoints.tsx - Why-use-HouseMove block on town pages.
// Polished to a 2-column icon-tile grid (ShieldCheck / BadgeCheck / Truck / HeartHandshake / Wallet)
// Rendered as a rounded slate inset card (matching the hero treatment on home/removals pages)
// rather than full-bleed, so it reads as a cohesive panel within the page rhythm.
import { ShieldCheck, BadgeCheck, Truck, HeartHandshake, Wallet, Sparkles } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { MotionSection } from "./MotionSection";

interface TrustPointsProps {
  townName: string;
  points: string[];
}

const ICONS = [ShieldCheck, BadgeCheck, Truck, HeartHandshake, Wallet, Sparkles];

export function TrustPoints({ townName, points }: TrustPointsProps) {
  return (
    <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="relative rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-brand-slate via-brand-slateLight to-brand-slate shadow-2xl">
          <div className="relative px-6 sm:px-10 lg:px-14 py-12 md:py-16">
            <MotionSection>
              <SectionHeading
                eyebrow="Why HouseMove"
                title={`Why use HouseMove for your ${townName} move`}
                tone="dark"
              />
            </MotionSection>
            <ul className="grid md:grid-cols-2 gap-4">
              {points.map((p, i) => {
                const Icon = ICONS[i % ICONS.length];
                return (
                  <MotionSection key={p} delay={i * 0.04}>
                    <li className="flex gap-4 items-start p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors h-full">
                      <div className="w-10 h-10 rounded-xl bg-brand-green/15 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-brand-green" />
                      </div>
                      <span className="font-roboto text-white/90 leading-relaxed">{p}</span>
                    </li>
                  </MotionSection>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
