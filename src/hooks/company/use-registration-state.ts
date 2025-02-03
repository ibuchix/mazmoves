import { useState } from "react";

export function useRegistrationState() {
  const [uploading, setUploading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);

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