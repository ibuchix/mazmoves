import { opencage } from 'opencage-api-client';
import { Address } from '@/types/address';

const OPENCAGE_API_KEY = 'YOUR_API_KEY'; // We'll move this to Supabase secrets

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export async function geocodeAddress(address: Address): Promise<Coordinates> {
  const addressString = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  
  try {
    const response = await opencage.geocode({ q: addressString, key: OPENCAGE_API_KEY });
    
    if (response.results.length > 0) {
      const { lat, lng } = response.results[0].geometry;
      return {
        latitude: lat,
        longitude: lng
      };
    }
    throw new Error('No results found for address');
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
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