
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MoveRequestForm } from "@/types/move-request";
import { addressToJson } from "@/utils/address";
import { checkRateLimit, logRateLimit } from "./move-request/use-rate-limit";
import { geocodeAddresses } from "./move-request/use-geocoding";
import { sendConfirmationEmail, notifyCompanies } from "./move-request/use-notifications";
import { ToastAction } from "@/components/ui/toast";

export function useSubmitMoveRequest() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocodingPickup, setIsGeocodingPickup] = useState(false);
  const [isGeocodingDelivery, setIsGeocodingDelivery] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (data: MoveRequestForm) => {
    if (isSubmitting) {
      console.log("Submission already in progress, returning");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Debug: Log the initial form data
      console.log("Starting form submission with data:", {
        ...data,
        email: "REDACTED",
        phone: "REDACTED"
      });

      // Debug: Check rate limits
      console.log("Checking rate limits...");
      const isWithinLimits = await checkRateLimit();
      console.log("Rate limit check result:", isWithinLimits);
      if (!isWithinLimits) return;

      // Debug: Validate request
      console.log("Validating move request...");
      const { data: validationResponse, error: validationError } = await supabase.functions.invoke(
        'validate-move-request',
        {
          body: { 
            moveRequest: data,
            clientIp: null // Will be handled by edge function
          }
        }
      );

      console.log("Validation response:", validationResponse);
      console.log("Validation error:", validationError);

      if (validationError || !validationResponse?.success) {
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
      console.log("Sanitized data:", {
        ...sanitizedData,
        email: "REDACTED",
        phone: "REDACTED"
      });
      
      // Debug: Geocoding
      console.log("Starting address geocoding...");
      const { pickupCoords, deliveryCoords } = await geocodeAddresses(
        sanitizedData.pickupAddress,
        sanitizedData.deliveryAddress,
        setIsGeocodingPickup,
        setIsGeocodingDelivery
      );

      console.log("Geocoding results:", { pickupCoords, deliveryCoords });

      // Debug: Database insertion data
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

      console.log("Attempting to insert move request with data:", {
        ...moveRequestData,
        customer_email: "REDACTED",
        customer_phone: "REDACTED"
      });

      // Debug: Database insertion
      const { data: moveRequest, error: moveRequestError } = await supabase
        .from("move_requests")
        .insert(moveRequestData)
        .select()
        .single();

      if (moveRequestError) {
        console.error("Error inserting move request:", moveRequestError);
        console.error("Error details:", {
          code: moveRequestError.code,
          message: moveRequestError.message,
          details: moveRequestError.details,
          hint: moveRequestError.hint
        });
        throw moveRequestError;
      }

      console.log("Move request inserted successfully:", moveRequest.id);

      // Debug: Email confirmation
      try {
        console.log("Sending confirmation email to:", sanitizedData.email);
        const emailResult = await sendConfirmationEmail(sanitizedData.email, sanitizedData.fullName);
        console.log("Confirmation email result:", emailResult);
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        console.error("Email error details:", {
          message: emailError.message,
          stack: emailError.stack
        });
      }

      // Debug: Company notifications
      console.log("Notifying companies about new move request...");
      await notifyCompanies(moveRequest.id);
      console.log("Companies notified successfully");

      // Debug: Rate limit logging
      console.log("Logging rate limit usage...");
      await logRateLimit();
      console.log("Rate limit logged successfully");

      setShowSuccess(true);

      // Debug: Toast rendering
      console.log("Preparing to show success toast...");
      
      // Show toast immediately without setTimeout
      toast({
        title: "Move Request Received",
        description: "Check your email for confirmation details",
        variant: "default",
        action: (
          <ToastAction 
            altText="Go to homepage" 
            onClick={() => {
              console.log("Toast action clicked");
              navigate("/");
            }}
            className="inline-flex items-center justify-center rounded-md bg-[#040480] px-4 py-2 text-sm font-montserrat font-semibold text-white transition-colors hover:bg-[#1f3dd2] focus:outline-none focus:ring-2 focus:ring-[#1f3dd2] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Return Home
          </ToastAction>
        ),
        duration: 0, // Make toast stay until dismissed
        className: "z-[100]",
      });
      console.log("Success toast triggered");

    } catch (error: any) {
      console.error("Detailed error in submission:", error);
      console.error("Error stack trace:", error.stack);
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
