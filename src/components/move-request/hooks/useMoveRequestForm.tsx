
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MoveRequestForm, MoveType, PropertySize } from "@/types/move-request";
import { useLocation, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSubmitMoveRequest } from "@/hooks/use-submit-move-request";
import DOMPurify from "dompurify";

export function useMoveRequestForm() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
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

  const { toast } = useToast();
  const { 
    isSubmitting, 
    isGeocodingPickup,
    isGeocodingDelivery,
    showSuccess, 
    handleSubmit: onSubmit, 
    handleSuccessClose 
  } = useSubmitMoveRequest();

  // Watch for propertySize changes
  const propertySize = watch('propertySize');

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

  const validateField = (value: string, pattern: RegExp, minLength = 0): boolean => {
    if (!value || value.length < minLength) return false;
    return pattern.test(value);
  };

  const sanitizeInput = (input: string): string => {
    return DOMPurify.sanitize(input.trim(), { 
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [] // No attributes allowed
    });
  };

  const nextStep = () => {
    const currentValues = getValues();
    console.log('Current form values:', currentValues); // Debug log

    // Validate based on current step
    switch (step) {
      case 2: // Property Size
        if (!propertySize) {
          toast({
            title: "Missing Information",
            description: "Please select a property size before proceeding",
            variant: "destructive"
          });
          return;
        }
        break;

      case 3: // Pickup Address
        const pickupAddress = currentValues.pickupAddress;
        if (!pickupAddress?.street || !pickupAddress?.city || !pickupAddress?.state || !pickupAddress?.zipCode) {
          toast({
            title: "Missing Information",
            description: "Please fill in all pickup address fields before proceeding",
            variant: "destructive"
          });
          return;
        }
        // Sanitize address inputs
        setValue('pickupAddress', {
          street: sanitizeInput(pickupAddress.street),
          city: sanitizeInput(pickupAddress.city),
          state: sanitizeInput(pickupAddress.state),
          zipCode: sanitizeInput(pickupAddress.zipCode),
          country: pickupAddress.country ? sanitizeInput(pickupAddress.country) : undefined
        });
        break;

      case 4: // Delivery Address
        const deliveryAddress = currentValues.deliveryAddress;
        if (!deliveryAddress?.street || !deliveryAddress?.city || !deliveryAddress?.state || !deliveryAddress?.zipCode) {
          toast({
            title: "Missing Information",
            description: "Please fill in all delivery address fields before proceeding",
            variant: "destructive"
          });
          return;
        }
        // Sanitize address inputs
        setValue('deliveryAddress', {
          street: sanitizeInput(deliveryAddress.street),
          city: sanitizeInput(deliveryAddress.city),
          state: sanitizeInput(deliveryAddress.state),
          zipCode: sanitizeInput(deliveryAddress.zipCode),
          country: deliveryAddress.country ? sanitizeInput(deliveryAddress.country) : undefined
        });
        break;
    }

    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleMoveTypeChange = (type: MoveType) => {
    setMoveType(type);
    setValue('moveType', type);
    // Reset propertySize when move type changes
    setValue('propertySize', undefined);
    setStep(2);
  };

  const handlePropertySizeChange = (size: PropertySize) => {
    console.log('Setting property size:', size); // Debug log
    setValue('propertySize', size, { shouldValidate: true });
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

    // Final validation before submission
    const formData = {
      ...data,
      moveType,
      fullName: sanitizeInput(data.fullName),
      email: sanitizeInput(data.email),
      phone: sanitizeInput(data.phone),
      specialInstructions: data.specialInstructions ? sanitizeInput(data.specialInstructions) : undefined,
      moveDate: data.moveDate // Date input is already sanitized by the input type
    };

    // Validate email format
    if (!validateField(formData.email, /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    // Validate phone format
    if (!validateField(formData.phone, /^[0-9\s\-\+\(\)]{8,}$/)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    // Validate name length and format
    if (!validateField(formData.fullName, /^[a-zA-Z\s-']+$/, 2)) {
      toast({
        title: "Invalid Name",
        description: "Please enter a valid full name (minimum 2 characters)",
        variant: "destructive"
      });
      return;
    }

    onSubmit(formData);
  };

  return {
    step,
    totalSteps,
    moveType,
    register,
    errors,
    watch,
    setValue, // Explicitly return setValue
    isProcessing,
    showSuccess,
    handleSubmit,
    handleFormSubmit,
    handleMoveTypeChange,
    handlePropertySizeChange,
    handleSuccessClose,
    nextStep,
    prevStep,
    isGeocodingPickup,   // Explicitly return geocoding states
    isGeocodingDelivery,
    propertySize
  };
}
