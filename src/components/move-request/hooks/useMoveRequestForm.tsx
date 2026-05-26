// useMoveRequestForm
// Wizard state hook for the multi-step move request form.
// Persists step, moveType, and all field values to sessionStorage so the user
// can navigate to the Home page (or anywhere within the SPA) and return to
// /request-move with their progress fully intact. URL params take precedence
// over storage when present, then storage, then defaults. Storage is cleared
// after a successful submission.

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MoveRequestForm, MoveType } from "@/types/move-request";
import { useLocation, useSearchParams } from "react-router-dom";
import { useFormValidation } from "./form/useFormValidation";
import { useUrlParams } from "./url/useUrlParams";
import { useFormSubmission } from "./form/useFormSubmission";
import { useSubmitMoveRequest } from "@/hooks/use-submit-move-request";
import { useToast } from "@/hooks/use-toast";
import { track } from "@/lib/campaign-tracking";

const STORAGE_KEY = "moveRequestForm:v1";

interface PersistedState {
  step: number;
  moveType: MoveType | null;
  values: Partial<MoveRequestForm>;
}

function loadPersisted(): PersistedState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function clearPersisted() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function useMoveRequestForm() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const persisted = loadPersisted();

  const urlMoveType = searchParams.get("moveType") as MoveType | null;
  const urlStepRaw = searchParams.get("step");

  const initialMoveType: MoveType | null =
    urlMoveType || persisted?.moveType || null;
  const initialStep = urlStepRaw
    ? Math.max(1, parseInt(urlStepRaw))
    : persisted?.step ?? 1;

  const [step, setStep] = useState(initialStep);
  const [moveType, setMoveType] = useState<MoveType | null>(initialMoveType);

  const form = useForm<MoveRequestForm>({
    defaultValues: {
      ...(persisted?.values ?? {}),
      moveType: initialMoveType || persisted?.values?.moveType || undefined,
      propertySize: persisted?.values?.propertySize ?? undefined,
    },
    mode: "onChange"
  });

  const { register, handleSubmit, watch, formState: { errors }, setValue, getValues } = form;
  const { validateField, sanitizeInput, validatePropertySize, validateAddress } = useFormValidation();
  const { handleFormSubmit } = useFormSubmission();
  const { handleSubmit: submitMoveRequest, isSubmitting, isGeocodingPickup, isGeocodingDelivery, showSuccess, handleSuccessClose } = useSubmitMoveRequest();

  useUrlParams(step, moveType);

  // Persist wizard progress to sessionStorage on every change so the user can
  // navigate away (e.g. Home button on step 1) and return without losing input.
  useEffect(() => {
    const subscription = watch((values) => {
      try {
        const payload: PersistedState = {
          step,
          moveType,
          values: values as Partial<MoveRequestForm>,
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // Quota / serialization errors are non-fatal — ignore.
      }
    });
    // Also persist immediately when step/moveType change (without a field edit).
    try {
      const payload: PersistedState = {
        step,
        moveType,
        values: getValues() as Partial<MoveRequestForm>,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
    return () => subscription.unsubscribe();
  }, [watch, getValues, step, moveType]);

  useEffect(() => {
    if (!moveType && step > 1) {
      setStep(1);
    }
  }, [moveType, step]);

  const onSubmit = handleSubmit(async (formData: MoveRequestForm) => {
    try {
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

      const result = await handleFormSubmit(formData, moveType, { 
        validateField, 
        sanitizeInput 
      });

      if (result.success && result.submissionData) {
        await submitMoveRequest(result.submissionData);
        clearPersisted();
        form.reset();
        setMoveType(null);
        setStep(1);
      }
    } catch (error) {
      toast({
        title: "Submission Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  });

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
    track({ event_type: "move_type_selected", move_type: type });
  };

  const propertySize = watch('propertySize');
  const isValid = isCurrentStepValid();

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
    propertySize,
    isValid
  };
}
