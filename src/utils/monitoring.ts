import * as Sentry from '@sentry/react';

export const initializeErrorMonitoring = () => {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new Sentry.BrowserTracing(),
      ],
      // Performance Monitoring
      tracesSampleRate: 0.2, // Capture 20% of transactions for performance monitoring
      // Session Replay
      replaysSessionSampleRate: 0.1, // Sample rate for session replay
      replaysOnErrorSampleRate: 1.0, // Sample rate when errors occur

      // Configure alert rules
      beforeSend(event) {
        // Add custom alert logic for email-related errors
        if (event.tags?.errorType === 'email_match_failure') {
          // Set highest priority for email matching issues
          event.level = 'error';
        }
        return event;
      },
    });
  }
};

// Performance monitoring helper
export const measurePageLoad = (pageName: string) => {
  if (import.meta.env.PROD) {
    const transaction = Sentry.startTransaction({
      name: `page-load.${pageName}`,
    });

    // Measure page-specific metrics
    const pageLoadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
    Sentry.captureMessage(`Page Load Time for ${pageName}: ${pageLoadTime}ms`, {
      level: 'info',
      tags: {
        page: pageName,
        loadTime: pageLoadTime,
      },
    });

    transaction.finish();
  }
};

// Error boundary component
export const SentryErrorBoundary = Sentry.ErrorBoundary;