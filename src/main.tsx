
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import './index.css'
import { initializeErrorMonitoring, SentryErrorBoundary } from './utils/monitoring'
import { AsyncContent } from './components/ui/async-content'
import { Button } from './components/ui/button'
import { useNavigate } from 'react-router-dom'

// Initialize error monitoring in production
initializeErrorMonitoring();

// Script loading with retry logic
function loadScript(src: string, retries = 3): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => {
      if (retries > 0) {
        console.log(`Retrying script load: ${src}, ${retries} attempts remaining`);
        setTimeout(() => {
          script.remove(); // Remove failed script
          loadScript(src, retries - 1)
            .then(resolve)
            .catch(reject);
        }, 1000);
      } else {
        reject(new Error(`Failed to load script ${src}`));
      }
    };
    document.head.appendChild(script);
  });
}

// Chunk loading error handler
window.addEventListener('error', (event) => {
  if (event.message === 'Loading chunk failed') {
    console.error('Chunk loading failed, attempting retry...');
    event.preventDefault();
    loadScript(event.filename as string)
      .catch((error) => {
        console.error('Final chunk load attempt failed:', error);
      });
  }
}, true);

const ErrorFallback = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center space-y-6 max-w-md">
        <h2 className="text-2xl font-bold text-brand-slate">Oops! An error has occurred</h2>
        <p className="text-gray-600">
          We apologize for the inconvenience. Please try returning to the home page.
        </p>
        <Button 
          onClick={() => navigate('/')}
          className="bg-brand-slate hover:bg-brand-slateLight text-white font-semibold"
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
    <HelmetProvider>
      <BrowserRouter>
        <SentryErrorBoundary fallback={<ErrorFallback />}>
          <App />
        </SentryErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)

