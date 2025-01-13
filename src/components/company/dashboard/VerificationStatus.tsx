import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ShieldCheck } from "lucide-react";

interface VerificationStatusProps {
  isVerified: boolean;
  verificationDate?: string;
  message: string;
}

export default function VerificationStatus({ 
  isVerified, 
  verificationDate, 
  message 
}: VerificationStatusProps) {
  console.log("VerificationStatus props:", { isVerified, verificationDate, message }); // Debug log
  
  return (
    <Card className="bg-slate-50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-2">
          {isVerified ? (
            <ShieldCheck className="h-5 w-5 text-[#84d21f]" />
          ) : (
            <AlertCircle className="h-5 w-5 text-[#d2491f]" />
          )}
          <span className="text-sm font-medium text-slate-600">
            {isVerified ? 'Verified Company' : 'Pending Verification'}
          </span>
        </div>
        <p className="text-sm text-slate-600">
          {message}
          {verificationDate && (
            <span className="block mt-1 text-xs">
              Verified on: {new Date(verificationDate).toLocaleDateString()}
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

export function VerificationBadge({ isVerified }: { isVerified: boolean }) {
  console.log("VerificationBadge prop:", { isVerified }); // Debug log
  
  if (isVerified) {
    return (
      <Badge 
        className="flex items-center gap-1 bg-[#84d21f] hover:bg-[#84d21f] text-white px-3 py-1"
      >
        <ShieldCheck className="h-4 w-4" />
        Verified Company
      </Badge>
    );
  }

  return (
    <Badge 
      className="flex items-center gap-1 bg-[#d2491f] hover:bg-[#d2491f] text-white px-3 py-1"
    >
      <AlertCircle className="h-4 w-4" />
      Pending Verification
    </Badge>
  );
}