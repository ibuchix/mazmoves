interface Coordinates {
  latitude: number;
  longitude: number;
}

export async function geocodeAddress(address: any): Promise<Coordinates | null> {
  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`
      )}&key=${Deno.env.get('OPENCAGE_API_KEY')}`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return {
        latitude: data.results[0].geometry.lat,
        longitude: data.results[0].geometry.lng
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}