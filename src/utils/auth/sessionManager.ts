import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type AuthEvent = 'SIGNED_OUT' | 'PASSWORD_RECOVERY' | 'SIGNED_IN' | 'TOKEN_REFRESHED';

export function handleAuthEvent(event: AuthEvent, session: Session | null) {
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
}

export async function resendVerificationEmail(session: Session | null) {
  try {
    if (!session?.user?.email) {
      toast.error("No email address found");
      return;
    }

    const { allowed } = await checkVerificationRateLimit(session.user.email);

    if (!allowed) {
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
}