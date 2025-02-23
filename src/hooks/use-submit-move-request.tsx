
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MoveRequestForm } from "@/types/move-request";
import { addressToJson } from "@/utils/address";
import { checkRateLimit, logRateLimit } from "./move-request/use-rate-limit";
import { geocodeAddresses } from "./move-request/use-geocoding";
import { notifyCompanies } from "./move-request/use-notifications";

export function useSubmitMoveRequest() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocodingPickup, setIsGeocodingPickup] = useState(false);
  const [isGeocodingDelivery, setIsGeocodingDelivery] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: MoveRequestForm) => {
    if (isSubmitting) {
      console.log("Submission already in progress, returning");
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log("Starting form submission with data:", {
        ...data,
        email: "REDACTED",
        phone: "REDACTED"
      });

      // Send confirmation email
      try {
        const { data: emailResponse, error: emailError } = await supabase.functions.invoke(
          'send-confirmation-email',
          {
            body: {
              customerEmail: data.email,
              customerName: data.fullName
            }
          }
        );

        if (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't fail the whole submission if email fails
          toast.error("Could not send confirmation email");
        } else {
          console.log('Confirmation email sent successfully');
        }
      } catch (emailError) {
        console.error('Error in email sending process:', emailError);
        // Continue with submission even if email fails
      }

      setShowSuccess(true);
      
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit move request");
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
