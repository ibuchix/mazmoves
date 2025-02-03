import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface RegistrationAlertProps {
  error: string | null;
}

export function RegistrationAlert({ error }: RegistrationAlertProps) {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {error === 'duplicate_email' 
          ? 'This email is already registered. Please use a different email or login to your existing account.'
          : error === 'country_not_supported'
          ? 'Registration is not available in your country at this time.'
          : 'An error occurred during registration. Please try again.'}
      </AlertDescription>
    </Alert>
  );
}