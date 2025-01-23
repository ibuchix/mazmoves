import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { MoveRequestForm as IMoveRequestForm, MoveType } from "@/types/move-request";
import { MoveTypeStep } from "./MoveTypeStep";
import { PropertySizeStep } from "./PropertySizeStep";
import { AddressStep } from "./AddressStep";
import { ContactStep } from "./ContactStep";
import { SuccessDialog } from "./SuccessDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function MoveRequestForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [moveType, setMoveType] = useState<MoveType | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<IMoveRequestForm>();

  const totalSteps = 5;

  const onSubmit = async (data: IMoveRequestForm) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      console.log("Starting form submission with data:", data);
      
      const [pickupCoords, deliveryCoords] = await Promise.all([
        geocodeAddress(data.pickupAddress),
        geocodeAddress(data.deliveryAddress)
      ]);

      console.log("Geocoding results:", { pickupCoords, deliveryCoords });

      const moveRequestData = {
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
      };

      const { data: moveRequest, error: moveRequestError } = await supabase
        .from("move_requests")
        .insert(moveRequestData)
        .select()
        .single();

      if (moveRequestError) {
        throw moveRequestError;
      }

      // Send confirmation email
      const { error: confirmationError } = await supabase.functions.invoke('send-confirmation-email', {
        body: { 
          customerEmail: data.email,
          customerName: data.fullName
        }
      });

      if (confirmationError) {
        console.error("Error sending confirmation email:", confirmationError);
      }

      // Notify companies
      const { error: notifyError } = await supabase.functions.invoke('notify-companies', {
        body: { requestId: moveRequest.id }
      });

      if (notifyError) {
        throw notifyError;
      }

      setShowSuccess(true);
      toast.success("Move request submitted successfully!");

    } catch (error: any) {
      console.error("Detailed error in submission:", error);
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                    className="bg-white hover:bg-gray-50"
                  >
                    Previous
                  </Button>
                )}
                {step < totalSteps ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className="bg-[#040480] hover:bg-[#1f3dd2] text-white ml-auto"
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
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
        onClose={() => {
          setShowSuccess(false);
          navigate("/");
        }}
      />
    </div>
  );
}