
export interface CompanyRegistrationData {
  name: string
  registration_number: string
  contact_email: string
  contact_phone: string
  business_address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  manager_name: string
  password: string
  auth_user_id?: string
  latitude?: number | null
  longitude?: number | null
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

