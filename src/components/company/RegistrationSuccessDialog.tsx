import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
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

  const handleGotoDashboard = () => {
    onClose();
    navigate('/company/dashboard');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#040480]">
            <CheckCircle className="h-6 w-6 text-[#84d21f]" />
            Registration Successful
          </DialogTitle>
          <DialogDescription className="text-center pt-4">
            Your company has been successfully registered with MAZ Moves. Our team will review your application and verify your details.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Button
            onClick={handleGotoDashboard}
            className="bg-[#040480] hover:bg-[#1f3dd2] text-white"
          >
            Go to Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}