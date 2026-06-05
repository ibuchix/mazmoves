// VariantBlocks.tsx - Town-context section blocks (coastal, commuter, student,
// historic, rural, city). Rendered only when a town's `sections` array lists them.
// Polished with the shared Section + SectionHeading + MotionSection wrappers,
// rounded-2xl tiles, and an icon-chip treatment that matches WhatAffectsYourQuote.
import { Waves, Train, GraduationCap, Landmark, Trees, Building2 } from "lucide-react";
import type { VariantBlock } from "@/data/locations";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { MotionSection } from "./MotionSection";

const META: Record<VariantBlock, { title: string; icon: typeof Waves }> = {
  coastal: { title: "Coastal access & seafront parking", icon: Waves },
  commuter: { title: "London commuter moves", icon: Train },
  student: { title: "Student & academic moves", icon: GraduationCap },
  historic: { title: "Historic-centre access", icon: Landmark },
  rural: { title: "Rural & long-driveway access", icon: Trees },
  city: { title: "Cross-city & apartment-block moves", icon: Building2 },
};

interface VariantSectionsProps {
  townName: string;
  sections: VariantBlock[];
  variantCopy?: Partial<Record<VariantBlock, string>>;
}

export function VariantSections({ townName, sections, variantCopy }: VariantSectionsProps) {
  const renderable = sections.filter((s) => variantCopy?.[s]);
  if (renderable.length === 0) return null;
  return (
    <Section>
      <MotionSection>
        <SectionHeading
          eyebrow="Local context"
          title={`What to know about moving in ${townName}`}
        />
      </MotionSection>
      <div className="grid md:grid-cols-2 gap-5">
        {renderable.map((s, i) => {
          const m = META[s];
          const Icon = m.icon;
          const body = variantCopy?.[s] as string;
          return (
            <MotionSection key={s} delay={i * 0.05}>
              <div className="h-full p-6 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-slate/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-brand-slate" />
                  </div>
                  <h3 className="text-lg font-semibold text-brand-slate font-montserrat">
                    {m.title}
                  </h3>
                </div>
                <p className="text-gray-700 font-roboto leading-relaxed">{body}</p>
              </div>
            </MotionSection>
          );
        })}
      </div>
    </Section>
  );
}
