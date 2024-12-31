import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { addressToJson } from "@/types/address";
import { MoveRequestForm, MoveType } from "@/types/move-request";
import { MoveTypeStep } from "@/components/move-request/MoveTypeStep";
import { PropertySizeStep } from "@/components/move-request/PropertySizeStep";
import { AddressStep } from "@/components/move-request/AddressStep";
import { ContactStep } from "@/components/move-request/ContactStep";
import { useAuth } from "@/components/AuthProvider";

export default function RequestMove() {
  const location = useLocation();
  const [step, setStep] = useState(location.state?.moveType ? 2 : 1);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const [moveType, setMoveType] = useState<MoveType | null>(location.state?.moveType || null);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<MoveRequestForm>();

  const totalSteps = 5;

  const onSubmit = async (data: MoveRequestForm) => {
    try {
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to submit a move request.",
          variant: "destructive",
        });
        navigate("/login", { state: { from: location.pathname, formData: data } });
        return;
      }

      // Create move request
      const { data: moveRequest, error: moveRequestError } = await supabase
        .from("move_requests")
        .insert({
          pickup_address: addressToJson(data.pickupAddress),
          delivery_address: addressToJson(data.deliveryAddress),
          requested_date: data.moveDate,
          estimated_size: data.propertySize,
          special_instructions: data.specialInstructions,
          customer_email: session.user.email,
          customer_name: data.fullName,
          customer_phone: data.phone
        })
        .select()
        .single();

      if (moveRequestError) {
        console.error("Error creating move request:", moveRequestError);
        throw moveRequestError;
      }

      toast({
        title: "Success!",
        description: "Your move request has been submitted. Moving companies will contact you soon.",
      });

      navigate("/");
    } catch (error) {
      console.error("Error submitting request:", error);
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