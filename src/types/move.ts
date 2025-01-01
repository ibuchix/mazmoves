import { Address, addressFromJson } from "./address";
import { Tables } from "./database";

export type MoveRequest = Omit<Tables['move_requests']['Row'], 'pickup_address' | 'delivery_address'> & {
  pickup_address: Address;
  delivery_address: Address;
};

export type MoveAssignment = Tables['move_assignments']['Row'];

export type MoveAssignmentWithRequest = Omit<MoveAssignment, 'move_requests'> & {
  move_requests: MoveRequest;
};

// Helper function to transform database response to typed MoveRequest
export const transformMoveRequest = (dbMoveRequest: Tables['move_requests']['Row']): MoveRequest => {
  return {
    ...dbMoveRequest,
    pickup_address: addressFromJson(dbMoveRequest.pickup_address),
    delivery_address: addressFromJson(dbMoveRequest.delivery_address),
  };
};

// Helper function to transform database response to typed MoveAssignmentWithRequest
export const transformMoveAssignment = (dbAssignment: any): MoveAssignmentWithRequest => {
  return {
    ...dbAssignment,
    move_requests: transformMoveRequest(dbAssignment.move_requests),
  };
};