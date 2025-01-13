import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initializeErrorMonitoring, SentryErrorBoundary } from './utils/monitoring'

// Initialize error monitoring in production
initializeErrorMonitoring();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SentryErrorBoundary fallback={<div>An error has occurred</div>}>
      <App />
    </SentryErrorBoundary>
  </React.StrictMode>,
)