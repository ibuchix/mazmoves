import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { MoveRequestForm as IMoveRequestForm, MoveType } from "@/types/move-request";
import { MoveTypeStep } from "./MoveTypeStep";
import { PropertySizeStep } from "./PropertySizeStep";
import { AddressStep } from "./AddressStep";
import { ContactStep } from "./ContactStep";
import { SuccessDialog } from "./SuccessDialog";
import { useSubmitMoveRequest } from "@/hooks/use-submit-move-request";

export function MoveRequestForm() {
  const [step, setStep] = useState(1);
  const [moveType, setMoveType] = useState<MoveType | null>(null);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<IMoveRequestForm>();
  const { 
    isSubmitting, 
    isGeocodingPickup,
    isGeocodingDelivery,
    showSuccess, 
    handleSubmit: onSubmit, 
    handleSuccessClose 
  } = useSubmitMoveRequest();

  const totalSteps = 5;

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const isProcessing = isSubmitting || isGeocodingPickup || isGeocodingDelivery;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            {isSubmitting && <LoadingOverlay />}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-center text-[#040480]">
                Step {step} of {totalSteps}
              </h2>
              <div className="w-full bg-gray-200 h-2 mt-4 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#040480] transition-all duration-300"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <MoveTypeStep
                  value={moveType}
                  onChange={(value) => setMoveType(value)}
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
                  isInternational={moveType === "international"}
                  isGeocoding={isGeocodingPickup}
                />
              )}

              {step === 4 && (
                <AddressStep
                  title="Delivery Address"
                  type="delivery"
                  register={register}
                  isInternational={moveType === "international"}
                  isGeocoding={isGeocodingDelivery}
                />
              )}

              {step === 5 && (
                <ContactStep register={register} />
              )}

              <div className="flex justify-between pt-4">
                {step > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                    className="bg-white hover:bg-gray-50"
                    disabled={isProcessing}
                  >
                    Previous
                  </Button>
                )}
                {step < totalSteps ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className="bg-[#040480] hover:bg-[#1f3dd2] text-white ml-auto"
                    disabled={isProcessing}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isProcessing}
                    className="bg-[#040480] hover:bg-[#1f3dd2] text-white ml-auto"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </CardContent>
      </Card>

      <SuccessDialog 
        isOpen={showSuccess} 
        onClose={handleSuccessClose}
      />
    </div>
  );
}