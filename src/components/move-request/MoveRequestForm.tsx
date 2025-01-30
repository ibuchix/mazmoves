import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { MoveRequestForm as IMoveRequestForm, MoveType } from "@/types/move-request";
import { MoveTypeStep } from "./MoveTypeStep";
import { PropertySizeStep } from "./PropertySizeStep";
import { AddressStep } from "./AddressStep";
import { ContactStep } from "./ContactStep";
import { SuccessDialog } from "./SuccessDialog";
import { FormProgress } from "./FormProgress";
import { FormNavigation } from "./FormNavigation";
import { useSubmitMoveRequest } from "@/hooks/use-submit-move-request";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";

export function MoveRequestForm() {
  const location = useLocation();
  const initialMoveType = location.state?.moveType || null;
  const [step, setStep] = useState(initialMoveType ? 2 : 1);
  const [moveType, setMoveType] = useState<MoveType | null>(initialMoveType);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<IMoveRequestForm>();
  const { toast } = useToast();
  const { 
    isSubmitting, 
    isGeocodingPickup,
    isGeocodingDelivery,
    showSuccess, 
    handleSubmit: onSubmit, 
    handleSuccessClose 
  } = useSubmitMoveRequest();

  const totalSteps = 5;
  const isProcessing = isSubmitting || isGeocodingPickup || isGeocodingDelivery;

  const nextStep = () => {
    // For step 3 (pickup address), validate before proceeding
    if (step === 3) {
      const pickupAddress = watch("pickupAddress");
      if (!pickupAddress?.street || !pickupAddress?.city || !pickupAddress?.state || !pickupAddress?.zipCode) {
        toast({
          title: "Missing Information",
          description: "Please fill in all pickup address fields before proceeding",
          variant: "destructive"
        });
        return;
      }
    }

    // For step 4 (delivery address), validate before proceeding
    if (step === 4) {
      const deliveryAddress = watch("deliveryAddress");
      if (!deliveryAddress?.street || !deliveryAddress?.city || !deliveryAddress?.state || !deliveryAddress?.zipCode) {
        toast({
          title: "Missing Information",
          description: "Please fill in all delivery address fields before proceeding",
          variant: "destructive"
        });
        return;
      }
    }

    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleMoveTypeChange = (type: MoveType) => {
    setMoveType(type);
    setStep(2); // Immediately move to step 2 when type is selected
  };

  const handleFormSubmit = (data: IMoveRequestForm) => {
    if (!moveType) {
      toast({
        title: "Missing Move Type",
        description: "Please select a move type before submitting",
        variant: "destructive"
      });
      return;
    }
    
    // Include the moveType in the submission data
    const formData = {
      ...data,
      moveType
    };
    
    onSubmit(formData);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            {isSubmitting && <LoadingOverlay />}
            
            <FormProgress step={step} totalSteps={totalSteps} />

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              {step === 1 && (
                <MoveTypeStep
                  value={moveType}
                  onChange={handleMoveTypeChange}
                  onNext={() => setStep(2)}
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
                onPrevious={prevStep}
                onNext={nextStep}
              />
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