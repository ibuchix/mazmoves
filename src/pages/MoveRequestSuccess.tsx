// MoveRequestSuccess.tsx
// Dedicated "thank you" / conversion page reached after a successful move
// request submission. Fires the Google Ads "House Move Lead" conversion
// event on mount — this matches Google's recommended "install event snippet
// on the conversion page" pattern, so Tag Assistant can detect the event.
// No design tokens or theming changed.

import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SeoHead } from "@/components/seo/SeoHead";
import {
  trackAdsConversion,
  GOOGLE_ADS_LEAD_CONVERSION_SEND_TO,
  GOOGLE_ADS_CONVERSION_VALUE,
} from "@/utils/tracking/google-ads";

export default function MoveRequestSuccess() {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get("rid") ?? undefined;

  useEffect(() => {
    // Primary Google Ads conversion fires here so the event lives on a
    // real "conversion page" — exactly what Google Tag Assistant expects.
    trackAdsConversion({
      sendTo: GOOGLE_ADS_LEAD_CONVERSION_SEND_TO,
      value: GOOGLE_ADS_CONVERSION_VALUE,
      currency: "GBP",
      transactionId: requestId,
    });
  }, [requestId]);

  return (
    <>
      <SeoHead
        title="Request Submitted — HouseMove"
        description="Your move request has been received. Verified UK moving companies will be in touch shortly."
        path="/move-request-success"
        type="website"
      />
      <div className="max-w-xl mx-auto p-6 sm:p-10">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-10 text-center">
          <CheckCircle className="h-14 w-14 text-brand-green mx-auto" />
          <h1 className="text-2xl sm:text-3xl font-bold font-montserrat text-brand-slate mt-4">
            Request Submitted Successfully!
          </h1>
          <p className="text-gray-600 font-roboto mt-3">
            Thank you for submitting your move request. Our verified local
            movers will contact you shortly to discuss your needs.
          </p>

          <Separator className="my-6" />

          <div className="space-y-3 text-sm font-roboto text-brand-slate">
            <h2 className="font-semibold font-montserrat">What happens next?</h2>
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-brand-slateLight" />
              <span>Companies will respond within 2 hours</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4 text-brand-slateLight" />
              <span>Check your email for confirmation details</span>
            </div>
          </div>

          <div className="mt-8">
            <Button
              asChild
              className="bg-brand-slate hover:bg-brand-slateLight text-white font-montserrat shadow-md w-full sm:w-auto"
            >
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
