
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check for redirect response
    const handleAuthRedirect = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error during auth redirect:', error);
        return;
      }

      if (session) {
        // If user is already logged in, redirect to home
        navigate("/");
      }
    };

    handleAuthRedirect();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F9FF] to-[#FFFFFF]">
      <div className="max-w-md w-full p-10 bg-white rounded-xl shadow-xl">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-[#040480]">Company Login</h1>
          <p className="text-gray-600">
            Access your company dashboard
          </p>
        </div>
        
        <div className="space-y-6">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#040480',
                    brandAccent: '#1f3dd2',
                    inputBackground: 'white',
                    inputBorder: '#e2e8f0',
                    inputBorderHover: '#1f3dd2',
                    inputBorderFocus: '#1f3dd2',
                  },
                  radii: {
                    buttonBorderRadius: '0.5rem',
                    inputBorderRadius: '0.5rem',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'auth-button',
                input: 'auth-input',
                label: 'text-sm font-medium text-gray-700',
              },
            }}
            theme="light"
            providers={[]} // Remove all social login providers
            view="sign_in" // Only show sign in view
            showLinks={false} // This will remove the additional links like "Forgot password" and "Sign up"
          />
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Don't have an account? <Link to="/company/register" className="text-[#1f3dd2] hover:underline font-semibold">Sign up here</Link>
          </p>
          <p className="text-sm text-gray-600 mb-4">
            <Link to="/auth/forgot-password" className="text-[#1f3dd2] hover:underline font-semibold">Forgot your password?</Link>
          </p>
          <p className="text-sm text-gray-600">
            Need help? <a href="mailto:support@housemove.com" className="text-[#1f3dd2] hover:underline font-semibold">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
}
