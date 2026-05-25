// TrustPoints.tsx - Why-use-HouseMove block on town pages.
import { Check } from "lucide-react";

interface TrustPointsProps {
  townName: string;
  points: string[];
}

export function TrustPoints({ townName, points }: TrustPointsProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-brand-slate text-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold font-montserrat mb-6">
          Why use HouseMove for your {townName} move
        </h2>
        <ul className="grid md:grid-cols-2 gap-4">
          {points.map((p) => (
            <li key={p} className="flex gap-3 items-start font-roboto">
              <Check className="w-5 h-5 text-brand-green shrink-0 mt-1" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
