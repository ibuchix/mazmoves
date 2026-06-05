// CalculatorWizard.tsx
// Five-step wizard that mirrors the Start Your Move flow but produces a
// server-signed price estimate at the end. We reuse the existing
// MoveTypeStep / PropertySizeStep / AddressStep components so the look
// and validation rules stay consistent. The final step is a date picker
// that triggers geocoding + the calculate-move-estimate edge call.

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormProgress } from "@/components/move-request/FormProgress";
import { MoveTypeStep } from "@/components/move-request/MoveTypeStep";
import { PropertySizeStep } from "@/components/move-request/PropertySizeStep";
import { AddressStep } from "@/components/move-request/AddressStep";
import type { MoveType, PropertySize, MoveRequestForm } from "@/types/move-request";
import { geocodeAddress } from "@/utils/geocoding";
import { useCalculateEstimate, type EstimateResponse } from "@/hooks/use-calculate-estimate";
import { toast } from "sonner";

interface CalculatorWizardProps {
  onEstimate: (
    estimate: EstimateResponse,
    inputs: {
      moveType: MoveType;
      propertySize: PropertySize;
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
  const [geocoding, setGeocoding] = useState(false);
  const { calculate, isCalculating } = useCalculateEstimate();

  const { register, formState: { errors }, getValues, trigger } = useForm<MoveRequestForm>({
    mode: "onChange",
  });

  const canNext = (() => {
    switch (step) {
      case 1: return !!moveType;
      case 2: return !!propertySize;
      case 3: {
        const a = getValues("pickupAddress");
        return !!(a?.street && a?.city && a?.state && a?.zipCode);
      }
      case 4: {
        const a = getValues("deliveryAddress");
        return !!(a?.street && a?.city && a?.state && a?.zipCode);
      }
      case 5: return !!getValues("moveDate");
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
    if (!moveType || !propertySize) return;
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
        propertySize,
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
        propertySize,
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
            onChange={(v) => { setMoveType(v); setPropertySize(undefined); }}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && moveType && (
          <PropertySizeStep
            moveType={moveType}
            value={propertySize}
            onChange={setPropertySize}
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
                Weekend moves and moves within the next 7 days carry a small premium —
                we'll show it in the breakdown.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prev}
            disabled={step === 1 || busy}
            className="bg-white"
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
              className="bg-brand-orange hover:bg-brand-green text-white font-montserrat font-semibold px-6"
            >
              {busy ? (
                <><LoadingSpinner size="sm" className="border-white mr-2" /> Crunching numbers...</>
              ) : (
                "Calculate my estimate"
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
