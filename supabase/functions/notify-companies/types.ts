// Shared types for the notify-companies edge function.
// Updated: aligned MoveRequest with the actual move_requests schema (PostGIS
// location columns are what the matching RPC consumes — lat/lng are kept for
// convenience/logging only).

export interface Company {
  id: string;
  name: string;
  contact_email: string;
  latitude: number | null;
  longitude: number | null;
}

export interface MoveRequest {
  id: string;
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  // PostGIS geometry columns (WKB hex strings when fetched via supabase-js).
  pickup_location: unknown | null;
  delivery_location: unknown | null;
}

export interface Assignment {
  company: Company;
  distance: number;
}
