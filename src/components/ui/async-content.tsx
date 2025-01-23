import { LoadingOverlay } from "./loading-overlay";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { AlertCircle } from "lucide-react";

interface AsyncContentProps {
  loading: boolean;
  error?: Error | null;
  children: React.ReactNode;
  loadingMessage?: string;
}

export function AsyncContent({ 
  loading, 
  error, 
  children, 
  loadingMessage 
}: AsyncContentProps) {
  if (loading) {
    return <LoadingOverlay message={loadingMessage} />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error.message || "Something went wrong. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}