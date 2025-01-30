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
  console.log('Geocoding pickup address:', pickupAddress);
  setIsGeocodingPickup(true);
  const pickupCoords = await geocodeAddress(pickupAddress);
  setIsGeocodingPickup(false);

  // Geocode delivery address
  console.log('Geocoding delivery address:', deliveryAddress);
  setIsGeocodingDelivery(true);
  const deliveryCoords = await geocodeAddress(deliveryAddress);
  setIsGeocodingDelivery(false);

  return { pickupCoords, deliveryCoords };
}

async function geocodeAddress(address: Address): Promise<{ latitude: number; longitude: number }> {
  try {
    const addressString = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
    console.log('Geocoding address:', addressString);

    const { data, error } = await supabase.functions.invoke('geocode-address', {
      body: { address: addressString }
    });

    if (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to geocode address');
    }

    console.log('Geocoding response:', data);

    if (!data.latitude || !data.longitude) {
      throw new Error('Invalid geocoding response');
    }

    return {
      latitude: data.latitude,
      longitude: data.longitude
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to geocode address');
  }
}