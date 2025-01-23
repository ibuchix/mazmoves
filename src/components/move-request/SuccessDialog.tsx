import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessDialog({ isOpen, onClose }: SuccessDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-[#040480]">
            Success!
          </DialogTitle>
          <DialogDescription className="text-center">
            Your Move Request has been submitted successfully. You will receive a confirmation email shortly.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-4">
          <Button 
            onClick={onClose}
            className="bg-[#040480] hover:bg-[#1f3dd2] text-white"
          >
            Return to Home
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}