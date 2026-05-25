// TownHero.tsx - Slate gradient hero for town pages, reusing homepage hero form.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoveType } from "@/types/move-request";
import { HeroForm } from "@/components/home/hero/HeroForm";
import { useIsMobile } from "@/hooks/use-mobile";
import { Check } from "lucide-react";

interface TownHeroProps {
  townName: string;
  county: string;
  trustWord?: "verified" | "vetted";
}

export function TownHero({ townName, county, trustWord = "vetted" }: TownHeroProps) {
  const [moveType, setMoveType] = useState<MoveType | null>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const onGetQuotes = () => {
    if (moveType) {
      navigate(`/request-move?step=2&moveType=${moveType}`, { replace: true });
    }
  };

  const trustWordCap = trustWord.charAt(0).toUpperCase() + trustWord.slice(1);
  const bullets = [
    `${trustWordCap} ${townName} removal companies`,
    "Multiple free quotes, no obligation",
    "Compare prices, reviews and availability",
  ];

  return (
    <section className="relative flex items-center px-4 sm:px-6 lg:px-8 pt-8 pb-16 md:pt-12 md:pb-24">
      <div className="absolute inset-x-4 sm:inset-x-6 lg:inset-x-8 top-8 md:top-12 bottom-16 md:bottom-24 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-brand-slate via-brand-slateLight to-brand-slate shadow-2xl">
        <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')] bg-center" />
        <div className="absolute inset-0 bg-black/5" />
      </div>
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-stretch">
          <div className={`${isMobile ? "order-1" : "order-2 md:order-1"} animate-fade-in`}>
            <HeroForm moveType={moveType} setMoveType={setMoveType} onGetQuotes={onGetQuotes} />
          </div>
          <div className={`${isMobile ? "order-2" : "order-1 md:order-2"} animate-fade-in [animation-delay:200ms] flex flex-col justify-center h-full text-white`}>
            <p className="text-brand-green font-montserrat font-semibold tracking-wide text-sm uppercase mb-2">
              {county}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold font-montserrat mb-4 leading-tight">
              House Removals in {townName}
            </h1>
            <p className="text-lg text-white/90 font-roboto mb-6 max-w-xl">
              Compare free quotes from {trustWord} {townName} movers in one place, with no obligation and no chasing calls.
            </p>
            <ul className="space-y-2">
              {bullets.map((b) => (
                <li key={b} className="flex items-center gap-2 font-roboto">
                  <Check className="w-5 h-5 text-brand-green shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
