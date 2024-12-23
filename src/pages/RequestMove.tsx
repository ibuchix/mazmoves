import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Address, addressToJson } from "@/types/address";
import { Tables } from "@/types/database";

type MoveType = "domestic" | "commercial" | "international";
type PropertySize = "1" | "2" | "3" | "4" | "5+" | "office" | "warehouse" | "retail";

interface MoveRequestForm {
  moveType: MoveType;
  propertySize: PropertySize;
  pickupAddress: Address;
  deliveryAddress: Address;
  moveDate: string;
  fullName: string;
  email: string;
  phone: string;
  specialInstructions?: string;
}

export default function RequestMove() {
  const [step, setStep] = useState(1);
  const [moveType, setMoveType] = useState<MoveType | null>(null);
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

      navigate("/dashboard");
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
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">What type of move is this?</h3>
                <RadioGroup
                  defaultValue={moveType || undefined}
                  onValueChange={(value: MoveType) => setMoveType(value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="domestic" id="domestic" />
                    <Label htmlFor="domestic">Domestic Move</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="commercial" id="commercial" />
                    <Label htmlFor="commercial">Commercial Move</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="international" id="international" />
                    <Label htmlFor="international">International Move</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Property Size</h3>
                {moveType === "domestic" && (
                  <RadioGroup defaultValue={watch("propertySize")}>
                    {["1", "2", "3", "4", "5+"].map((size) => (
                      <div key={size} className="flex items-center space-x-2">
                        <RadioGroupItem value={size} id={`size-${size}`} />
                        <Label htmlFor={`size-${size}`}>{size} Bedroom{size !== "1" && "s"}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                {moveType === "commercial" && (
                  <RadioGroup defaultValue={watch("propertySize")}>
                    {["office", "warehouse", "retail"].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <RadioGroupItem value={type} id={`type-${type}`} />
                        <Label htmlFor={`type-${type}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pickup Address</h3>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="pickup-street">Street Address</Label>
                    <Input
                      id="pickup-street"
                      {...register("pickupAddress.street", { required: true })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pickup-city">City</Label>
                    <Input
                      id="pickup-city"
                      {...register("pickupAddress.city", { required: true })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pickup-state">State/Province</Label>
                    <Input
                      id="pickup-state"
                      {...register("pickupAddress.state", { required: true })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pickup-zipCode">Postal Code</Label>
                    <Input
                      id="pickup-zipCode"
                      {...register("pickupAddress.zipCode", { required: true })}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Delivery Address</h3>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="delivery-street">Street Address</Label>
                    <Input
                      id="delivery-street"
                      {...register("deliveryAddress.street", { required: true })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="delivery-city">City</Label>
                    <Input
                      id="delivery-city"
                      {...register("deliveryAddress.city", { required: true })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="delivery-state">State/Province</Label>
                    <Input
                      id="delivery-state"
                      {...register("deliveryAddress.state", { required: true })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="delivery-zipCode">Postal Code</Label>
                    <Input
                      id="delivery-zipCode"
                      {...register("deliveryAddress.zipCode", { required: true })}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      {...register("fullName", { required: true })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email", { required: true })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register("phone", { required: true })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="moveDate">Preferred Move Date</Label>
                    <Input
                      id="moveDate"
                      type="date"
                      {...register("moveDate", { required: true })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                    <Input
                      id="specialInstructions"
                      {...register("specialInstructions")}
                    />
                  </div>
                </div>
              </div>
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
};
