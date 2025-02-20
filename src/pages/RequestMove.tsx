
import { MoveRequestForm } from "@/components/move-request/MoveRequestForm";
import { Navigate, useSearchParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function RequestMove() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [hasError, setHasError] = useState(false);
  const step = searchParams.get("step");
  const moveType = searchParams.get("moveType");

  useEffect(() => {
    // Increase timeout to 2000ms (2 seconds) to allow more time for form initialization
    const timeout = setTimeout(() => {
      if (!document.querySelector('[data-testid="move-request-form"]')) {
        console.error("Form failed to initialize within timeout period");
        setHasError(true);
      }
    }, 2000);

    // Clear timeout on component unmount
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  // Show detailed error message instead of redirecting immediately
  if (hasError) {
    console.error("Move request form initialization failed");
    return <Navigate to="/" replace />;
  }

  // If step is greater than 1 but no moveType is selected, redirect to step 1
  if (step && parseInt(step) > 1 && !moveType) {
    return <Navigate to="/request-move" replace />;
  }

  // If accessing directly without any params, ensure we start at step 1
  if (!step && !moveType) {
    return <Navigate to="/request-move?step=1" replace />;
  }

  return <MoveRequestForm />;
}
