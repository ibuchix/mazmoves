import { Address } from '@/types/address';
import { supabase } from '@/integrations/supabase/client';

export interface Coordinates {
  latitude: number;
  longitude: number;
  location?: any; // PostGIS geometry type
}

export async function geocodeAddress(address: Address): Promise<Coordinates> {
  const addressString = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}${address.country ? `, ${address.country}` : ''}`;
  
  try {
    const { data, error } = await supabase.functions.invoke('geocode-address', {
      body: { address: addressString }
    });
    
    if (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
    
    if (!data || !data.latitude || !data.longitude) {
      throw new Error('No coordinates found for address');
    }

    return {
      latitude: data.latitude,
      longitude: data.longitude,
      location: data.location
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

export function calculateDistance(point1: Coordinates, point2: Coordinates): number {
  const R = 3959; // Earth's radius in miles
  const lat1 = toRadians(point1.latitude);
  const lat2 = toRadians(point2.latitude);
  const deltaLat = toRadians(point2.latitude - point1.latitude);
  const deltaLon = toRadians(point2.longitude - point1.longitude);

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}