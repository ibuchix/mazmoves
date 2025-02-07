
import { CompanyRegistrationData } from './types.ts';

export async function checkExistingCompany(supabase: any, email: string) {
  const { data: existingCompany } = await supabase
    .from('companies')
    .select('id')
    .eq('contact_email', email.toLowerCase())
    .single();

  if (existingCompany) {
    throw new Error('A company with this email already exists');
  }
}

export async function registerCompany(supabase: any, companyData: CompanyRegistrationData) {
  const { data: company, error: registerError } = await supabase.rpc(
    'register_company',
    {
      company_data: companyData
    }
  );

  if (registerError) {
    console.error('Company creation failed:', registerError);
    throw new Error(registerError.message);
  }

  return company;
}

export async function sendWelcomeEmail(supabase: any, companyId: string, email: string, companyName: string) {
  const emailResponse = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-welcome-email`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        companyId,
        email,
        companyName
      })
    }
  );

  if (!emailResponse.ok) {
    console.warn('Welcome email trigger failed:', await emailResponse.text());
  }
}

