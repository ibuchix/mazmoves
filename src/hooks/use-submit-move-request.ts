import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MoveRequestForm } from "@/types/move-request";
import { geocodeAddress, addressToJson } from "@/utils/address";

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

      // Get client IP for rate limiting
      const { data: { ip_address } } = await supabase.functions.invoke('get-client-ip');
      
      // Check rate limits
      const { data: rateCheck, error: rateError } = await supabase.rpc(
        'check_rate_limit',
        { 
          p_company_id: null, // null for anonymous users
          p_limit_type: 'hourly'
        }
      );

      if (rateError) {
        throw rateError;
      }

      if (!rateCheck) {
        toast({
          title: "Rate Limit Exceeded",
          description: "You've submitted too many requests. Please try again later.",
          variant: "destructive"
        });
        return;
      }

      // Validate request
      const { data: validationResponse, error: validationError } = await supabase.functions.invoke(
        'validate-move-request',
        {
          body: { 
            moveRequest: data,
            clientIp: ip_address
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
      
      // Geocode pickup address
      setIsGeocodingPickup(true);
      const pickupCoords = await geocodeAddress(sanitizedData.pickupAddress);
      setIsGeocodingPickup(false);

      // Geocode delivery address
      setIsGeocodingDelivery(true);
      const deliveryCoords = await geocodeAddress(sanitizedData.deliveryAddress);
      setIsGeocodingDelivery(false);

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
        delivery_longitude: deliveryCoords.longitude
      };

      const { data: moveRequest, error: moveRequestError } = await supabase
        .from("move_requests")
        .insert(moveRequestData)
        .select()
        .single();

      if (moveRequestError) {
        throw moveRequestError;
      }

      // Send confirmation email
      const { error: confirmationError } = await supabase.functions.invoke('send-confirmation-email', {
        body: { 
          customerEmail: sanitizedData.email,
          customerName: sanitizedData.fullName
        }
      });

      if (confirmationError) {
        console.error("Error sending confirmation email:", confirmationError);
      }

      // Notify companies
      const { error: notifyError } = await supabase.functions.invoke('notify-companies', {
        body: { requestId: moveRequest.id }
      });

      if (notifyError) {
        throw notifyError;
      }

      // Log the rate limit usage
      await supabase.from('rate_limit_logs').insert({
        company_id: null, // null for anonymous users
        limit_type: 'hourly'
      });

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