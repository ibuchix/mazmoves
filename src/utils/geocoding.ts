import { Address } from "@/types/address";
import { supabase } from "@/integrations/supabase/client";

export interface Coordinates {
  latitude: number;
  longitude: number;
  location?: any; // PostGIS geometry type
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
      throw new Error('Failed to geocode address. Please check the address and try again.');
    }

    console.log('Geocoding response:', data);

    if (!data.latitude || !data.longitude) {
      throw new Error('Invalid geocoding response: missing coordinates');
    }

    return {
      latitude: data.latitude,
      longitude: data.longitude,
      location: null // This will be set by the database trigger
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to geocode address. Please check the address and try again.');
  }
}