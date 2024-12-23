import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { MoveType } from "@/types/move-request";

interface MoveTypeStepProps {
  value: MoveType | null;
  onChange: (value: MoveType) => void;
}

export function MoveTypeStep({ value, onChange }: MoveTypeStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">What type of move is this?</h3>
      <RadioGroup
        defaultValue={value || undefined}
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