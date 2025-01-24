import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { initializeErrorMonitoring, SentryErrorBoundary } from './utils/monitoring'

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