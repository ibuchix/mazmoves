import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleAuthEvent, resendVerificationEmail } from "@/utils/auth/sessionManager";

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

  useEffect(() => {
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
      handleAuthEvent(event as any, session);
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
    <AuthContext.Provider value={{ 
      session, 
      loading, 
      resendVerificationEmail: () => resendVerificationEmail(session) 
    }}>
      {children}
    </AuthContext.Provider>
  );
}