export class RegistrationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'RegistrationError';
  }
}

export const REGISTRATION_ERROR_CODES = {
  RATE_LIMIT: 'rate_limit',
  DUPLICATE_EMAIL: 'duplicate_email',
  COUNTRY_NOT_SUPPORTED: 'country_not_supported',
  VERIFICATION_FAILED: 'verification_failed',
  UNKNOWN: 'unknown'
} as const;

export function handleRegistrationError(error: any): RegistrationError {
  console.error('Registration error:', error);

  if (error.message?.includes('rate limit')) {
    return new RegistrationError(
      'Too many registration attempts. Please try again later.',
      REGISTRATION_ERROR_CODES.RATE_LIMIT
    );
  }
  
  if (error.message?.includes('already exists')) {
    return new RegistrationError(
      'An account with this email already exists.',
      REGISTRATION_ERROR_CODES.DUPLICATE_EMAIL
    );
  }
  
  if (error.message?.includes('country')) {
    return new RegistrationError(
      'Registration is not available in your country.',
      REGISTRATION_ERROR_CODES.COUNTRY_NOT_SUPPORTED
    );
  }

  if (error.message?.includes('verification failed')) {
    return new RegistrationError(
      'Registration verification failed. Please try again.',
      REGISTRATION_ERROR_CODES.VERIFICATION_FAILED
    );
  }

  return new RegistrationError(
    'An unexpected error occurred during registration.',
    REGISTRATION_ERROR_CODES.UNKNOWN,
    error
  );
}