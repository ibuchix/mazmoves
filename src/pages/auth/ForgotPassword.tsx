import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check rate limit before proceeding
      const { data: rateCheck, error: rateError } = await supabase.rpc(
        'check_password_reset_rate_limit',
        { p_email: email }
      );

      if (rateError) throw rateError;

      if (!rateCheck) {
        toast.error("Too many reset attempts. Please try again later.");
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast.success("Check your email for the password reset link");
      navigate("/login");
    } catch (error: any) {
      // Don't expose whether email exists for security
      if (error.message?.toLowerCase().includes('email not found')) {
        toast.success("If an account exists with this email, you will receive a reset link");
      } else {
        toast.error(error.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F9FF] to-[#FFFFFF]">
      <div className="max-w-md w-full p-10 bg-white rounded-xl shadow-xl">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-[#040480]">Reset Password</h1>
          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 w-full"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#040480] hover:bg-[#1f3dd2] text-white"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => navigate("/login")}
              className="text-[#1f3dd2] hover:text-[#84d21f]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}