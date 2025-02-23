
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

  const sendConfirmationEmail = async (email: string, fullName: string) => {
    try {
      console.log("Sending confirmation email to:", email);
      const { error: emailError } = await supabase.functions.invoke(
        'send-confirmation-email',
        {
          body: {
            customerEmail: email,
            customerName: fullName
          }
        }
      );

      if (emailError) {
        console.error('Error sending confirmation email:', emailError);
        toast.error("Could not send confirmation email");
      } else {
        console.log('Confirmation email sent successfully');
      }
    } catch (error) {
      console.error('Error in email sending process:', error);
    }
  };

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

      // Send confirmation email in a separate process
      sendConfirmationEmail(data.email, data.fullName);
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

  // Cleanup effect
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
