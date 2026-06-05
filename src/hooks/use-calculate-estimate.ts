// use-calculate-estimate.ts
// Calls the `calculate-move-estimate` edge function with geocoded
// pickup/delivery coords and returns the signed estimate response.
//
// Updated: input now supports an optional commercialProfile so the
// calculator can request commercial estimates with the new
// premises-type + scale model. The hook also accepts the bespoke
// quote response shape (no low/high price).

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { MoveType, PropertySize, CommercialProfile } from "@/types/move-request";

export interface EstimateBreakdown {
  base: number;
  distanceCost: number;
  typeMultiplier: number;
  surcharges: Array<{ label: string; pct: number }>;
}

export interface EstimateResponse {
  success: true;
  low?: number;
  high?: number;
  distanceMiles?: number;
  breakdown?: EstimateBreakdown;
  requiresCustomQuote: boolean;
  message?: string;
  estimateToken?: string;
  issuedAt?: number;
}

interface CalcInput {
  moveType: MoveType;
  propertySize?: PropertySize;
  commercialProfile?: CommercialProfile;
  pickupCoords: { latitude: number; longitude: number };
  deliveryCoords: { latitude: number; longitude: number };
  moveDate: string;
}

export function useCalculateEstimate() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async (input: CalcInput): Promise<EstimateResponse | null> => {
    setIsCalculating(true);
    setError(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "calculate-move-estimate",
        { body: input },
      );
      if (invokeError) throw invokeError;
      if (!data?.success) throw new Error(data?.error || "Failed to calculate estimate");
      return data as EstimateResponse;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to calculate estimate";
      setError(msg);
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  return { calculate, isCalculating, error };
}
