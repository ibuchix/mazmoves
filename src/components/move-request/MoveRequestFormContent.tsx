import { MoveTypeStep } from "./MoveTypeStep";
import { PropertySizeStep } from "./PropertySizeStep";
import { AddressStep } from "./AddressStep";
import { ContactStep } from "./ContactStep";
import { FormNavigation } from "./FormNavigation";
import { MoveType } from "@/types/move-request";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { MoveRequestForm } from "@/types/move-request";

interface MoveRequestFormContentProps {
  step: number;
  totalSteps: number;
  moveType: MoveType | null;
  register: UseFormRegister<MoveRequestForm>;
  errors: FieldErrors<MoveRequestForm>;
  watch: any;
  isProcessing: boolean;
  onMoveTypeChange: (type: MoveType) => void;
  onNext: () => void;
  onPrevious: () => void;
  isGeocodingPickup?: boolean;
  isGeocodingDelivery?: boolean;
}

export function MoveRequestFormContent({
  step,
  totalSteps,
  moveType,
  register,
  errors,
  watch,
  isProcessing,
  onMoveTypeChange,
  onNext,
  onPrevious,
  isGeocodingPickup,
  isGeocodingDelivery
}: MoveRequestFormContentProps) {
  return (
    <>
      {step === 1 && (
        <MoveTypeStep
          value={moveType}
          onChange={onMoveTypeChange}
          onNext={() => onNext()}
        />
      )}

      {step === 2 && moveType && (
        <PropertySizeStep
          moveType={moveType}
          value={watch("propertySize")}
          onChange={(value) => register("propertySize").onChange({ target: { value } })}
        />
      )}

      {step === 3 && (
        <AddressStep
          title="Pickup Address"
          type="pickup"
          register={register}
          errors={errors}
          isInternational={moveType === "international"}
          isGeocoding={isGeocodingPickup}
        />
      )}

      {step === 4 && (
        <AddressStep
          title="Delivery Address"
          type="delivery"
          register={register}
          errors={errors}
          isInternational={moveType === "international"}
          isGeocoding={isGeocodingDelivery}
        />
      )}

      {step === 5 && (
        <ContactStep 
          register={register}
          errors={errors}
        />
      )}

      <FormNavigation
        step={step}
        totalSteps={totalSteps}
        isProcessing={isProcessing}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </>
  );
}