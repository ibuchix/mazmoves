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
}

export interface CompanyDashboardStats {
  active: number;
  completed: number;
  cancelled: number;
  pending: number;
}