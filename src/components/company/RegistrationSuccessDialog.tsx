import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RegistrationSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegistrationSuccessDialog({
  isOpen,
  onClose,
}: RegistrationSuccessDialogProps) {
  const navigate = useNavigate();

  const handleClose = () => {
    onClose();
    navigate('/login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#040480]">
            <CheckCircle className="h-6 w-6 text-[#84d21f]" />
            Registration Successful
          </DialogTitle>
          <DialogDescription className="space-y-4 pt-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <Mail className="h-12 w-12 text-[#d2491f]" />
              <p>
                Please check your email to confirm your address and complete your registration process.
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 text-sm text-[#040480]">
              <p>
                After confirming your email, you will receive instructions about uploading your insurance documents for company verification.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Button
            onClick={handleClose}
            className="bg-[#040480] hover:bg-[#1f3dd2] text-white"
          >
            Go to Login
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}