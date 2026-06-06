// CalculatorWizard.tsx
// Five-step wizard that mirrors the Start Your Move flow but produces a
// server-signed price estimate at the end. Reuses MoveTypeStep /
// AddressStep / PropertySizeStep where possible; commercial moves use a
// dedicated CommercialProfileStep (premises type + scale) instead of the
// legacy single radio.
//
// Updated: step 2 branches on move type. Commercial step requires both
// premisesType and scale before the user can advance. Em-dashes removed
// from the surcharge hint copy.

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormProgress } from "@/components/move-request/FormProgress";
import { MoveTypeStep } from "@/components/move-request/MoveTypeStep";
import { PropertySizeStep } from "@/components/move-request/PropertySizeStep";
import { CommercialProfileStep } from "@/components/move-calculator/CommercialProfileStep";
import { AddressStep } from "@/components/move-request/AddressStep";
import type {
  MoveType,
  PropertySize,
  CommercialProfile,
  MoveRequestForm,
} from "@/types/move-request";
import { geocodeAddress } from "@/utils/geocoding";
import { useCalculateEstimate, type EstimateResponse } from "@/hooks/use-calculate-estimate";
import { toast } from "sonner";

interface CalculatorWizardProps {
  onEstimate: (
    estimate: EstimateResponse,
    inputs: {
      moveType: MoveType;
      propertySize?: PropertySize;
      commercialProfile?: CommercialProfile;
      pickupAddress: MoveRequestForm["pickupAddress"];
      deliveryAddress: MoveRequestForm["deliveryAddress"];
      pickupCoords: { latitude: number; longitude: number };
      deliveryCoords: { latitude: number; longitude: number };
      moveDate: string;
    },
  ) => void;
}

const TOTAL_STEPS = 5;

export function CalculatorWizard({ onEstimate }: CalculatorWizardProps) {
  const [step, setStep] = useState(1);
  const [moveType, setMoveType] = useState<MoveType | null>(null);
  const [propertySize, setPropertySize] = useState<PropertySize | undefined>(undefined);
  const [commercialProfile, setCommercialProfile] = useState<CommercialProfile | undefined>(undefined);
  const [geocoding, setGeocoding] = useState(false);
  const { calculate, isCalculating } = useCalculateEstimate();

  const { register, formState: { errors }, getValues, trigger, watch } = useForm<MoveRequestForm>({
    mode: "onChange",
  });

  const watchedPickup = watch("pickupAddress");
  const watchedDelivery = watch("deliveryAddress");
  const watchedDate = watch("moveDate");

  const step2Ready =
    moveType === "commercial"
      ? !!(commercialProfile?.premisesType && commercialProfile?.scale)
      : !!propertySize;

  const canNext = (() => {
    switch (step) {
      case 1: return !!moveType;
      case 2: return step2Ready;
      case 3:
        return !!(watchedPickup?.street && watchedPickup?.city && watchedPickup?.state && watchedPickup?.zipCode);
      case 4:
        return !!(watchedDelivery?.street && watchedDelivery?.city && watchedDelivery?.state && watchedDelivery?.zipCode);
      case 5: return !!watchedDate;
      default: return false;
    }
  })();

  const next = async () => {
    if (step === 3) {
      const ok = await trigger("pickupAddress");
      if (!ok) return;
    }
    if (step === 4) {
      const ok = await trigger("deliveryAddress");
      if (!ok) return;
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  const prev = () => setStep((s) => Math.max(1, s - 1));

  const handleCalculate = async () => {
    if (!moveType) return;
    if (moveType === "commercial" ? !commercialProfile : !propertySize) return;
    const values = getValues();
    if (!values.moveDate) return;
    setGeocoding(true);
    try {
      const [pickup, delivery] = await Promise.all([
        geocodeAddress(values.pickupAddress),
        geocodeAddress(values.deliveryAddress),
      ]);
      const estimate = await calculate({
        moveType,
        propertySize: moveType === "commercial" ? undefined : propertySize,
        commercialProfile: moveType === "commercial" ? commercialProfile : undefined,
        pickupCoords: { latitude: pickup.latitude, longitude: pickup.longitude },
        deliveryCoords: { latitude: delivery.latitude, longitude: delivery.longitude },
        moveDate: values.moveDate,
      });
      if (!estimate) {
        toast.error("We couldn't calculate your estimate. Please check your details and try again.");
        return;
      }
      onEstimate(estimate, {
        moveType,
        propertySize: moveType === "commercial" ? undefined : propertySize,
        commercialProfile: moveType === "commercial" ? commercialProfile : undefined,
        pickupAddress: values.pickupAddress,
        deliveryAddress: values.deliveryAddress,
        pickupCoords: { latitude: pickup.latitude, longitude: pickup.longitude },
        deliveryCoords: { latitude: delivery.latitude, longitude: delivery.longitude },
        moveDate: values.moveDate,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not verify your addresses");
    } finally {
      setGeocoding(false);
    }
  };

  const busy = geocoding || isCalculating;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-brand-slateLight/20 p-5 md:p-8">
      <FormProgress step={step} totalSteps={TOTAL_STEPS} />

      <form onSubmit={(e) => e.preventDefault()}>
        {step === 1 && (
          <MoveTypeStep
            value={moveType}
            onChange={(v) => {
              setMoveType(v);
              setPropertySize(undefined);
              setCommercialProfile(undefined);
            }}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && moveType && moveType !== "commercial" && (
          <PropertySizeStep
            moveType={moveType}
            value={propertySize}
            onChange={setPropertySize}
          />
        )}
        {step === 2 && moveType === "commercial" && (
          <CommercialProfileStep
            value={commercialProfile}
            onChange={setCommercialProfile}
          />
        )}
        {step === 3 && (
          <AddressStep
            title="Pickup address"
            type="pickup"
            register={register}
            errors={errors}
            isInternational={moveType === "international"}
          />
        )}
        {step === 4 && (
          <AddressStep
            title="Delivery address"
            type="delivery"
            register={register}
            errors={errors}
            isInternational={moveType === "international"}
          />
        )}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-slate font-montserrat">
              When do you want to move?
            </h3>
            <div className="space-y-2">
              <Label htmlFor="calc-date" className="text-sm font-medium text-brand-slate">
                Preferred move date *
              </Label>
              <Input
                id="calc-date"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                {...register("moveDate", { required: true })}
                className="h-11 border-brand-slateLight focus:ring-brand-green"
              />
              <p className="text-xs text-brand-slateLight font-roboto">
                Weekend moves carry 5% premium. Short notice moves that must happen within 2
                days of booking carry a 10% short notice premium.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-stretch gap-2 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prev}
            disabled={step === 1 || busy}
            className="bg-white shrink-0"
          >
            Previous
          </Button>
          {step < TOTAL_STEPS ? (
            <Button
              type="button"
              onClick={next}
              disabled={!canNext || busy}
              className="bg-brand-slate hover:bg-brand-slateLight text-white"
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleCalculate}
              disabled={!canNext || busy}
              className="bg-brand-orange hover:bg-brand-green text-white font-montserrat font-semibold px-4 sm:px-6 text-sm sm:text-base whitespace-normal h-auto min-h-[2.5rem] flex-1 sm:flex-none"
            >
              {busy ? (
                <><LoadingSpinner size="sm" className="border-white mr-2 shrink-0" /> <span>Crunching...</span></>
              ) : (
                "Calculate estimate"
              )}
            </Button>
          )}
        </div>

      </form>
    </div>
  );
}
