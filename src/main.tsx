import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { initializeErrorMonitoring, SentryErrorBoundary, reportWebVitals } from './utils/monitoring'

// Initialize error monitoring in production
initializeErrorMonitoring();

const root = createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <SentryErrorBoundary fallback={<div>An error has occurred</div>}>
        <App />
      </SentryErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
)

// Report web vitals
if (import.meta.env.PROD) {
  const reportWebVital = (metric: any) => {
    reportWebVitals(metric);
  };

  // @ts-ignore - web-vitals types are not included
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(reportWebVital);
    getFID(reportWebVital);
    getFCP(reportWebVital);
    getLCP(reportWebVital);
    getTTFB(reportWebVital);
  });
}