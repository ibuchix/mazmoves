
interface RegistrationAttempt {
  email: string | undefined;
  clientIp: string;
  attemptData: any;
}

export async function handleRegistrationAttempt(supabase: any, attempt: RegistrationAttempt) {
  try {
    await supabase.rpc('log_registration_attempt', {
      email: attempt.email,
      client_ip: attempt.clientIp,
      attempt_data: attempt.attemptData
    });

    console.log('Registration attempt logged for:', attempt.email);
  } catch (error) {
    console.error('Failed to log registration attempt:', error);
    // Don't throw error as this is non-critical
  }
}
