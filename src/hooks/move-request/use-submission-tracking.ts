
import { useToast } from "@/hooks/use-toast";
import { MoveRequestForm } from "@/types/move-request";
import * as Sentry from '@sentry/react';

export function useSubmissionTracking() {
  const { toast } = useToast();

  const logSubmissionAttempt = (data: MoveRequestForm) => {
    // Log to console for development
    console.log('Submission attempt:', {
      timestamp: new Date().toISOString(),
      formData: {
        ...data,
        // Mask sensitive information
        email: data.email ? '[REDACTED]' : undefined,
        phone: data.phone ? '[REDACTED]' : undefined
      }
    });

    // Track in Sentry
    Sentry.captureMessage('Move request submission attempt', {
      level: 'info',
      tags: {
        moveType: data.moveType,
        propertySize: data.propertySize,
        hasSpecialInstructions: !!data.specialInstructions
      }
    });
  };

  const logSubmissionError = (error: any) => {
    console.error('Submission error:', {
      timestamp: new Date().toISOString(),
      error: error?.message || 'Unknown error'
    });

    // Track error in Sentry
    Sentry.captureException(error, {
      tags: {
        errorType: 'submission_failure'
      }
    });

    toast({
      title: "Submission Error",
      description: "There was an error submitting your request. Please try again.",
      variant: "destructive",
    });
  };

  const logSubmissionSuccess = () => {
    console.log('Submission successful:', {
      timestamp: new Date().toISOString()
    });

    // Track success in Sentry
    Sentry.captureMessage('Move request submitted successfully', {
      level: 'info',
      tags: {
        event: 'submission_success'
      }
    });
  };

  return {
    logSubmissionAttempt,
    logSubmissionError,
    logSubmissionSuccess
  };
}
