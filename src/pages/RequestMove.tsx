import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { addressToJson } from "@/types/address";
import { MoveRequestForm, MoveType } from "@/types/move-request";
import { MoveTypeStep } from "@/components/move-request/MoveTypeStep";
import { PropertySizeStep } from "@/components/move-request/PropertySizeStep";
import { AddressStep } from "@/components/move-request/AddressStep";
import { ContactStep } from "@/components/move-request/ContactStep";
import { geocodeAddress } from "@/utils/geocoding";
import { toast } from "sonner";

export default function RequestMove() {
  const location = useLocation();
  const [step, setStep] = useState(location.state?.moveType ? 2 : 1);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [moveType, setMoveType] = useState<MoveType | null>(location.state?.moveType || null);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<MoveRequestForm>();

  const totalSteps = 5;

  const onSubmit = async (data: MoveRequestForm) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Geocode both addresses
      const [pickupCoords, deliveryCoords] = await Promise.all([
        geocodeAddress(data.pickupAddress),
        geocodeAddress(data.deliveryAddress)
      ]);

      const { data: moveRequest, error: moveRequestError } = await supabase
        .from("move_requests")
        .insert({
          pickup_address: addressToJson(data.pickupAddress),
          delivery_address: addressToJson(data.deliveryAddress),
          requested_date: data.moveDate,
          estimated_size: data.propertySize,
          special_instructions: data.specialInstructions,
          customer_email: data.email,
          customer_name: data.fullName,
          customer_phone: data.phone,
          pickup_latitude: pickupCoords.latitude,
          pickup_longitude: pickupCoords.longitude,
          delivery_latitude: deliveryCoords.latitude,
          delivery_longitude: deliveryCoords.longitude
        })
        .select()
        .single();

      if (moveRequestError) {
        console.error("Error creating move request:", moveRequestError);
        throw moveRequestError;
      }

      const { error: notifyError } = await supabase.functions.invoke('notify-companies', {
        body: { requestId: moveRequest.id }
      });

      if (notifyError) {
        console.error("Error notifying companies:", notifyError);
        throw notifyError;
      }

      setShowSuccess(true);
      toast.success("Move request submitted successfully!");

    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Step {step} of {totalSteps}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
              />
            )}

            {step === 4 && (
              <AddressStep
                title="Delivery Address"
                type="delivery"
                register={register}
                isInternational={moveType === "international"}
              />
            )}

            {step === 5 && (
              <ContactStep register={register} />
            )}

            <div className="flex justify-between pt-4">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
              {step < totalSteps ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showSuccess} onOpenChange={(open) => {
        setShowSuccess(open);
        if (!open) {
          navigate("/");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold text-[#040480]">
              Success!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your Move Request has been sent to verified movers nearby. You will be contacted shortly.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button onClick={() => navigate("/")}>
              Return to Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
