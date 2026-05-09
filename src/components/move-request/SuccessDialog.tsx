
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
            <CheckCircle className="h-12 w-12 text-brand-green" />
            <span className="text-brand-slate text-xl font-montserrat">Request Submitted Successfully!</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 font-roboto">
          <div className="text-center text-gray-600">
            <p className="mb-4">
              Thank you for submitting your move request. Our verified local movers will contact you shortly to discuss your needs.
            </p>
            <Separator className="my-4" />
            <div className="space-y-4">
              <h4 className="font-semibold text-brand-slate font-montserrat">What happens next?</h4>
              <div className="flex items-center gap-2 justify-center text-sm">
                <Clock className="h-4 w-4 text-brand-slateLight" />
                <span>Companies will respond within 2 hours</span>
              </div>
              <div className="flex items-center gap-2 justify-center text-sm">
                <Mail className="h-4 w-4 text-brand-slateLight" />
                <span>Check your email for confirmation details</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Button 
              onClick={onClose} 
              className="bg-brand-slate hover:bg-brand-slateLight text-white w-full sm:w-auto font-montserrat shadow-md"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
