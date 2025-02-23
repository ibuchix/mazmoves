
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { MoveRequestForm } from "@/types/move-request";

export interface SubmitMoveRequestHook {
  isSubmitting: boolean;
  isGeocodingPickup: boolean;
  isGeocodingDelivery: boolean;
  showSuccess: boolean;
  handleSubmit: (data: MoveRequestForm) => Promise<void>;
  handleSuccessClose: () => void;
}

const sendConfirmationEmail = async (email: string, fullName: string): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke(
      'send-confirmation-email',
      {
        body: {
          customerEmail: email,
          customerName: fullName
        }
      }
    );

    if (error) throw error;
  } catch (error) {
    console.error('Email error:', error);
    throw new Error('Failed to send confirmation email');
  }
};

const submitMainRequest = async (data: MoveRequestForm): Promise<void> => {
  // Main submission logic would go here
  // For now, just simulating a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log("Main request submitted:", data);
};

export function useSubmitMoveRequest(): SubmitMoveRequestHook {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocodingPickup, setIsGeocodingPickup] = useState(false);
  const [isGeocodingDelivery, setIsGeocodingDelivery] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: MoveRequestForm): Promise<void> => {
    if (isSubmitting) {
      console.log("Submission already in progress");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Process in parallel
      await Promise.all([
        sendConfirmationEmail(data.email, data.fullName),
        submitMainRequest(data)
      ]);
      
      setShowSuccess(true);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error instanceof Error ? error.message : 'Submission failed');
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

  // Cleanup on unmount
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
