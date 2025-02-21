
import { supabase } from "@/integrations/supabase/client";
import { CompanyRegistrationForm } from "@/types/company";

export async function registerCompany(data: CompanyRegistrationForm) {
  try {
    console.log('Registration service started with data:', { 
      name: data.name,
      email: data.email,
      registrationNumber: data.registrationNumber,
      hasAddress: !!data.address,
      addressFields: Object.keys(data.address || {})
    });

    // First, create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Failed to create user account');
    }

    console.log('Auth user created successfully');

    // Format company data
    const companyData = {
      name: data.name,
      registration_number: data.registrationNumber || null,
      contact_email: data.email,
      contact_phone: data.phone,
      business_address: {
        street: data.address.street,
        city: data.address.city,
        state: data.address.state,
        zipCode: data.address.zipCode
      },
      manager_name: data.managerName,
      auth_user_id: authData.user.id,
      is_verified: false, // Companies start unverified
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
      
      // Try to clean up the auth user if company creation fails
      await supabase.auth.signOut();
      
      if (companyError.code === '23505') { // Unique violation
        throw new Error('A company with this email already exists');
      }
      throw new Error(companyError.message);
    }

    console.log('Company record created:', company);

    // Create user record with company role
    const { error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: data.email,
        full_name: data.managerName, // Use manager name as full name
        role: 'company' as const, // Explicitly type as "company"
        is_active: true
      }]);

    if (userError) {
      console.error('User record creation error:', userError);
      throw new Error('Failed to set up user profile');
    }

    // Try to send welcome email through edge function as final step
    try {
      await supabase.functions.invoke('send-welcome-email', {
        body: { 
          companyId: company.id,
          email: data.email,
          companyName: data.name
        }
      });
    } catch (emailError) {
      // Don't fail registration if email fails
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
