import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { addressToJson } from "@/types/address";
import { Tables } from "@/types/database";
import { MoveRequestForm, MoveType } from "@/types/move-request";
import { MoveTypeStep } from "@/components/move-request/MoveTypeStep";
import { PropertySizeStep } from "@/components/move-request/PropertySizeStep";
import { AddressStep } from "@/components/move-request/AddressStep";
import { ContactStep } from "@/components/move-request/ContactStep";

export default function RequestMove() {
  const [step, setStep] = useState(1);
  const location = useLocation();
  const initialMoveType = location.state?.moveType || null;
  const [moveType, setMoveType] = useState<MoveType | null>(initialMoveType);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<MoveRequestForm>();

  const totalSteps = 5;

  const onSubmit = async (data: MoveRequestForm) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error("User not authenticated");
      }

      const moveRequest: Tables["move_requests"]["Insert"] = {
        customer_id: user.data.user.id,
        pickup_address: addressToJson(data.pickupAddress),
        delivery_address: addressToJson(data.deliveryAddress),
        requested_date: data.moveDate,
        estimated_size: data.propertySize,
        special_instructions: data.specialInstructions,
      };

      const { error } = await supabase
        .from("move_requests")
        .insert(moveRequest);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your move request has been submitted. Moving companies will contact you soon.",
      });

      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem submitting your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Request a Move - Step {step} of {totalSteps}
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
              />
            )}

            {step === 4 && (
              <AddressStep
                title="Delivery Address"
                type="delivery"
                register={register}
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
                <Button type="submit">Submit Request</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}