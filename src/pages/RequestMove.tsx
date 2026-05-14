
import { MoveRequestForm } from "@/components/move-request/MoveRequestForm";
import { Navigate, useSearchParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { SeoHead } from "@/components/seo/SeoHead";
import { trackEvent } from "@/utils/tracking/tiktok";

export default function RequestMove() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [hasError, setHasError] = useState(false);
  const step = searchParams.get("step");
  const moveType = searchParams.get("moveType");

  // Fire TikTok events tied to the move-request funnel. ViewContent is sent
  // on every visit; InitiateCheckout is sent once the user has chosen a
  // move type and progressed to step 2 (the actual form).
  useEffect(() => {
    trackEvent("ViewContent", {
      contents: [
        {
          content_id: "move-request",
          content_type: "product",
          content_name: "Move Request",
        },
      ],
    });
  }, []);

  useEffect(() => {
    if (moveType && step && parseInt(step) >= 2) {
      trackEvent("InitiateCheckout", {
        contents: [
          {
            content_id: `move-${moveType}`,
            content_type: "product",
            content_name: `Move Request - ${moveType}`,
          },
        ],
      });
    }
  }, [moveType, step]);

  useEffect(() => {
    // Increase timeout to 5000ms (5 seconds) to allow more time for form initialization
    const timeout = setTimeout(() => {
      if (!document.querySelector('[data-testid="move-request-form"]')) {
        console.error("Form failed to initialize within timeout period");
        setHasError(true);
      }
    }, 5000);

    // Clear timeout on component unmount or when form is found
    const checkForm = () => {
      if (document.querySelector('[data-testid="move-request-form"]')) {
        clearTimeout(timeout);
      }
    };

    // Check periodically for form
    const interval = setInterval(checkForm, 100);

    // Clear both timeout and interval on unmount
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [location.pathname]);

  // Show detailed error message instead of redirecting immediately
  if (hasError) {
    console.error("Move request form initialization failed");
    return <Navigate to="/" replace />;
  }

  // If step is greater than 1 but no moveType is selected, redirect to step 1
  if (step && parseInt(step) > 1 && !moveType) {
    console.log("Redirecting to step 1: No move type selected");
    return <Navigate to="/request-move?step=1" replace />;
  }

  // If accessing directly without any params, ensure we start at step 1
  if (!step && !moveType) {
    console.log("Initializing at step 1");
    return <Navigate to="/request-move?step=1" replace />;
  }

  return (
    <>
      <SeoHead
        title="Request a Move — HouseMove"
        description="Tell us about your move in a few quick steps and get matched with vetted UK moving companies for free quotes."
        path="/request-move"
        type="website"
      />
      <MoveRequestForm />
    </>
  );
}
