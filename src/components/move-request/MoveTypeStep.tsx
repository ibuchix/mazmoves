// Step 1 of the move request wizard: pick the move type.
// Selection is forwarded to the parent via onChange — the parent is responsible
// for advancing the step. We do NOT auto-advance from inside this component,
// because doing so would re-trigger when the user clicks Previous and the
// previously-selected value is still present, trapping them on step 2.

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { MoveType } from "@/types/move-request";

interface MoveTypeStepProps {
  value: MoveType | null;
  onChange: (value: MoveType) => void;
  onNext: () => void;
}

export function MoveTypeStep({ value, onChange }: MoveTypeStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">What type of move is this?</h3>
      <RadioGroup
        value={value || undefined}
        onValueChange={(value: MoveType) => onChange(value)}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="domestic" id="domestic" />
          <Label htmlFor="domestic">Domestic Move</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="commercial" id="commercial" />
          <Label htmlFor="commercial">Commercial Move</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="international" id="international" />
          <Label htmlFor="international">International Move</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
