
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MoveRequestForm, MoveType } from "@/types/move-request";
import { useLocation, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSubmitMoveRequest } from "@/hooks/use-submit-move-request";

export function useMoveRequestForm() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Ensure we have valid initial values
  const initialMoveType = searchParams.get("moveType") as MoveType || null;
  const initialStep = searchParams.get("step") ? Math.max(1, parseInt(searchParams.get("step")!)) : 1;
  
  const [step, setStep] = useState(initialStep);
  const [moveType, setMoveType] = useState<MoveType | null>(initialMoveType);
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<MoveRequestForm>();
  const { toast } = useToast();
  const { 
    isSubmitting, 
    isGeocodingPickup,
    isGeocodingDelivery,
    showSuccess, 
    handleSubmit: onSubmit, 
    handleSuccessClose 
  } = useSubmitMoveRequest();

  // Update URL params when step or moveType changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("step", step.toString());
    if (moveType) {
      params.set("moveType", moveType);
    } else {
      params.delete("moveType");
    }
    setSearchParams(params, { replace: true });
  }, [step, moveType, setSearchParams]);

  // Ensure step is valid based on moveType
  useEffect(() => {
    if (!moveType && step > 1) {
      setStep(1);
    }
  }, [moveType, step]);

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

  const handleFormSubmit = (data: MoveRequestForm) => {
    if (!moveType) {
      toast({
        title: "Missing Move Type",
        description: "Please select a move type before submitting",
        variant: "destructive"
      });
      return;
    }
    
    const formData = {
      ...data,
      moveType
    };
    
    onSubmit(formData);
  };

  return {
    step,
    totalSteps,
    moveType,
    register,
    errors,
    watch,
    isProcessing,
    showSuccess,
    handleSubmit,
    handleFormSubmit,
    handleMoveTypeChange,
    handleSuccessClose,
    nextStep,
    prevStep
  };
}
