import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessDialog({ isOpen, onClose }: SuccessDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex flex-col items-center gap-4">
            <CheckCircle className="h-12 w-12 text-[#84d21f]" />
            <span>Request Submitted Successfully!</span>
          </DialogTitle>
        </DialogHeader>
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Thank you for submitting your move request. We will contact you shortly with quotes from our verified moving companies.
          </p>
          <Button onClick={onClose} className="bg-[#040480] hover:bg-[#1f3dd2] text-white">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}