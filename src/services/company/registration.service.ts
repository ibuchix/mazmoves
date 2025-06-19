
import { supabase } from "@/integrations/supabase/client";
import { CompanyRegistrationForm } from "@/types/company";
import { InputValidator } from "@/utils/validation/input-validator";
import { RateLimiter } from "@/utils/security/rate-limiter";
import { AuditLogger } from "@/utils/security/audit-logger";

export async function registerCompany(data: CompanyRegistrationForm) {
  try {
    console.log('Registration service started with enhanced security');

    // Enhanced input validation
    const emailValidation = InputValidator.validateEmail(data.email);
    if (!emailValidation.isValid) {
      await AuditLogger.logSecurityEvent('invalid_email_attempt', { email: data.email }, 'medium');
      throw new Error(emailValidation.message);
    }

    const phoneValidation = InputValidator.validatePhone(data.phone);
    if (!phoneValidation.isValid) {
      await AuditLogger.logSecurityEvent('invalid_phone_attempt', { phone: data.phone }, 'low');
      throw new Error(phoneValidation.message);
    }

    const nameValidation = InputValidator.validateCompanyName(data.name);
    if (!nameValidation.isValid) {
      await AuditLogger.logSecurityEvent('invalid_company_name', { name: data.name }, 'low');
      throw new Error(nameValidation.message);
    }

    // Enhanced address validation
    const addressValidation = InputValidator.validateAddress(data.address.street);
    if (!addressValidation.isValid) {
      await AuditLogger.logSecurityEvent('invalid_address_attempt', { address: data.address }, 'low');
      throw new Error(addressValidation.message);
    }

    // Check rate limit
    const rateLimitConfig = RateLimiter.CONFIGS.REGISTRATION(data.email);
    const rateCheck = await RateLimiter.checkLimit(rateLimitConfig);
    
    if (!rateCheck.allowed) {
      await AuditLogger.logSecurityEvent('rate_limit_exceeded', { 
        email: data.email, 
        action: 'registration' 
      }, 'high');
      throw new Error('Too many registration attempts. Please try again later.');
    }

    // Record the attempt
    await RateLimiter.recordAttempt(rateLimitConfig);

    // Sanitize all inputs
    const sanitizedData = {
      ...data,
      name: InputValidator.sanitizeText(data.name, 100),
      managerName: InputValidator.sanitizeText(data.managerName, 100),
      address: {
        street: InputValidator.sanitizeText(data.address.street, 100),
        city: InputValidator.sanitizeText(data.address.city, 50),
        state: InputValidator.sanitizeText(data.address.state, 50),
        zipCode: InputValidator.sanitizeText(data.address.zipCode, 10)
      }
    };

    // Create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: sanitizedData.email,
      password: data.password,
    });

    if (authError) {
      await AuditLogger.logAuthEvent('registration_failed', false, { 
        error: authError.message,
        email: sanitizedData.email 
      });
      throw new Error(authError.message);
    }

    if (!authData.user) {
      await AuditLogger.logAuthEvent('registration_failed', false, { 
        error: 'No user created',
        email: sanitizedData.email 
      });
      throw new Error('Failed to create user account');
    }

    // Format company data
    const companyData = {
      name: sanitizedData.name,
      registration_number: sanitizedData.registrationNumber || null,
      contact_email: sanitizedData.email,
      contact_phone: sanitizedData.phone,
      business_address: sanitizedData.address,
      manager_name: sanitizedData.managerName,
      auth_user_id: authData.user.id,
      is_verified: false,
      status: 'pending' as const
    };

    // Create company record
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert([companyData])
      .select()
      .single();

    if (companyError) {
      console.error('Company creation error:', companyError);
      
      // Clean up auth user if company creation fails
      await supabase.auth.signOut();
      
      await AuditLogger.logSecurityEvent('company_creation_failed', {
        error: companyError.message,
        email: sanitizedData.email
      }, 'medium');
      
      if (companyError.code === '23505') {
        throw new Error('A company with this email already exists');
      }
      throw new Error(companyError.message);
    }

    // Create user record
    const { error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: sanitizedData.email,
        full_name: sanitizedData.managerName,
        role: 'company' as const,
        is_active: true
      }]);

    if (userError) {
      await AuditLogger.logSecurityEvent('user_profile_creation_failed', {
        error: userError.message,
        userId: authData.user.id
      }, 'medium');
      throw new Error('Failed to set up user profile');
    }

    // Log successful registration
    await AuditLogger.logAuthEvent('registration_success', true, {
      companyId: company.id,
      email: sanitizedData.email
    });

    // Try to send welcome email
    try {
      await supabase.functions.invoke('send-welcome-email', {
        body: { 
          companyId: company.id,
          email: sanitizedData.email,
          companyName: sanitizedData.name
        }
      });
    } catch (emailError) {
      console.warn('Welcome email failed to send:', emailError);
    }

    return {
      success: true,
      company: {
        id: company.id,
        name: company.name,
        email: company.contact_email
      }
    };

  } catch (error: any) {
    console.error('Registration service error:', error);
    
    await AuditLogger.logSecurityEvent('registration_error', {
      error: error.message,
      email: data.email
    }, 'medium');
    
    if (typeof error.message === 'string') {
      if (error.message.includes('already exists')) {
        throw new Error('A company with this email already exists');
      }
      if (error.message.includes('rate limit')) {
        throw new Error('Too many registration attempts. Please try again later');
      }
    }
    
    throw new Error(error.message || 'An unexpected error occurred during registration');
  }
}
