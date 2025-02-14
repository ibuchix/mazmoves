
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Check, Mail } from "lucide-react";
import { toast } from "sonner";

interface TokenCheckResult {
  is_valid: boolean;
  company_id: string;
  status: 'pending' | 'used' | 'expired';
  message: string;
}

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState<'success' | 'error' | 'loading'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmailToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid confirmation link. No token provided.');
        setVerifying(false);
        return;
      }

      try {
        // Check if the token is valid using RPC function
        const { data, error: tokenError } = await supabase
          .rpc<TokenCheckResult>('check_confirmation_token', { 
            token_param: token 
          });

        const tokenCheckResult = data as TokenCheckResult | null;

        if (tokenError || !tokenCheckResult || !tokenCheckResult.is_valid) {
          setStatus('error');
          setMessage(tokenCheckResult?.message || 'Invalid or expired confirmation link.');
          setVerifying(false);
          return;
        }

        // If token is valid, update the company's verification status
        const { error: updateError } = await supabase
          .from('companies')
          .update({
            email_verified: true,
            email_verified_at: new Date().toISOString()
          })
          .eq('id', tokenCheckResult.company_id);

        if (updateError) {
          throw updateError;
        }

        setStatus('success');
        setMessage('Your email has been successfully verified!');
        toast.success('Email verified successfully');

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);

      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmailToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#040480]">
            <Mail className="h-6 w-6" />
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center text-center space-y-4">
            {status === 'loading' && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#040480]" />
            )}
            {status === 'success' && (
              <Check className="h-8 w-8 text-[#84d21f]" />
            )}
            {status === 'error' && (
              <AlertCircle className="h-8 w-8 text-[#d2491f]" />
            )}
            
            <p className="text-gray-600">{message}</p>

            {status === 'success' && (
              <p className="text-sm text-gray-500">
                Redirecting you to login page...
              </p>
            )}

            {status === 'error' && (
              <Button 
                onClick={() => navigate('/login')}
                className="bg-[#040480] hover:bg-[#1f3dd2] text-white"
              >
                Go to Login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
