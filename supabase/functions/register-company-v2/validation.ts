
import { CompanyRegistrationData, ValidationResult } from './types.ts';

interface ValidationRule {
  field: string;
  validate: (value: any) => boolean;
  message: string;
}

const validationRules: ValidationRule[] = [
  {
    field: 'name',
    validate: (value) => !!value?.trim(),
    message: "Company name is required"
  },
  {
    field: 'registration_number',
    validate: (value) => !!value?.trim(),
    message: "Registration number is required"
  },
  {
    field: 'contact_email',
    validate: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return value?.trim() && emailRegex.test(value);
    },
    message: "Valid contact email is required"
  },
  {
    field: 'contact_phone',
    validate: (value) => {
      const phoneRegex = /^\+?[\d\s-]{8,}$/;
      return value?.trim() && phoneRegex.test(value);
    },
    message: "Valid contact phone is required"
  },
  {
    field: 'manager_name',
    validate: (value) => !!value?.trim(),
    message: "Manager name is required"
  },
  {
    field: 'password',
    validate: (value) => !!value?.trim(),
    message: "Password is required"
  }
];

const addressValidationRules: ValidationRule[] = [
  {
    field: 'street',
    validate: (value) => !!value?.trim(),
    message: "Street address is required"
  },
  {
    field: 'city',
    validate: (value) => !!value?.trim(),
    message: "City is required"
  },
  {
    field: 'state',
    validate: (value) => !!value?.trim(),
    message: "State is required"
  },
  {
    field: 'zipCode',
    validate: (value) => !!value?.trim(),
    message: "Zip code is required"
  }
];

export function validateCompanyData(data: Partial<CompanyRegistrationData>): ValidationResult {
  const errors: string[] = [];

  // Validate main fields
  validationRules.forEach(rule => {
    if (!rule.validate(data[rule.field as keyof CompanyRegistrationData])) {
      errors.push(rule.message);
    }
  });

  // Validate address fields
  if (!data.business_address) {
    errors.push("Business address is required");
  } else {
    addressValidationRules.forEach(rule => {
      if (!rule.validate(data.business_address?.[rule.field as keyof typeof data.business_address])) {
        errors.push(rule.message);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
