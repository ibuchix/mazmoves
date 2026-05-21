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
  // Extra context used to build the company notification email body.
  pickup_address?: Record<string, unknown> | null;
  delivery_address?: Record<string, unknown> | null;
  requested_date?: string | null;
  move_type?: string | null;
  estimated_size?: string | null;
  pending_review?: boolean | null;
}

export interface Assignment {
  company: Company;
  distance: number;
}
