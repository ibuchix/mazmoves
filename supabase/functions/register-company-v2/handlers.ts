
import { corsHeaders } from "../_shared/cors.ts";
import { CompanyRegistrationData } from "./types.ts";
import { validateCompanyData } from "./validation.ts";
import { createAuthUser, deleteAuthUser } from "./auth.ts";
import { checkExistingCompany, registerCompany, sendWelcomeEmail } from "./company.ts";
import { handleRegistrationAttempt } from "./tracking.ts";

export async function handleRegistration(req: Request, supabase: any) {
  let companyData: Partial<CompanyRegistrationData>;
  
  try {
    const rawData = await req.text();
    console.log('Raw request data:', rawData);
    companyData = JSON.parse(rawData);
    
    // Log registration attempt
    await handleRegistrationAttempt(supabase, {
      email: companyData.contact_email,
      clientIp: req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown',
      attemptData: companyData
    });

  } catch (error) {
    console.error('Registration failed: Invalid JSON payload', { error });
    throw new Error('Invalid request format');
  }

  // Validate company data
  const { isValid, errors } = validateCompanyData(companyData);
  if (!isValid) {
    console.error('Registration failed: Validation errors', { errors });
    throw new Error('Validation failed: ' + errors.join(', '));
  }

  // Check for existing company
  await checkExistingCompany(supabase, companyData.contact_email!);

  // Create auth user
  const user = await createAuthUser(supabase, companyData.contact_email!, companyData.password!);
  console.log('Auth user created:', user.id);

  try {
    // Create company record
    const company = await registerCompany(supabase, {
      ...companyData as CompanyRegistrationData,
      auth_user_id: user.id
    });
    console.log('Company record created:', company.id);

    // Send welcome email (non-blocking)
    try {
      await sendWelcomeEmail(
        supabase,
        company.id,
        companyData.contact_email!,
        companyData.name!
      );
      console.log('Welcome email sent successfully');
    } catch (emailError) {
      console.warn('Welcome email failed but registration completed:', emailError);
    }

    return {
      success: true,
      company: {
        id: company.id,
        name: companyData.name,
        email: companyData.contact_email
      }
    };

  } catch (error) {
    // Clean up auth user on failure
    try {
      await deleteAuthUser(supabase, user.id);
      console.log('Auth user cleaned up after failed registration');
    } catch (cleanupError) {
      console.error('Failed to clean up auth user:', cleanupError);
    }
    throw error;
  }
}
