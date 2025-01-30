import { Address } from "@/types/address";
import { geocodeAddress } from "@/utils/address";

export interface GeocodingResult {
  pickupCoords: {
    latitude: number;
    longitude: number;
  };
  deliveryCoords: {
    latitude: number;
    longitude: number;
  };
}

export async function geocodeAddresses(
  pickupAddress: Address,
  deliveryAddress: Address,
  setIsGeocodingPickup: (value: boolean) => void,
  setIsGeocodingDelivery: (value: boolean) => void
): Promise<GeocodingResult> {
  // Geocode pickup address
  setIsGeocodingPickup(true);
  const pickupCoords = await geocodeAddress(pickupAddress);
  setIsGeocodingPickup(false);

  // Geocode delivery address
  setIsGeocodingDelivery(true);
  const deliveryCoords = await geocodeAddress(deliveryAddress);
  setIsGeocodingDelivery(false);

  return { pickupCoords, deliveryCoords };
}