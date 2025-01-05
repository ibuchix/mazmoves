import { Address } from "@/types/address";

export interface Coordinates {
  latitude: number;
  longitude: number;
  location?: any; // PostGIS geometry type
}

export async function geocodeAddress(address: Address): Promise<Coordinates> {
  try {
    const addressString = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
    console.log('Geocoding address:', addressString);

    const response = await fetch('/functions/v1/geocode-address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address: addressString }),
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed with status: ${response.status}`);
    }

    const data = await response.json();
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