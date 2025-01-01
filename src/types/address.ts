import { Json } from "@/integrations/supabase/types";

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

// Helper function to convert Address to Json type
export const addressToJson = (address: Address): Json => {
  return address as unknown as Json;
};

// Helper function to convert Json to Address type
export const addressFromJson = (json: Json): Address => {
  if (typeof json !== 'object' || !json) {
    throw new Error('Invalid address JSON');
  }
  
  const address = json as any;
  return {
    street: address.street || '',
    city: address.city || '',
    state: address.state || '',
    zipCode: address.zipCode || '',
    country: address.country,
  };
};