// Persists move requests to the `move_requests` table in Supabase.
// The confirmation email is sent AFTER the insert and its failure no longer
// blocks the success dialog — the request is saved either way.

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

const insertMoveRequest = async (data: MoveRequestForm): Promise<void> => {
  const { error } = await supabase.from("move_requests").insert([
    {
      move_type: data.moveType,
      estimated_size: data.propertySize,
      pickup_address: data.pickupAddress as never,
      delivery_address: data.deliveryAddress as never,
      requested_date: data.moveDate,
      customer_name: data.fullName,
      customer_email: data.email,
      customer_phone: data.phone,
      special_instructions: data.specialInstructions ?? null,
    },
  ]);

  if (error) {
    console.error("Failed to insert move request:", error);
    throw new Error(error.message || "Failed to save your move request");
  }
};

const sendConfirmationEmail = async (email: string, fullName: string): Promise<void> => {
  const { error } = await supabase.functions.invoke("send-confirmation-email", {
    body: {
      customerEmail: email,
      customerName: fullName,
    },
  });

  if (error) throw error;
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
      // 1. Save the request first — this is the source of truth.
      await insertMoveRequest(data);

      // 2. Attempt the confirmation email. Failure is non-blocking.
      try {
        await sendConfirmationEmail(data.email, data.fullName);
      } catch (emailError) {
        console.error("Confirmation email failed (non-blocking):", emailError);
        toast.warning(
          "Your request was saved, but we couldn't send the confirmation email. We'll still be in touch."
        );
      }

      setShowSuccess(true);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error instanceof Error ? error.message : "Submission failed");
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
    handleSuccessClose,
  };
}
