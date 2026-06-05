// shared-faqs.ts - Two extra FAQs merged onto every town page, distilled from the
// Removals Price Guide (insurance, fixed vs hourly). Town-specific FAQs render first;
// these append at the end for consistent baseline coverage.

import type { TownFaq } from "@/data/locations";

export function sharedFaqs(townName: string): TownFaq[] {
  return [
    {
      q: `Are HouseMove's ${townName} movers insured?`,
      a: `Yes. Every mover in our ${townName} network carries public liability and goods-in-transit insurance as a baseline, and many also hold employer's liability cover. If you have high-value items, ask the company to confirm the per-item limit before you book.`,
    },
    {
      q: "Should I get a fixed price or hourly quote?",
      a: "Fixed price is best when the volume, access and date are settled — you know the final number up front. An hourly rate suits small, simple moves where you're confident you can load quickly. Most fixed quotes include a 'one placement' policy per item, so plan furniture positions before the crew arrives.",
    },
  ];
}
