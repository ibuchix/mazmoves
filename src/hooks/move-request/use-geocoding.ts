import { Address } from "@/types/address";
import { supabase } from "@/integrations/supabase/client";

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

async function geocodeAddress(address: Address): Promise<{ latitude: number; longitude: number }> {
  try {
    const addressString = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;

    const { data, error } = await supabase.functions.invoke('geocode-address', {
      body: { address: addressString }
    });

    if (error) {
      throw new Error('Failed to geocode address');
    }

    if (!data.latitude || !data.longitude) {
      throw new Error('Invalid geocoding response');
    }

    return {
      latitude: data.latitude,
      longitude: data.longitude
    };
  } catch (error) {
    throw new Error('Failed to geocode address');
  }
}