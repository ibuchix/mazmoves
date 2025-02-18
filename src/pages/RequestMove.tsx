
import { MoveRequestForm } from "@/components/move-request/MoveRequestForm";
import { Navigate, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function RequestMove() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [hasError, setHasError] = useState(false);
  const step = searchParams.get("step");
  const moveType = searchParams.get("moveType");

  useEffect(() => {
    // If we can't properly initialize the form within 500ms, redirect to home
    const timeout = setTimeout(() => {
      if (!document.querySelector('[data-testid="move-request-form"]')) {
        setHasError(true);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  // Redirect to home if there's an error
  if (hasError) {
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
