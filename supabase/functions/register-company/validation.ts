export interface RegistrationData {
  email: string;
  password: string;
  companyName: string;
  registrationNumber: string;
  phone: string;
  managerName: string;
  address: any;
  transitInsurance: File;
  liabilityInsurance: File;
}

export function validateRegistrationData(formData: FormData): RegistrationData | null {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const companyName = formData.get('name') as string;
  const registrationNumber = formData.get('registrationNumber') as string;
  const phone = formData.get('phone') as string;
  const managerName = formData.get('managerName') as string;
  const address = JSON.parse(formData.get('address') as string);
  const transitInsurance = formData.get('transitInsurance') as File;
  const liabilityInsurance = formData.get('liabilityInsurance') as File;

  if (!email || !password || !companyName || !registrationNumber || !phone || !managerName || !address) {
    return null;
  }

  return {
    email,
    password,
    companyName,
    registrationNumber,
    phone,
    managerName,
    address,
    transitInsurance,
    liabilityInsurance
  };
}