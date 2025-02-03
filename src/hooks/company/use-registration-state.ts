import { useState } from "react";

export function useRegistrationState() {
  const [uploading, setUploading] = useState<boolean>(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitExceeded, setRateLimitExceeded] = useState<boolean>(false);

  const resetError = () => setError(null);
  const resetRateLimit = () => setRateLimitExceeded(false);

  return {
    uploading,
    setUploading,
    showSuccessDialog,
    setShowSuccessDialog,
    error,
    setError,
    resetError,
    rateLimitExceeded,
    setRateLimitExceeded,
    resetRateLimit
  };
}