// google-ads.ts - Thin wrapper around the Google Ads gtag installed in
// index.html. Exposes a typed conversion-event helper used by the move
// request submission flow. Replace GOOGLE_ADS_CONVERSION_SEND_TO with the
// full `AW-18198179087/XXXX` label from Google Ads once available — until
// then, the call is a safe no-op that Google simply won't record.

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export const GOOGLE_ADS_ID = "AW-18198179087";

// Submit lead form conversion label from Google Ads.
export const GOOGLE_ADS_CONVERSION_SEND_TO = "AW-18198179087/xmIOCK2v97UcEI_ayOVD";
// "House Move Lead" conversion action — fires on every successful move-request
// submission across the hero form, all location pages, and the Move Calculator.
export const GOOGLE_ADS_LEAD_CONVERSION_SEND_TO = "AW-18198179087/zqK-CKHAnL4cEI_ayOVD";
// Default conversion value (GBP) — matches the value configured in Google Ads.
export const GOOGLE_ADS_CONVERSION_VALUE = 1.0;

export function gtagEvent(eventName: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", eventName, params);
  } catch (err) {
    console.error("gtagEvent failed (non-blocking):", err);
  }
}

export interface AdsConversionParams {
  sendTo: string;
  value?: number;
  currency?: string;
  transactionId?: string;
}

export function trackAdsConversion({
  sendTo,
  value,
  currency = "GBP",
  transactionId,
}: AdsConversionParams): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", "conversion", {
      send_to: sendTo,
      value,
      currency,
      transaction_id: transactionId,
    });
  } catch (err) {
    console.error("trackAdsConversion failed (non-blocking):", err);
  }
}
