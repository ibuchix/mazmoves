
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MoveRequestForm } from "@/types/move-request";

export function useSubmitMoveRequest() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocodingPickup, setIsGeocodingPickup] = useState(false);
  const [isGeocodingDelivery, setIsGeocodingDelivery] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: MoveRequestForm) => {
    if (isSubmitting) {
      console.log("Submission already in progress");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Processing move request");

      // Send confirmation email
      await supabase.functions.invoke(
        'send-confirmation-email',
        {
          body: {
            customerEmail: data.email,
            customerName: data.fullName
          }
        }
      );

      setShowSuccess(true);
      
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit move request");
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

  useEffect(() => {
    return () => {
      setIsSubmitting(false);
      setShowSuccess(false);
    };
  }, []);

  return {
    isSubmitting,
    isGeocodingPickup,
    isGeocodingDelivery,
    showSuccess,
    handleSubmit,
    handleSuccessClose
  };
}
