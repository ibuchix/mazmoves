
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MoveRequestForm } from "@/types/move-request";
import { addressToJson } from "@/utils/address";
import { checkRateLimit, logRateLimit } from "./move-request/use-rate-limit";
import { geocodeAddresses } from "./move-request/use-geocoding";
import { sendConfirmationEmail, notifyCompanies } from "./move-request/use-notifications";

export function useSubmitMoveRequest() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocodingPickup, setIsGeocodingPickup] = useState(false);
  const [isGeocodingDelivery, setIsGeocodingDelivery] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (data: MoveRequestForm) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      console.log("Starting form submission with data:", data);

      // Check rate limits
      const isWithinLimits = await checkRateLimit();
      if (!isWithinLimits) return;

      // Validate request
      const { data: validationResponse, error: validationError } = await supabase.functions.invoke(
        'validate-move-request',
        {
          body: { 
            moveRequest: data,
            clientIp: null // Will be handled by edge function
          }
        }
      );

      if (validationError || !validationResponse.success) {
        const errors = validationError?.message || validationResponse?.errors;
        console.error("Validation failed:", errors);
        toast({
          title: "Validation Error",
          description: Array.isArray(errors) 
            ? errors.map(e => e.message).join(", ")
            : "Please check your input and try again",
          variant: "destructive"
        });
        return;
      }

      const sanitizedData = validationResponse.data;
      
      // Geocode addresses
      const { pickupCoords, deliveryCoords } = await geocodeAddresses(
        sanitizedData.pickupAddress,
        sanitizedData.deliveryAddress,
        setIsGeocodingPickup,
        setIsGeocodingDelivery
      );

      console.log("Geocoding results:", { pickupCoords, deliveryCoords });

      const moveRequestData = {
        pickup_address: addressToJson(sanitizedData.pickupAddress),
        delivery_address: addressToJson(sanitizedData.deliveryAddress),
        requested_date: sanitizedData.moveDate,
        estimated_size: sanitizedData.propertySize,
        special_instructions: sanitizedData.specialInstructions,
        customer_email: sanitizedData.email,
        customer_name: sanitizedData.fullName,
        customer_phone: sanitizedData.phone,
        pickup_latitude: pickupCoords.latitude,
        pickup_longitude: pickupCoords.longitude,
        delivery_latitude: deliveryCoords.latitude,
        delivery_longitude: deliveryCoords.longitude,
        move_type: sanitizedData.moveType
      };

      const { data: moveRequest, error: moveRequestError } = await supabase
        .from("move_requests")
        .insert(moveRequestData)
        .select()
        .single();

      if (moveRequestError) {
        throw moveRequestError;
      }

      // Send notifications
      await sendConfirmationEmail(sanitizedData.email, sanitizedData.fullName);
      await notifyCompanies(moveRequest.id);

      // Log the rate limit usage
      await logRateLimit();

      setShowSuccess(true);
      toast({
        title: "Success",
        description: "Move request submitted successfully!",
        variant: "default"
      });

    } catch (error: any) {
      console.error("Detailed error in submission:", error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setIsGeocodingPickup(false);
      setIsGeocodingDelivery(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate("/");
  };

  return {
    isSubmitting,
    isGeocodingPickup,
    isGeocodingDelivery,
    showSuccess,
    handleSubmit,
    handleSuccessClose
  };
}
