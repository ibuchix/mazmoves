
import { CompanyRegistrationData, ValidationResult } from './types.ts';

export function validateCompanyData(data: Partial<CompanyRegistrationData>): ValidationResult {
  const errors: string[] = [];

  // Required field checks
  if (!data.name?.trim()) errors.push("Company name is required");
  if (!data.registration_number?.trim()) errors.push("Registration number is required");
  if (!data.contact_email?.trim()) errors.push("Contact email is required");
  if (!data.contact_phone?.trim()) errors.push("Contact phone is required");
  if (!data.business_address) errors.push("Business address is required");
  else {
    if (!data.business_address.street?.trim()) errors.push("Street address is required");
    if (!data.business_address.city?.trim()) errors.push("City is required");
    if (!data.business_address.state?.trim()) errors.push("State is required");
    if (!data.business_address.zipCode?.trim()) errors.push("Zip code is required");
  }
  if (!data.manager_name?.trim()) errors.push("Manager name is required");
  if (!data.password?.trim()) errors.push("Password is required");

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.contact_email && !emailRegex.test(data.contact_email)) {
    errors.push("Invalid email format");
  }

  // Phone number format validation (basic check)
  const phoneRegex = /^\+?[\d\s-]{8,}$/;
  if (data.contact_phone && !phoneRegex.test(data.contact_phone)) {
    errors.push("Invalid phone number format");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

