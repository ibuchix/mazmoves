export interface CompanyRegistrationForm {
  name: string;
  registrationNumber: string;
  vatNumber?: string;
  email: string;
  password: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  managerName: string;
  country: string; // JSON string containing {code: string, name: string}
  country_code?: string; // Added for database compatibility
  country_name?: string; // Added for database compatibility
}

export interface CompanyDashboardStats {
  active: number;
  completed: number;
  cancelled: number;
  pending: number;
}

export interface InsuranceType {
  id: string;
  name: string;
  description: string;
}