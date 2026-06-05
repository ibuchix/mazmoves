// TrustPoints.tsx - Why-use-HouseMove block on town pages.
// Polished to a 2-column icon-tile grid (ShieldCheck / BadgeCheck / Truck / HeartHandshake / Wallet)
// rendered on the brand-slate background. Copy is unchanged — only the visual treatment.
import { ShieldCheck, BadgeCheck, Truck, HeartHandshake, Wallet, Sparkles } from "lucide-react";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { MotionSection } from "./MotionSection";

interface TrustPointsProps {
  townName: string;
  points: string[];
}

// Rotate icons across tiles so the grid reads as a varied, considered set
// rather than five identical ticks.
const ICONS = [ShieldCheck, BadgeCheck, Truck, HeartHandshake, Wallet, Sparkles];

export function TrustPoints({ townName, points }: TrustPointsProps) {
  return (
    <Section tone="dark">
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
    </Section>
  );
}
