
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}

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
