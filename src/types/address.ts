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