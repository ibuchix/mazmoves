// WhatAffectsYourQuote.tsx - Shared section distilling the Removals Price Guide into four
// short tiles (BAR vs Man & Van, fixed vs hourly, free survey, packing options).
// Town name is interpolated throughout, and a town-specific surveyTip (from town-extras)
// is appended to the survey tile so every page reads with at least one bespoke line.
import { ShieldCheck, Calculator, ClipboardCheck, PackageCheck } from "lucide-react";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { MotionSection } from "./MotionSection";

interface WhatAffectsYourQuoteProps {
  townName: string;
  surveyTip?: string;
}

interface Tile {
  icon: typeof ShieldCheck;
  title: string;
  body: string;
}

export function WhatAffectsYourQuote({ townName, surveyTip }: WhatAffectsYourQuoteProps) {
  const tiles: Tile[] = [
    {
      icon: ShieldCheck,
      title: "BAR-approved vs man and van",
      body: `British Association of Removers (BAR) firms follow an audited code of practice and carry full insurance. Independent man-and-van outfits are usually cheaper and fine for smaller moves, provided they carry public liability and goods-in-transit cover. Every ${townName} mover in our network is insured.`,
    },
    {
      icon: Calculator,
      title: "Fixed price vs hourly",
      body: "A fixed price is best when volume, access and date are settled. An hourly rate suits small, simple moves you're confident you can load quickly. Fixed quotes usually include a 'one placement' policy, so plan furniture positions before the crew arrives.",
    },
    {
      icon: ClipboardCheck,
      title: "Free pre-move survey",
      body: `A short survey, in person or by video, lets the mover see access, volume and any tricky items before the day. ${
        surveyTip
          ? surveyTip
          : `Flag tight parking, narrow staircases and any fragile or specialist items in your ${townName} property up front.`
      }`,
    },
    {
      icon: PackageCheck,
      title: "Packing options",
      body: "Self-pack is the cheapest. A fragile-only pack (china, glass, art) is the middle ground most customers choose. A full pack saves time and lowers damage risk on bigger moves. Confirm what's included in each quote so you compare like for like.",
    },
  ];

  return (
    <Section tone="muted">
      <MotionSection>
        <SectionHeading
          eyebrow="What shapes your quote"
          title={`Four things that move the price in ${townName}`}
          lede="There is no single 'removal price'. Volume, access, distance, item intricacy and weekend vs midweek timing all change the final number. Here's how to read a quote like a pro."
        />
      </MotionSection>
      <div className="grid md:grid-cols-2 gap-5">
        {tiles.map((t, i) => {
          const Icon = t.icon;
          return (
            <MotionSection key={t.title} delay={i * 0.05}>
              <div className="h-full p-6 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-brand-green" />
                  </div>
                  <h3 className="text-lg font-semibold text-brand-slate font-montserrat">
                    {t.title}
                  </h3>
                </div>
                <p className="text-gray-700 font-roboto leading-relaxed">{t.body}</p>
              </div>
            </MotionSection>
          );
        })}
      </div>
    </Section>
  );
}
