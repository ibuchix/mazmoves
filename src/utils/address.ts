import { Address } from "@/types/address";
import { supabase } from "@/integrations/supabase/client";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export async function geocodeAddress(address: Address): Promise<Coordinates> {
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

export const addressToJson = (address: Address) => {
  return address as unknown as Json;
};