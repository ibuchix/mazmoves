import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AuthContext = createContext<{
  session: Session | null;
  loading: boolean;
  resendVerificationEmail: () => Promise<void>;
}>({
  session: null,
  loading: true,
  resendVerificationEmail: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle verification errors and rate limiting
  const resendVerificationEmail = async () => {
    try {
      if (!session?.user?.email) {
        toast.error("No email address found");
        return;
      }

      // Get client IP for rate limiting
      const { data: { ip_address } } = await supabase.functions.invoke('get-client-ip');

      // Check rate limit before sending
      const { data: rateCheck, error: rateError } = await supabase.rpc(
        'check_verification_rate_limit',
        { 
          p_email: session.user.email,
          p_ip: ip_address 
        }
      );

      if (rateError) throw rateError;

      if (!rateCheck) {
        toast.error("Too many verification attempts", {
          description: "Please wait before requesting another verification email",
          duration: 5000
        });
        return;
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: session.user.email,
      });

      if (error) throw error;

      toast.success("Verification email sent", {
        description: "Please check your inbox",
        duration: 5000
      });
    } catch (error: any) {
      console.error("Error resending verification email:", error);
      
      // Handle different error cases without exposing sensitive info
      if (error.message?.includes('rate limit')) {
        toast.error("Too many attempts", {
          description: "Please wait a while before trying again",
          duration: 5000
        });
      } else if (error.message?.includes('network')) {
        toast.error("Network error", {
          description: "Please check your internet connection and try again",
          duration: 5000
        });
      } else {
        toast.error("Failed to send verification email", {
          description: "Please try again later",
          duration: 5000
        });
      }
    }
  };

  useEffect(() => {
    // Enhanced session management
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;

      if (error) {
        console.error("Error fetching session:", error);
        toast.error("Authentication error", {
          description: "Please try logging in again",
          duration: 5000
        });
      }
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Handle different auth events
      switch (event) {
        case 'SIGNED_OUT':
          toast.info("Signed out successfully");
          break;
        case 'PASSWORD_RECOVERY':
          toast.info("Password reset email sent");
          break;
        case 'SIGNED_IN':
          if (session?.user?.email_confirmed_at) {
            toast.success("Signed in successfully");
          }
          break;
        case 'TOKEN_REFRESHED':
          if (!session) {
            toast.error("Session expired", {
              description: "Please login again",
              duration: 5000
            });
          }
          break;
      }

      setSession(session);
      setLoading(false);
    });

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, resendVerificationEmail }}>
      {children}
    </AuthContext.Provider>
  );
}