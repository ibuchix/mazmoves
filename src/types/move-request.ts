// move-request.ts
// Shared types for the move request and the calculator wizard.
// Added CommercialPremises / CommercialScale / CommercialProfile so the
// calculator can capture commercial moves with two questions (premises +
// scale) instead of the old single radio choice.

import { Address } from "./address";

export type MoveType = "domestic" | "commercial" | "international";
export type PropertySize = "1" | "2" | "3" | "4" | "5+" | "office" | "warehouse" | "retail" | "business";
export type RequestStatus = "pending" | "assigned" | "in_progress" | "completed" | "cancelled" | "no_companies_found";

export type CommercialPremises = "office" | "retail" | "warehouse" | "industrial" | "other";
export type CommercialScale = "small" | "medium" | "large" | "enterprise";
export interface CommercialProfile {
  premisesType: CommercialPremises;
  scale: CommercialScale;
}

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
