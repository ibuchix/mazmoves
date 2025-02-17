
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MoveType } from "@/types/move-request";

export function useUrlParams(step: number, moveType: MoveType | null) {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("step", step.toString());
    if (moveType) {
      params.set("moveType", moveType);
    } else {
      params.delete("moveType");
    }
    setSearchParams(params, { replace: true });
  }, [step, moveType, setSearchParams]);

  return {
    searchParams,
    setSearchParams
  };
}
