import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { BrowserRouter } from 'react-router-dom';

export const initializeErrorMonitoring = () => {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new BrowserTracing({
          tracingOrigins: [
            'localhost',
            'easymove.app',
            /^\//,
            /^\/api/,
            /\.supabase\.co$/
          ],
          // Track child spans of pageload transactions
          markBackgroundTransactions: true,
          // Enable React Router instrumentation (fixed argument count)
          routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            BrowserRouter,
            [],
            undefined,
            undefined,
            undefined,
            {
              startTransactionOnLocationChange: true,
              startTransactionOnPageLoad: true
            }
          ),
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: 0.2, // Capture 20% of transactions
      // Session Replay for debugging
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // Performance Alerts Configuration
      beforeSend(event) {
        // Add custom alert logic for API performance
        if (event.type === 'transaction') {
          const duration = event.timestamp - event.start_timestamp;
          if (duration > 1000) { // Alert if transaction takes more than 1s
            event.level = 'warning';
          }
          if (duration > 3000) { // Alert if transaction takes more than 3s
            event.level = 'error';
          }
        }
        return event;
      },
    });
  }
};

export const reportWebVitals = ({ name, delta, id }) => {
  Sentry.addBreadcrumb({
    category: 'Web Vitals',
    message: `${name} - Delta: ${delta}`,
    level: 'info',
  });

  // Report as a custom measurement
  Sentry.captureMessage(`Web Vital: ${name}`, {
    tags: {
      webVitalId: id,
      metricName: name,
    },
    extra: {
      delta: delta,
    },
  });
};

// Performance monitoring helper
export const measurePageLoad = (pageName: string) => {
  if (import.meta.env.PROD) {
    const transaction = Sentry.startTransaction({
      name: `page-load.${pageName}`,
    });

    // Measure Web Vitals
    if ('web-vital' in performance.getEntriesByType('paint')) {
      performance.getEntriesByType('paint').forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          Sentry.captureMessage(`FCP for ${pageName}: ${entry.startTime}ms`, {
            level: 'info',
            tags: { page: pageName, metric: 'FCP' },
          });
        }
      });
    }

    // Measure TTI
    if ('interactive' in performance.timing) {
      const tti = performance.timing.domInteractive - performance.timing.navigationStart;
      Sentry.captureMessage(`TTI for ${pageName}: ${tti}ms`, {
        level: 'info',
        tags: { page: pageName, metric: 'TTI' },
      });
    }

    // Measure LCP
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      Sentry.captureMessage(`LCP for ${pageName}: ${lastEntry.startTime}ms`, {
        level: 'info',
        tags: { page: pageName, metric: 'LCP' },
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

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

// Database query performance monitoring
export const monitorDatabaseQuery = async (queryName: string, queryFn: () => Promise<any>) => {
  const startTime = performance.now();
  const transaction = Sentry.startTransaction({
    name: `db.query.${queryName}`,
  });

  try {
    const result = await queryFn();
    const duration = performance.now() - startTime;

    // Alert on slow queries
    if (duration > 500) { // Alert if query takes more than 500ms
      Sentry.captureMessage(`Slow Query: ${queryName}`, {
        level: 'warning',
        tags: {
          queryName,
          duration,
        },
      });
    }

    return result;
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        queryName,
      },
    });
    throw error;
  } finally {
    transaction.finish();
  }
};

// Edge function performance monitoring
export const monitorEdgeFunction = async (functionName: string, fn: () => Promise<any>) => {
  const startTime = performance.now();
  const transaction = Sentry.startTransaction({
    name: `edge.function.${functionName}`,
  });

  try {
    const result = await fn();
    const duration = performance.now() - startTime;

    // Alert on slow edge function execution
    if (duration > 1000) { // Alert if function takes more than 1s
      Sentry.captureMessage(`Slow Edge Function: ${functionName}`, {
        level: 'warning',
        tags: {
          functionName,
          duration,
        },
      });
    }

    return result;
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        functionName,
      },
    });
    throw error;
  } finally {
    transaction.finish();
  }
};

// Error boundary component
export const SentryErrorBoundary = Sentry.ErrorBoundary;