import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MoveRequestForm, MoveType } from "@/types/move-request";
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
  
  const initialMoveType = searchParams.get("moveType") as MoveType || null;
  const initialStep = searchParams.get("step") ? Math.max(1, parseInt(searchParams.get("step")!)) : 1;
  
  const [step, setStep] = useState(initialStep);
  const [moveType, setMoveType] = useState<MoveType | null>(initialMoveType);

  const form = useForm<MoveRequestForm>({
    defaultValues: {
      moveType: initialMoveType || undefined,
      propertySize: undefined
    },
    mode: "onChange"
  });

  const { register, handleSubmit, watch, formState: { errors }, setValue, getValues } = form;
  const { validateField, sanitizeInput, validatePropertySize, validateAddress } = useFormValidation();
  const { handleFormSubmit } = useFormSubmission();
  const { handleSubmit: submitMoveRequest, isSubmitting, isGeocodingPickup, isGeocodingDelivery, showSuccess, handleSuccessClose } = useSubmitMoveRequest();

  useUrlParams(step, moveType);

  useEffect(() => {
    if (!moveType && step > 1) {
      setStep(1);
    }
  }, [moveType, step]);

  const totalSteps = 5;
  const isProcessing = isSubmitting || isGeocodingPickup || isGeocodingDelivery;

  const safeValidate = <T,>(value: T | undefined, validatorFn: (val: T) => boolean): boolean => {
    if (value === undefined) return false;
    try {
      return validatorFn(value);
    } catch (error) {
      console.log("Validation error:", error);
      return false;
    }
  };

  const isCurrentStepValid = () => {
    const currentValues = getValues();
    try {
      switch (step) {
        case 1:
          return !!moveType;
        case 2:
          return safeValidate(currentValues.propertySize, (size) => !!size);
        case 3:
          return safeValidate(currentValues.pickupAddress, (addr) => 
            !!addr && !!addr.street && !!addr.city && !!addr.state && !!addr.zipCode
          );
        case 4:
          return safeValidate(currentValues.deliveryAddress, (addr) => 
            !!addr && !!addr.street && !!addr.city && !!addr.state && !!addr.zipCode
          );
        case 5:
          return !!(currentValues.fullName && currentValues.email && currentValues.phone);
        default:
          return false;
      }
    } catch (error) {
      console.log("Step validation error:", error);
      return false;
    }
  };

  const nextStep = () => {
    if (isCurrentStepValid()) {
      setStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleMoveTypeChange = (type: MoveType) => {
    setMoveType(type);
    setValue('moveType', type);
    setValue('propertySize', undefined);
    setStep(2);
  };

  const onSubmit = handleSubmit(async (formData: MoveRequestForm) => {
    console.log("Form submission started");
    
    if (!moveType) {
      toast({
        title: "Error",
        description: "Please select a move type",
        variant: "destructive"
      });
      return;
    }

    if (!validateAddress(formData.pickupAddress, 'pickup') || 
        !validateAddress(formData.deliveryAddress, 'delivery') || 
        !validatePropertySize(formData.propertySize)) {
      return;
    }

    const result = await handleFormSubmit(formData, moveType, { validateField, sanitizeInput });
    
    if (result.success && result.submissionData) {
      await submitMoveRequest(result.submissionData);
      setStep(1);
    }
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
    isValid: isCurrentStepValid()
  };
}
