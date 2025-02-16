
import { MoveRequestForm } from "@/components/move-request/MoveRequestForm";
import { Navigate } from "react-router-dom";

export default function RequestMove() {
  // Handle direct access to invalid steps or states
  const searchParams = new URLSearchParams(window.location.search);
  const step = searchParams.get("step");
  const moveType = searchParams.get("moveType");

  // If step is greater than 1 but no moveType is selected, redirect to step 1
  if (step && parseInt(step) > 1 && !moveType) {
    return <Navigate to="/request-move" replace />;
  }

  return <MoveRequestForm />;
}
