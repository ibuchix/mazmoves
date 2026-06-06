// EstimateResult.tsx
// Displays the signed price range returned by /calculate-move-estimate
// with an expandable breakdown and a Book CTA that opens the booking
// dialog. Uses brand tokens (slate, green, orange) and the rounded
// "premium card" treatment used across the site.
//
// Updated: handles the bespoke-quote response (no low/high) by rendering
// a "tailored quote" variant with a clear Book CTA. Copy now says
// "miles by road" and avoids em-dashes.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle, ShieldCheck, RotateCcw } from "lucide-react";
import type { EstimateResponse } from "@/hooks/use-calculate-estimate";

interface Props {
  estimate: EstimateResponse;
  onBook: () => void;
  onRecalculate: () => void;
}

const gbp = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);

export function EstimateResult({ estimate, onBook, onRecalculate }: Props) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const hasPrice = typeof estimate.low === "number" && typeof estimate.high === "number";

  return (
    <div className="rounded-2xl bg-white border border-brand-slateLight/30 shadow-xl overflow-hidden">
      <div className="bg-gradient-to-br from-brand-slate via-brand-slateLight to-brand-slate text-white p-5 sm:p-8 text-center">
        {hasPrice ? (
          <>
            <p className="text-xs sm:text-sm uppercase tracking-wider text-white/80 font-roboto">
              Your estimated total
            </p>
            <p className="text-3xl sm:text-4xl md:text-5xl font-bold font-montserrat mt-2 break-words">
              {gbp(estimate.low!)} <span className="text-white/60">to</span>{" "}
              {gbp(estimate.high!)}
            </p>
            {typeof estimate.distanceMiles === "number" && (
              <p className="text-sm text-white/80 font-roboto mt-3 max-w-md mx-auto">
                Approximately {estimate.distanceMiles} miles by road. Final price confirmed by
                your matched mover.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-sm uppercase tracking-wider text-white/80 font-roboto">
              Tailored quote
            </p>
            <p className="text-2xl md:text-3xl font-bold font-montserrat mt-2 leading-snug">
              We'll prepare a bespoke quote for this move
            </p>
            <p className="text-sm text-white/80 font-roboto mt-3 max-w-md mx-auto">
              {estimate.message ?? "Submit your details and a specialist will follow up shortly."}
            </p>
          </>
        )}
      </div>

      <div className="p-5 sm:p-6 md:p-8 space-y-5">
        {hasPrice && estimate.breakdown && estimate.breakdown.surcharges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {estimate.breakdown.surcharges.map((s) => (
              <Badge
                key={s.label}
                className="bg-brand-orange/10 text-brand-orange border border-brand-orange/30"
              >
                {s.label} +{Math.round(s.pct * 100)}%
              </Badge>
            ))}
          </div>
        )}

        {hasPrice && estimate.requiresCustomQuote && (
          <div className="rounded-lg border border-brand-orange/30 bg-brand-orange/5 p-4 text-sm font-roboto text-brand-slate">
            This international move is long-distance. Submit the booking and a
            specialist will follow up with a bespoke quote within 24 hours.
          </div>
        )}

        {hasPrice && estimate.breakdown && (
          <Accordion type="single" collapsible value={showBreakdown ? "b" : ""} onValueChange={(v) => setShowBreakdown(v === "b")}>
            <AccordionItem value="b" className="border-brand-slateLight/30">
              <AccordionTrigger className="font-montserrat text-brand-slate hover:no-underline">
                How we calculated this
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm font-roboto text-brand-slate">
                  <li className="flex justify-between">
                    <span>Base (property size)</span>
                    <span className="font-semibold">{gbp(estimate.breakdown.base)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Distance ({estimate.distanceMiles} mi by road)</span>
                    <span className="font-semibold">{gbp(estimate.breakdown.distanceCost)}</span>
                  </li>
                  {estimate.breakdown.typeMultiplier !== 1 && (
                    <li className="flex justify-between">
                      <span>Move-type multiplier</span>
                      <span className="font-semibold">x{estimate.breakdown.typeMultiplier}</span>
                    </li>
                  )}
                  {estimate.breakdown.surcharges.map((s) => (
                    <li key={s.label} className="flex justify-between">
                      <span>{s.label}</span>
                      <span className="font-semibold">+{Math.round(s.pct * 100)}%</span>
                    </li>
                  ))}
                  <li className="pt-2 mt-2 border-t border-brand-slateLight/30 text-xs text-brand-slateLight">
                    The range shown is the central total +/- 8%, rounded to the
                    nearest £10. Local availability, access difficulty and
                    packing services may move the final price within or just
                    beyond this band.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        <div className="grid sm:grid-cols-2 gap-3 pt-2">
          <Button
            onClick={onBook}
            className="w-full bg-brand-orange hover:bg-brand-green text-white font-montserrat font-semibold py-5 sm:py-6 text-sm sm:text-base shadow-lg transition-all whitespace-normal h-auto min-h-[3rem]"
          >
            <CheckCircle className="w-5 h-5 mr-2 shrink-0" />
            <span className="truncate">{hasPrice ? "Book this move" : "Request bespoke quote"}</span>
          </Button>
          <Button
            variant="outline"
            onClick={onRecalculate}
            className="w-full border-brand-slate text-brand-slate hover:bg-brand-slate hover:text-white font-montserrat py-5 sm:py-6 text-sm sm:text-base whitespace-normal h-auto min-h-[3rem]"
          >
            <RotateCcw className="w-4 h-4 mr-2 shrink-0" />
            Recalculate
          </Button>
        </div>


        {hasPrice && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-brand-green font-roboto font-medium pt-1">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Price locked for 30 minutes. Free, no obligation.</span>
          </div>
        )}
      </div>
    </div>
  );
}
