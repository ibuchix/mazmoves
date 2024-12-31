export interface AdminDashboardData {
  company_id: string;
  company_name: string;
  contact_email: string;
  registration_status: 'pending' | 'approved' | 'rejected';
  registration_date: string;
  is_verified: boolean;
  subscription_status: 'trial' | 'active' | 'suspended' | 'terminated';
  last_payment_date: string | null;
  total_assignments: number;
  active_assignments: number;
  completed_assignments: number;
  total_payments: number;
  total_paid_amount: number; // Changed from string to number to match database
}