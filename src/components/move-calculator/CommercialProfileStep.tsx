// CommercialProfileStep.tsx
// Two-question commercial profile picker used by the calculator wizard
// when the customer selects "Commercial" as the move type. Replaces the
// old single radio (office / warehouse / retail) that could not tell a
// small shop apart from a 10,000 sq ft warehouse.

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type {
  CommercialPremises,
  CommercialScale,
  CommercialProfile,
} from "@/types/move-request";

interface Props {
  value: CommercialProfile | undefined;
  onChange: (value: CommercialProfile) => void;
}

const PREMISES: Array<{ value: CommercialPremises; label: string }> = [
  { value: "office",     label: "Office" },
  { value: "retail",     label: "Retail / shop" },
  { value: "warehouse",  label: "Warehouse" },
  { value: "industrial", label: "Industrial / storage" },
  { value: "other",      label: "Other" },
];

const SCALES: Array<{ value: CommercialScale; label: string; hint: string }> = [
  { value: "small",      label: "Small",      hint: "Up to ~5 staff, ~500 sq ft, van-load" },
  { value: "medium",     label: "Medium",     hint: "~6 to 20 staff, ~500 to 2,000 sq ft, Luton or 7.5t" },
  { value: "large",      label: "Large",      hint: "~21 to 75 staff, ~2,000 to 8,000 sq ft, 18t or multi-vehicle" },
  { value: "enterprise", label: "Enterprise", hint: "75+ staff, 8,000+ sq ft, multi-day project (bespoke quote)" },
];

export function CommercialProfileStep({ value, onChange }: Props) {
  const setPremises = (premisesType: CommercialPremises) =>
    onChange({ premisesType, scale: value?.scale ?? ("small" as CommercialScale) });
  const setScale = (scale: CommercialScale) =>
    onChange({ premisesType: value?.premisesType ?? ("office" as CommercialPremises), scale });

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold font-montserrat text-brand-slate">
          What type of premises?
        </h3>
        <RadioGroup
          value={value?.premisesType}
          onValueChange={(v) => setPremises(v as CommercialPremises)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
        >
          {PREMISES.map((p) => (
            <div key={p.value} className="flex items-center space-x-2 rounded-md border border-brand-slateLight/30 px-3 py-2">
              <RadioGroupItem value={p.value} id={`prem-${p.value}`} />
              <Label htmlFor={`prem-${p.value}`} className="cursor-pointer">{p.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold font-montserrat text-brand-slate">
          What is the scale of the move?
        </h3>
        <RadioGroup
          value={value?.scale}
          onValueChange={(v) => setScale(v as CommercialScale)}
          className="space-y-2"
        >
          {SCALES.map((s) => (
            <div key={s.value} className="flex items-start space-x-2 rounded-md border border-brand-slateLight/30 px-3 py-2">
              <RadioGroupItem value={s.value} id={`scale-${s.value}`} className="mt-1" />
              <Label htmlFor={`scale-${s.value}`} className="cursor-pointer leading-tight">
                <span className="font-semibold text-brand-slate">{s.label}</span>
                <span className="block text-xs text-brand-slateLight font-roboto mt-0.5">{s.hint}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
