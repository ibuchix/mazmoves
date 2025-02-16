
import { MoveRequestForm } from "@/components/move-request/MoveRequestForm";
import { Navigate, useSearchParams } from "react-router-dom";

export default function RequestMove() {
  const [searchParams] = useSearchParams();
  const step = searchParams.get("step");
  const moveType = searchParams.get("moveType");

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
