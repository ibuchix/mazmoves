
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { initializeErrorMonitoring, SentryErrorBoundary } from './utils/monitoring'
import { AsyncContent } from './components/ui/async-content'
import { Button } from './components/ui/button'
import { useNavigate } from 'react-router-dom'

// Initialize error monitoring in production
initializeErrorMonitoring();

const ErrorFallback = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center space-y-6 max-w-md">
        <h2 className="text-2xl font-bold text-[#040480]">Oops! An error has occurred</h2>
        <p className="text-gray-600">
          We apologize for the inconvenience. Please try returning to the home page.
        </p>
        <Button 
          onClick={() => navigate('/')}
          className="bg-[#040480] hover:bg-[#1f3dd2] text-white font-semibold"
        >
          Return Home
        </Button>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <SentryErrorBoundary fallback={<ErrorFallback />}>
        <App />
      </SentryErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
)
