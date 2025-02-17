
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MoveRequestForm, MoveType, PropertySize } from "@/types/move-request";
import { useLocation, useSearchParams } from "react-router-dom";
import { useFormValidation } from "./form/useFormValidation";
import { useUrlParams } from "./url/useUrlParams";
import { useFormSubmission } from "./form/useFormSubmission";
import { useSubmitMoveRequest } from "@/hooks/use-submit-move-request";

export function useMoveRequestForm() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Ensure we have valid initial values
  const initialMoveType = searchParams.get("moveType") as MoveType || null;
  const initialStep = searchParams.get("step") ? Math.max(1, parseInt(searchParams.get("step")!)) : 1;
  
  const [step, setStep] = useState(initialStep);
  const [moveType, setMoveType] = useState<MoveType | null>(initialMoveType);

  const form = useForm<MoveRequestForm>({
    defaultValues: {
      moveType: initialMoveType || undefined,
      propertySize: undefined
    }
  });

  const { register, handleSubmit, watch, formState: { errors }, setValue, getValues } = form;
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

    // Validate based on current step
    switch (step) {
      case 2:
        if (!validatePropertySize(currentValues.propertySize)) return;
        break;

      case 3:
        if (!validateAddress(currentValues.pickupAddress, 'pickup')) return;
        break;

      case 4:
        if (!validateAddress(currentValues.deliveryAddress, 'delivery')) return;
        break;
    }

    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleMoveTypeChange = (type: MoveType) => {
    setMoveType(type);
    setValue('moveType', type);
    setValue('propertySize', undefined);
    setStep(2);
  };

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
    handleSubmit,
    handleFormSubmit: (data: MoveRequestForm) => handleFormSubmit(data, moveType, validateField, sanitizeInput),
    handleMoveTypeChange,
    handleSuccessClose,
    nextStep,
    prevStep,
    isGeocodingPickup,
    isGeocodingDelivery,
    propertySize: watch('propertySize')
  };
}
