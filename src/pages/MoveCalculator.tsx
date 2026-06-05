// MoveCalculator.tsx — /move-calculator
// Dedicated page that walks a customer through a five-step wizard,
// produces an HMAC-signed price range from the calculate-move-estimate
// edge function, and lets them convert the estimate into a real
// move_request by clicking "Book this move". Mirrors the visual
// language of the home/removals pages (slate rounded hero, brand
// orange/green CTAs, montserrat headings).

import { useState } from "react";
import { SeoHead } from "@/components/seo/SeoHead";
import { CalculatorWizard } from "@/components/move-calculator/CalculatorWizard";
import { EstimateResult } from "@/components/move-calculator/EstimateResult";
import { BookEstimateDialog } from "@/components/move-calculator/BookEstimateDialog";
import type { EstimateResponse } from "@/hooks/use-calculate-estimate";
import type { MoveType, PropertySize, MoveRequestForm } from "@/types/move-request";
import { Calculator, MapPin, ShieldCheck, Sparkles } from "lucide-react";

interface CapturedInputs {
  moveType: MoveType;
  propertySize: PropertySize;
  pickupAddress: MoveRequestForm["pickupAddress"];
  deliveryAddress: MoveRequestForm["deliveryAddress"];
  pickupCoords: { latitude: number; longitude: number };
  deliveryCoords: { latitude: number; longitude: number };
  moveDate: string;
}

export default function MoveCalculator() {
  const [estimate, setEstimate] = useState<EstimateResponse | null>(null);
  const [inputs, setInputs] = useState<CapturedInputs | null>(null);
  const [bookOpen, setBookOpen] = useState(false);

  const handleEstimate = (e: EstimateResponse, i: CapturedInputs) => {
    setEstimate(e);
    setInputs(i);
    // Scroll to result on small screens
    setTimeout(() => {
      document.getElementById("estimate-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <div className="flex-1">
      <SeoHead
        title="Move Cost Calculator | Free UK Removals Estimate | HouseMove"
        description="Get a free, instant estimated price range for your house or commercial move anywhere in the UK. Distance, date and surcharges included. No signup required."
        path="/move-calculator"
        type="website"
      />

      {/* Hero — two-column layout: copy on the left, calculator wizard on the right,
          inside the same rounded slate inset used on Home / Removals. */}
      <section className="relative px-2 sm:px-6 lg:px-8 pt-4 md:pt-12 pb-8 md:pb-16">
        <div className="absolute inset-x-2 sm:inset-x-6 lg:inset-x-8 inset-y-0 md:top-12 md:bottom-16 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-brand-slate via-brand-slateLight to-brand-slate shadow-2xl">
          <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')] bg-center" />
          <div className="absolute inset-0 bg-black/5" />
        </div>
        <div className="relative w-full max-w-7xl mx-auto px-3 sm:px-8 lg:px-8 py-8 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
            {/* Copy — left on desktop, top on mobile */}
            <div className="text-white order-1 animate-fade-in min-w-0 md:pt-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs font-roboto mb-5">
                <Sparkles className="w-3.5 h-3.5 text-brand-green" />
                <span>Free • Instant • No signup</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-montserrat mb-4 leading-tight">
                Estimate your move in 60 seconds
              </h1>
              <p className="text-base md:text-lg text-white/90 font-roboto max-w-xl">
                Tell us a few details and we'll show you a transparent price range
                based on distance, property size and your moving date — then book
                it with verified local movers in one click.
              </p>
            </div>

            {/* Wizard — right on desktop, below copy on mobile */}
            <div className="order-2 animate-fade-in [animation-delay:150ms] min-w-0">
              <CalculatorWizard onEstimate={handleEstimate} />
            </div>
          </div>
        </div>
      </section>

      {/* Result */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {estimate && inputs && (
          <div id="estimate-result" className="mt-2">
            <EstimateResult
              estimate={estimate}
              onBook={() => setBookOpen(true)}
              onRecalculate={() => {
                setEstimate(null);
                setInputs(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        )}
      </section>

      {/* Trust + how-it-works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Calculator,
              title: "How we calculate",
              body: "Our pricing model blends UK market benchmarks with distance, property size, move type and date-based surcharges to give a realistic range.",
            },
            {
              icon: MapPin,
              title: "Distance, done right",
              body: "We use verified geocoding on both addresses to measure the exact straight-line distance, so the quote reflects your real route.",
            },
            {
              icon: ShieldCheck,
              title: "What happens next",
              body: "Book at the estimate, and your details go straight to vetted local movers. They respond within 2 hours — usually faster.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl bg-white p-6 border border-brand-slateLight/20 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-11 h-11 rounded-xl bg-brand-green/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-brand-green" />
              </div>
              <h3 className="font-montserrat font-semibold text-brand-slate mb-2">
                {title}
              </h3>
              <p className="text-sm font-roboto text-brand-slate/80 leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {inputs && estimate && (
        <BookEstimateDialog
          open={bookOpen}
          onOpenChange={setBookOpen}
          moveType={inputs.moveType}
          propertySize={inputs.propertySize}
          pickupAddress={inputs.pickupAddress}
          deliveryAddress={inputs.deliveryAddress}
          pickupCoords={inputs.pickupCoords}
          deliveryCoords={inputs.deliveryCoords}
          moveDate={inputs.moveDate}
          estimateToken={estimate.estimateToken}
          estimateLow={estimate.low}
          estimateHigh={estimate.high}
        />
      )}
    </div>
  );
}
