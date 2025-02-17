
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MoveRequestForm, MoveType, PropertySize } from "@/types/move-request";
import { useLocation, useSearchParams } from "react-router-dom";
import { useFormValidation } from "./form/useFormValidation";
import { useUrlParams } from "./url/useUrlParams";
import { useFormSubmission } from "./form/useFormSubmission";
import { useSubmitMoveRequest } from "@/hooks/use-submit-move-request";
import { useToast } from "@/hooks/use-toast";

export function useMoveRequestForm() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Ensure we have valid initial values
  const initialMoveType = searchParams.get("moveType") as MoveType || null;
  const initialStep = searchParams.get("step") ? Math.max(1, parseInt(searchParams.get("step")!)) : 1;
  
  const [step, setStep] = useState(initialStep);
  const [moveType, setMoveType] = useState<MoveType | null>(initialMoveType);

  const form = useForm<MoveRequestForm>({
    defaultValues: {
      moveType: initialMoveType || undefined,
      propertySize: undefined
    },
    mode: "onChange" // Enable real-time validation
  });

  const { register, handleSubmit, watch, formState: { errors, isValid }, setValue, getValues } = form;
  const { validateField, sanitizeInput, validatePropertySize, validateAddress } = useFormValidation();
  const { handleFormSubmit } = useFormSubmission();
  const { isSubmitting, isGeocodingPickup, isGeocodingDelivery, showSuccess, handleSuccessClose } = useSubmitMoveRequest();

  // Set up URL params
  useUrlParams(step, moveType);

  // Ensure step is valid based on moveType
  useEffect(() => {
    if (!moveType && step > 1) {
      setStep(1);
    }
  }, [moveType, step]);

  const totalSteps = 5;
  const isProcessing = isSubmitting || isGeocodingPickup || isGeocodingDelivery;

  const nextStep = () => {
    const currentValues = getValues();
    let isStepValid = true;

    // Validate based on current step
    switch (step) {
      case 2:
        isStepValid = validatePropertySize(currentValues.propertySize);
        break;

      case 3:
        isStepValid = validateAddress(currentValues.pickupAddress, 'pickup');
        break;

      case 4:
        isStepValid = validateAddress(currentValues.deliveryAddress, 'delivery');
        break;

      case 5:
        if (!currentValues.fullName || !currentValues.email || !currentValues.phone) {
          toast({
            title: "Missing Information",
            description: "Please fill in all required contact information",
            variant: "destructive"
          });
          isStepValid = false;
        }
        break;
    }

    if (!isStepValid) return;
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleMoveTypeChange = (type: MoveType) => {
    setMoveType(type);
    setValue('moveType', type);
    setValue('propertySize', undefined);
    setStep(2);
  };

  const onSubmit = handleSubmit((data: MoveRequestForm) => {
    if (!moveType) {
      toast({
        title: "Error",
        description: "Please select a move type",
        variant: "destructive"
      });
      return;
    }

    // Validate all required fields before submission
    if (!validateAddress(data.pickupAddress, 'pickup') || 
        !validateAddress(data.deliveryAddress, 'delivery') || 
        !validatePropertySize(data.propertySize)) {
      return;
    }

    handleFormSubmit(data, moveType, validateField, sanitizeInput);
  });

  return {
    step,
    totalSteps,
    moveType,
    register,
    errors,
    watch,
    setValue,
    isProcessing,
    showSuccess,
    handleSubmit: onSubmit,
    handleMoveTypeChange,
    handleSuccessClose,
    nextStep,
    prevStep,
    isGeocodingPickup,
    isGeocodingDelivery,
    propertySize: watch('propertySize'),
    isValid
  };
}
