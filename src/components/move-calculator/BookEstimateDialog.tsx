// BookEstimateDialog.tsx
// Collects contact details after an estimate is shown, then submits the
// move request via /submit-move-request with the signed estimate token
// attached so the price persists alongside the row. Reuses the existing
// success dialog UX (toast) from the standard form.
//
// Updated: supports commercial profile (premises + scale) and bespoke
// quote responses (no low/high price). Em-dash removed from footer copy.

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CheckCircle, Clock, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { MoveType, PropertySize, CommercialProfile } from "@/types/move-request";
import type { Address } from "@/types/address";

interface BookEstimateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moveType: MoveType;
  propertySize?: PropertySize;
  commercialProfile?: CommercialProfile;
  pickupAddress: Address;
  deliveryAddress: Address;
  pickupCoords: { latitude: number; longitude: number };
  deliveryCoords: { latitude: number; longitude: number };
  moveDate: string;
  estimateToken?: string;
  estimateLow?: number;
  estimateHigh?: number;
  /**
   * Fired once the booking has been submitted successfully AND the user has
   * dismissed the success dialog (via Done / outside click / Esc). The page
   * uses this to clear the estimate result and reset the calculator wizard.
   */
  onBookingComplete?: () => void;
}

interface ContactForm {
  fullName: string;
  email: string;
  phone: string;
  specialInstructions?: string;
}

const gbp = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);

export function BookEstimateDialog(props: BookEstimateDialogProps) {
  const {
    open, onOpenChange, moveType, propertySize, commercialProfile,
    pickupAddress, deliveryAddress,
    pickupCoords, deliveryCoords, moveDate, estimateToken, estimateLow, estimateHigh,
    onBookingComplete,
  } = props;

  const hasPrice = typeof estimateLow === "number" && typeof estimateHigh === "number";

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ContactForm>();

  const finishAndReset = () => {
    onOpenChange(false);
    setSuccess(false);
    onBookingComplete?.();
  };

  // When the user dismisses the dialog (outside click / Esc / close button)
  // after a successful booking, treat it as a completed flow and reset.
  const handleOpenChange = (next: boolean) => {
    if (!next && success) {
      finishAndReset();
      return;
    }
    onOpenChange(next);
  };

  const onSubmit = handleSubmit(async (form) => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-move-request", {
        body: {
          moveRequest: {
            moveType,
            propertySize,
            commercialProfile,
            pickupAddress, deliveryAddress,
            moveDate,
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
            specialInstructions: form.specialInstructions ?? null,
            pickupCoords, deliveryCoords,
            estimate: estimateToken ? { token: estimateToken } : null,
          },
        },
      });
      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || "Failed to book this move");
      }
      supabase.functions.invoke("send-confirmation-email", {
        body: { customerEmail: form.email, customerName: form.fullName },
      }).catch(() => undefined);
      setSuccess(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  });

  const headerTitle = hasPrice
    ? `Book this move at ${gbp(estimateLow!)} to ${gbp(estimateHigh!)}`
    : "Request your bespoke quote";

  const successBody = hasPrice
    ? `We've matched your move (${gbp(estimateLow!)} to ${gbp(estimateHigh!)}) with verified local movers. They'll contact you shortly to confirm.`
    : "We've received your request. A specialist will prepare a tailored quote and be in touch shortly.";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {success ? (
          <div className="text-center py-2">
            <CheckCircle className="h-12 w-12 text-brand-green mx-auto" />
            <h3 className="text-xl font-bold font-montserrat text-brand-slate mt-3">
              {hasPrice ? "Booking received" : "Quote request received"}
            </h3>
            <p className="text-sm font-roboto text-gray-600 mt-2">
              {successBody}
            </p>
            <div className="mt-5 space-y-2 text-sm font-roboto text-brand-slate">
              <div className="flex items-center justify-center gap-2"><Clock className="h-4 w-4 text-brand-slateLight" /><span>Responses within 2 hours</span></div>
              <div className="flex items-center justify-center gap-2"><Mail className="h-4 w-4 text-brand-slateLight" /><span>Confirmation sent to your inbox</span></div>
            </div>
            <Button
              onClick={finishAndReset}
              className="mt-6 bg-brand-slate hover:bg-brand-slateLight text-white font-montserrat"
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-montserrat text-brand-slate">
                {headerTitle}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="be-name">Full name *</Label>
                <Input id="be-name" {...register("fullName", { required: "Required", minLength: { value: 2, message: "Too short" } })} />
                {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="be-email">Email *</Label>
                <Input id="be-email" type="email" {...register("email", { required: "Required", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" } })} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="be-phone">Phone *</Label>
                <Input id="be-phone" type="tel" {...register("phone", { required: "Required", pattern: { value: /^[0-9\s\-\+\(\)]{8,}$/, message: "Invalid phone" } })} />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="be-notes">Notes (optional)</Label>
                <Textarea id="be-notes" rows={3} {...register("specialInstructions", { maxLength: { value: 500, message: "Too long" } })} />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-orange hover:bg-brand-green text-white font-montserrat font-semibold py-6 text-base"
              >
                {submitting ? <><LoadingSpinner size="sm" className="border-white mr-2" /> Submitting...</> : hasPrice ? "Confirm booking" : "Submit request"}
              </Button>

            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
