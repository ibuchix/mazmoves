// PriceExplainer.tsx - Town-specific pricing explainer with worked example.
// Polished with a shared Section wrapper, SectionHeading eyebrow, PoundSterling icon
// on the worked-example card, softer shadow, and an optional appended accessNote
// sentence that gives every town at least one bespoke pricing line.
import { Card } from "@/components/ui/card";
import { PoundSterling, Info } from "lucide-react";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { MotionSection } from "./MotionSection";

interface PriceExplainerProps {
  townName: string;
  workedExample: string;
  pricingNote: string;
  accessNote?: string;
}

export function PriceExplainer({
  townName,
  workedExample,
  pricingNote,
  accessNote,
}: PriceExplainerProps) {
  return (
    <Section>
      <MotionSection>
        <SectionHeading
          eyebrow="Pricing guide"
          title={`What does a move from ${townName} cost?`}
          lede="There's no single 'removal price'. Final cost depends on five things: the size of what needs to move, item intricacy (pianos, antiques, gym equipment, safes), total mileage, access difficulty at both properties (parking, stairs, lifts), and whether you move midweek or weekend."
        />
      </MotionSection>
      <MotionSection delay={0.05}>
        <Card className="p-6 md:p-7 border-l-4 border-l-brand-green bg-brand-green/5 shadow-sm rounded-2xl">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-green/15 flex items-center justify-center shrink-0">
              <PoundSterling className="w-5 h-5 text-brand-green" />
            </div>
            <div>
              <p className="font-semibold text-brand-slate font-montserrat mb-2">
                Worked example for {townName}
              </p>
              <p className="text-gray-700 font-roboto leading-relaxed">{workedExample}</p>
              {accessNote && (
                <p className="text-gray-700 font-roboto leading-relaxed mt-3">
                  <span className="font-semibold text-brand-slate">Local access tip: </span>
                  {accessNote}
                </p>
              )}
            </div>
          </div>
        </Card>
      </MotionSection>
      <MotionSection delay={0.1}>
        <div className="mt-5 flex items-start gap-2 text-sm text-gray-600 font-roboto italic">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{pricingNote}</span>
        </div>
      </MotionSection>
    </Section>
  );
}
