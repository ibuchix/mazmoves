export interface Company {
  id: string;
  name: string;
  contact_email: string;
  latitude: number;
  longitude: number;
}

export interface MoveRequest {
  id: string;
  pickup_latitude: number;
  pickup_longitude: number;
  delivery_latitude: number;
  delivery_longitude: number;
}

export interface Assignment {
  company: Company;
  distance: number;
}