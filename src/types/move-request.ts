
import { Address } from "./address";

export type MoveType = "domestic" | "commercial" | "international";
export type PropertySize = "1" | "2" | "3" | "4" | "5+" | "office" | "warehouse" | "retail";
export type RequestStatus = "pending" | "assigned" | "in_progress" | "completed" | "cancelled" | "no_companies_found";

export interface MoveRequestForm {
  moveType: MoveType;
  propertySize: PropertySize;
  pickupAddress: Address;
  deliveryAddress: Address;
  moveDate: string;
  fullName: string;
  email: string;
  phone: string;
  specialInstructions?: string;
}
