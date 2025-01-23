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
      
      // Geocode pickup address
      setIsGeocodingPickup(true);
      const pickupCoords = await geocodeAddress(data.pickupAddress);
      setIsGeocodingPickup(false);

      // Geocode delivery address
      setIsGeocodingDelivery(true);
      const deliveryCoords = await geocodeAddress(data.deliveryAddress);
      setIsGeocodingDelivery(false);

      console.log("Geocoding results:", { pickupCoords, deliveryCoords });

      const moveRequestData = {
        pickup_address: addressToJson(data.pickupAddress),
        delivery_address: addressToJson(data.deliveryAddress),
        requested_date: data.moveDate,
        estimated_size: data.propertySize,
        special_instructions: data.specialInstructions,
        customer_email: data.email,
        customer_name: data.fullName,
        customer_phone: data.phone,
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
          customerEmail: data.email,
          customerName: data.fullName
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