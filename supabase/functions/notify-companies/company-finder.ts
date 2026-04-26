// company-finder.ts
// Helper that calls the `find_companies_within_radius` PostGIS RPC and
// returns matched companies. Uses the shared RADIUS_MILES constant so the
// matching radius is consistent across notify-companies and process-matches.

import type { Assignment, MoveRequest } from "./types.ts";
import { RADIUS_MILES } from "./distance.ts";

export const findNearbyCompanies = async (
  supabase: any,
  request: MoveRequest,
  useDeliveryLocation = false,
): Promise<{ assignments: Assignment[]; locationUsed: "pickup" | "delivery" }> => {
  const locationUsed: "pickup" | "delivery" = useDeliveryLocation ? "delivery" : "pickup";
  const point = useDeliveryLocation ? request.delivery_location : request.pickup_location;

  if (!point) {
    console.warn(`findNearbyCompanies: missing ${locationUsed} location for request ${request.id}`);
    return { assignments: [], locationUsed };
  }

  const { data: nearbyCompanies, error } = await supabase.rpc(
    "find_companies_within_radius",
    {
      point,
      radius_miles: RADIUS_MILES,
    },
  );

  if (error) {
    console.error("find_companies_within_radius error:", error);
    return { assignments: [], locationUsed };
  }

  if (!nearbyCompanies || nearbyCompanies.length === 0) {
    return { assignments: [], locationUsed };
  }

  const companyIds = nearbyCompanies.map((c: { id: string }) => c.id);
  const { data: companies, error: companyError } = await supabase
    .from("companies")
    .select("id, name, contact_email, latitude, longitude")
    .in("id", companyIds);

  if (companyError || !companies) {
    console.error("Error fetching company details:", companyError);
    return { assignments: [], locationUsed };
  }

  const distanceById = new Map<string, number>(
    nearbyCompanies.map((c: { id: string; distance: number }) => [c.id, c.distance]),
  );

  const assignments: Assignment[] = companies.map((company: any) => ({
    company,
    distance: distanceById.get(company.id) ?? 0,
  }));

  return { assignments, locationUsed };
};
