// PriceExplainer.tsx - Town-specific pricing explainer with worked example.
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

interface PriceExplainerProps {
  townName: string;
  workedExample: string;
  pricingNote: string;
}

export function PriceExplainer({ townName, workedExample, pricingNote }: PriceExplainerProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-brand-slate font-montserrat mb-4">
          What does a move from {townName} cost?
        </h2>
        <p className="text-gray-700 font-roboto mb-6 max-w-3xl">
          There is no single "removal price". Final cost depends on five things: the size of what
          needs to move, the intricacy of individual items (pianos, antiques, gym equipment, safes),
          total mileage, access difficulty at both properties (parking, stairs, lifts), and whether
          you move midweek or weekend.
        </p>
        <Card className="p-6 border-l-4 border-l-brand-green bg-brand-green/5">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-brand-green shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-brand-slate font-montserrat mb-1">
                Worked example for {townName}
              </p>
              <p className="text-gray-700 font-roboto">{workedExample}</p>
            </div>
          </div>
        </Card>
        <p className="text-sm text-gray-600 font-roboto mt-4 italic">{pricingNote}</p>
      </div>
    </section>
  );
}
