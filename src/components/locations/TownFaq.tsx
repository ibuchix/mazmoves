// TownFaq.tsx - Per-town accordion FAQs (unique questions per page).
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { TownFaq as TownFaqType } from "@/data/locations";

interface TownFaqProps {
  townName: string;
  faqs: TownFaqType[];
}

export function TownFaq({ townName, faqs }: TownFaqProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-brand-slate font-montserrat mb-6">
          FAQs for moves in {townName}
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-montserrat text-brand-slate">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 font-roboto">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
