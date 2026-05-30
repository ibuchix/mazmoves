// useSubmitMoveRequest
// --------------------
// Persists a move request to Supabase and wires it into the matching pipeline:
//
//   1. Geocode pickup + delivery addresses via the `geocode-address` edge fn
//      (drives the spinner flags consumed by AddressStep). Geocoding failure
//      is non-fatal — the request is still saved so the backstop matching
//      cron can retry geocoding/matching later.
//   2. Insert the row into `move_requests` with lat/lng included when
//      available. A DB trigger converts those into the PostGIS
//      pickup_location / delivery_location columns used by matching.
//   3. Fire-and-forget invoke `notify-companies` so matched movers get an
//      assignment row on their dashboard. Failure here is non-blocking.
//   4. Send the customer confirmation email (non-blocking — to be revisited
//      in the email follow-up task).

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { MoveRequestForm } from "@/types/move-request";
import type { Address } from "@/types/address";
import { identifyUser, trackEvent } from "@/utils/tracking/tiktok";
import { trackAdsConversion, GOOGLE_ADS_CONVERSION_SEND_TO, GOOGLE_ADS_CONVERSION_VALUE } from "@/utils/tracking/google-ads";
import { track } from "@/lib/campaign-tracking";

export interface SubmitMoveRequestHook {
  isSubmitting: boolean;
  isGeocodingPickup: boolean;
  isGeocodingDelivery: boolean;
  showSuccess: boolean;
  handleSubmit: (data: MoveRequestForm) => Promise<void>;
  handleSuccessClose: () => void;
}

interface Coords {
  latitude: number;
  longitude: number;
}

const geocodeAddress = async (address: Address): Promise<Coords | null> => {
  try {
    const addressString = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country,
    ]
      .filter(Boolean)
      .join(", ");

    const { data, error } = await supabase.functions.invoke("geocode-address", {
      body: { address: addressString },
    });

    if (error) {
      console.error("geocode-address error:", error);
      return null;
    }

    if (
      typeof data?.latitude !== "number" ||
      typeof data?.longitude !== "number"
    ) {
      console.error("geocode-address returned invalid payload:", data);
      return null;
    }

    return { latitude: data.latitude, longitude: data.longitude };
  } catch (err) {
    console.error("Geocoding threw:", err);
    return null;
  }
};

const insertMoveRequest = async (
  data: MoveRequestForm,
  pickupCoords: Coords | null,
  deliveryCoords: Coords | null,
): Promise<string> => {
  // Route through the submit-move-request edge function. The function
  // performs origin/rate-limit/zod validation and inserts using the
  // service role, so anon clients no longer need direct INSERT access
  // on the move_requests table.
  const { data: response, error } = await supabase.functions.invoke(
    "submit-move-request",
    {
      body: {
        moveRequest: {
          moveType: data.moveType,
          propertySize: data.propertySize,
          pickupAddress: data.pickupAddress,
          deliveryAddress: data.deliveryAddress,
          moveDate: data.moveDate,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          specialInstructions: data.specialInstructions ?? null,
          pickupCoords,
          deliveryCoords,
        },
      },
    },
  );

  if (error || !response?.success || !response?.id) {
    const message =
      response?.error || error?.message || "Failed to save your move request";
    console.error("Failed to submit move request:", error || response);
    throw new Error(message);
  }

  const inserted = { id: response.id as string };

  return inserted.id as string;
};

const triggerMatching = async (moveRequestId: string): Promise<void> => {
  // Fire-and-forget. The backstop process-matches cron will retry any
  // request whose status stays `pending` because of an inline failure.
  try {
    const { error } = await supabase.functions.invoke("notify-companies", {
      body: { moveRequestId },
    });
    if (error) {
      console.error("notify-companies invocation error (non-blocking):", error);
    }
  } catch (err) {
    console.error("notify-companies threw (non-blocking):", err);
  }
};

const sendConfirmationEmail = async (
  email: string,
  fullName: string,
): Promise<void> => {
  const { error } = await supabase.functions.invoke("send-confirmation-email", {
    body: { customerEmail: email, customerName: fullName },
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
      // 1. Geocode pickup, then delivery (sequential so the per-step spinner
      // is meaningful to the user). Failures don't block submission.
      setIsGeocodingPickup(true);
      const pickupCoords = await geocodeAddress(data.pickupAddress);
      setIsGeocodingPickup(false);

      setIsGeocodingDelivery(true);
      const deliveryCoords = await geocodeAddress(data.deliveryAddress);
      setIsGeocodingDelivery(false);

      // 2. Save the request — this is the source of truth.
      const moveRequestId = await insertMoveRequest(
        data,
        pickupCoords,
        deliveryCoords,
      );

      // 2b. Campaign attribution event. The track-event edge function also
      // stamps campaign_id directly on the move_requests row, so attribution
      // survives even if the beacon is blocked.
      try {
        const landingSlug = (() => {
          try {
            const ref = document.referrer ? new URL(document.referrer) : null;
            if (!ref) return undefined;
            const parts = ref.pathname.replace(/^\/+|\/+$/g, "").split("/");
            return parts[0] === "removals" && parts[1] ? parts[1] : undefined;
          } catch {
            return undefined;
          }
        })();
        // Awaited so the edge function can stamp campaign_id onto the
        // move_requests row BEFORE we show the success dialog / navigate —
        // otherwise the in-flight request gets canceled and attribution is lost.
        await track({
          event_type: "form_submitted",
          request_id: moveRequestId,
          move_type: data.moveType,
          location_slug: landingSlug,
        });
      } catch {
        // never block submission on tracking
      }

      // 3. Kick off matching. Non-blocking.
      if (pickupCoords || deliveryCoords) {
        void triggerMatching(moveRequestId);
      } else {
        console.warn(
          `Move request ${moveRequestId} saved without coordinates — matching deferred to backstop cron.`,
        );
      }

      // 4. Confirmation email — non-blocking.
      try {
        await sendConfirmationEmail(data.email, data.fullName);
      } catch (emailError) {
        console.error("Confirmation email failed (non-blocking):", emailError);
        toast.warning(
          "Your request was saved, but we couldn't send the confirmation email. We'll still be in touch.",
        );
      }

      // 5. TikTok Pixel + server Events API — identify customer (hashed)
      // first so the conversion events can attach hashed PII, then fire
      // the conversions. Awaiting identify is cheap (SHA-256 of 3 short
      // strings) and ensures the server payload includes the user data.
      try {
        await identifyUser({
          email: data.email,
          phone: data.phone,
          externalId: moveRequestId,
        });
      } catch (err) {
        console.error("TikTok identifyUser failed (non-blocking):", err);
      }
      const conversionPayload = {
        contents: [
          {
            content_id: `move-${data.moveType}`,
            content_type: "product" as const,
            content_name: `Move Request - ${data.moveType}`,
          },
        ],
      };
      trackEvent("SubmitForm", conversionPayload);
      trackEvent("CompleteRegistration", conversionPayload);

      // Google Ads conversion — fires only when the AW-.../<label> constant
      // has been filled in. Safe no-op until then.
      trackAdsConversion({
        sendTo: GOOGLE_ADS_CONVERSION_SEND_TO,
        value: GOOGLE_ADS_CONVERSION_VALUE,
        currency: "GBP",
        transactionId: moveRequestId,
      });

      setShowSuccess(true);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error instanceof Error ? error.message : "Submission failed",
      );
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
