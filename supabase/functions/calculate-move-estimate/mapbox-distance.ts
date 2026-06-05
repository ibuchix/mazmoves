// mapbox-distance.ts
// Calls Mapbox Directions API to compute the real driving distance (miles)
// between two lat/lng pairs. Uses the same MAPBOX_ACCESS_TOKEN secret
// already used by the geocode-address edge function.
// Returns null when no route exists (e.g. sea crossings) so the caller can
// flag the estimate as requiring a bespoke quote instead of falling back
// to an inaccurate straight-line distance.

const METERS_PER_MILE = 1609.344;

export interface LatLng {
  latitude: number;
  longitude: number;
}

export async function getDrivingDistanceMiles(
  pickup: LatLng,
  delivery: LatLng,
): Promise<number | null> {
  const token = Deno.env.get("MAPBOX_ACCESS_TOKEN");
  if (!token) {
    throw new Error("MAPBOX_ACCESS_TOKEN is not configured");
  }

  const coords =
    `${pickup.longitude},${pickup.latitude};${delivery.longitude},${delivery.latitude}`;
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}` +
    `?access_token=${token}&overview=false&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Mapbox directions failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const route = data?.routes?.[0];
  if (!route || typeof route.distance !== "number") {
    return null;
  }

  return Math.round((route.distance / METERS_PER_MILE) * 10) / 10;
}
