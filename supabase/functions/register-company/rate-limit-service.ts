export async function checkRateLimits(
  supabase: any,
  clientIP: string,
  email: string
) {
  const { data: rateLimitCheck } = await supabase.rpc('check_registration_limit', {
    check_ip: clientIP,
    check_email: email
  });

  if (!rateLimitCheck) {
    console.log('Rate limit exceeded for IP:', clientIP);
    await recordFailedAttempt(supabase, clientIP, email);
    throw new Error('Too many registration attempts. Please try again later.');
  }
}

export async function recordFailedAttempt(
  supabase: any,
  clientIP: string,
  email: string
) {
  await supabase.from('registration_attempts').insert({
    ip_address: clientIP,
    email: email,
    success: false
  });
}

export async function recordSuccessfulAttempt(
  supabase: any,
  clientIP: string,
  email: string
) {
  await supabase.from('registration_attempts').insert({
    ip_address: clientIP,
    email: email,
    success: true
  });
}