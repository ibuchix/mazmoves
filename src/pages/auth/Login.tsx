import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });
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
            providers={[]}
          />
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help? <a href="#" className="text-[#1f3dd2] hover:underline">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
}