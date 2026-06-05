// TownFaq.tsx - Per-town accordion FAQs.
// Now merges shared price-guide FAQs (insurance, fixed vs hourly) after the town-specific
// questions so every page has consistent baseline coverage. Visual polish: wider triggers,
// dividers, brand-slate triggers, max-w-3xl single column.
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { TownFaq as TownFaqType } from "@/data/locations";
import { sharedFaqs } from "@/data/shared-faqs";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { MotionSection } from "./MotionSection";

interface TownFaqProps {
  townName: string;
  faqs: TownFaqType[];
}

export function TownFaq({ townName, faqs }: TownFaqProps) {
  const merged = [...faqs, ...sharedFaqs(townName)];
  return (
    <Section>
      <div className="max-w-3xl mx-auto">
        <MotionSection>
          <SectionHeading
            eyebrow="Questions answered"
            title={`FAQs for moves in ${townName}`}
          />
        </MotionSection>
        <MotionSection delay={0.05}>
          <Accordion type="single" collapsible className="w-full rounded-2xl border bg-white divide-y">
            {merged.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b-0 px-5">
                <AccordionTrigger className="text-left font-montserrat text-brand-slate text-base md:text-lg py-5 hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 font-roboto leading-relaxed pb-5">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </MotionSection>
      </div>
    </Section>
  );
}
