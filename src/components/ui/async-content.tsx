
import { LoadingOverlay } from "./loading-overlay";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { AlertCircle } from "lucide-react";
import { Button } from "./button";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  if (loading) {
    return <LoadingOverlay message={loadingMessage} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message || "Something went wrong. Please try again later."}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => navigate('/')}
          className="bg-brand-slate hover:bg-brand-slateLight text-white font-semibold"
        >
          Return Home
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
