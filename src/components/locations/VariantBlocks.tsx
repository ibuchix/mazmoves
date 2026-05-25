// VariantBlocks.tsx - Town-context section blocks (coastal, commuter, student,
// historic, rural, city). Rendered only when a town's `sections` array lists them.
import { Waves, Train, GraduationCap, Landmark, Trees, Building2 } from "lucide-react";
import type { VariantBlock } from "@/data/locations";

const META: Record<VariantBlock, { title: string; icon: typeof Waves; accent: string }> = {
  coastal: { title: "Coastal access & seafront parking", icon: Waves, accent: "text-brand-slate" },
  commuter: { title: "London commuter moves", icon: Train, accent: "text-brand-slateLight" },
  student: { title: "Student & academic moves", icon: GraduationCap, accent: "text-brand-orange" },
  historic: { title: "Historic-centre access", icon: Landmark, accent: "text-brand-slate" },
  rural: { title: "Rural & long-driveway access", icon: Trees, accent: "text-brand-green" },
  city: { title: "Cross-city & apartment-block moves", icon: Building2, accent: "text-brand-slate" },
};

interface VariantSectionsProps {
  townName: string;
  sections: VariantBlock[];
  variantCopy?: Partial<Record<VariantBlock, string>>;
}

export function VariantSections({ townName, sections, variantCopy }: VariantSectionsProps) {
  if (!sections.length) return null;
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-brand-slate font-montserrat mb-8">
          What to know about moving in {townName}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {sections.map((s) => {
            const m = META[s];
            const Icon = m.icon;
            const body = variantCopy?.[s];
            if (!body) return null;
            return (
              <div
                key={s}
                className="p-6 rounded-lg border bg-gray-50 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon className={`w-6 h-6 ${m.accent}`} />
                  <h3 className="text-xl font-semibold text-brand-slate font-montserrat">
                    {m.title}
                  </h3>
                </div>
                <p className="text-gray-700 font-roboto">{body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
