import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { MoveType, PropertySize } from "@/types/move-request";

interface PropertySizeStepProps {
  moveType: MoveType;
  value: PropertySize | undefined;
  onChange: (value: PropertySize) => void;
}

export function PropertySizeStep({ moveType, value, onChange }: PropertySizeStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Property Size</h3>
      {moveType === "domestic" && (
        <RadioGroup defaultValue={value} onValueChange={onChange}>
          {["1", "2", "3", "4", "5+"].map((size) => (
            <div key={size} className="flex items-center space-x-2">
              <RadioGroupItem value={size} id={`size-${size}`} />
              <Label htmlFor={`size-${size}`}>{size} Bedroom{size !== "1" && "s"}</Label>
            </div>
          ))}
        </RadioGroup>
      )}
      {moveType === "commercial" && (
        <RadioGroup defaultValue={value} onValueChange={onChange}>
          {["office", "warehouse", "retail"].map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <RadioGroupItem value={type} id={`type-${type}`} />
              <Label htmlFor={`type-${type}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}
    </div>
  );
}