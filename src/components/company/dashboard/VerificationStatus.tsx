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
  return (
    <Card className="bg-slate-50">
      <CardContent className="pt-6">
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