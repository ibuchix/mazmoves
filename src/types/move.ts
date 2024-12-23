import { Address } from "./address";
import { Tables } from "./database";

export type MoveRequest = Omit<Tables['move_requests']['Row'], 'pickup_address' | 'delivery_address'> & {
  pickup_address: Address;
  delivery_address: Address;
};

export type MoveAssignment = Tables['move_assignments']['Row'];

export type MoveAssignmentWithRequest = MoveAssignment & {
  move_requests: MoveRequest;
};