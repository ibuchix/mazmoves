// TikTok Pixel tracking helper
// ----------------------------
// Thin wrapper around the global `ttq` object loaded by the TikTok Pixel
// snippet in index.html. All PII (email, phone) is SHA-256 hashed on the
// client before being sent via `ttq.identify`, per TikTok's Advanced
// Matching requirements.
//
// Currency defaults to GBP (the app is UK-only). Move-request submissions
// are sent as both `PlaceAnOrder` (the customer is ordering a service)
// and `CompleteRegistration` (they're registering a request with us);
// value is left at 0 because the customer is not charged at submission.

type TtqContent = {
  content_id: string;
  content_type: "product" | "product_group";
  content_name: string;
};

type TtqEventPayload = {
  contents: TtqContent[];
  value: number;
  currency: string;
};

interface Ttq {
  page: () => void;
  track: (event: string, payload?: Record<string, unknown>) => void;
  identify: (payload: Record<string, string>) => void;
}

const getTtq = (): Ttq | null => {
  if (typeof window === "undefined") return null;
  const ttq = (window as unknown as { ttq?: Ttq }).ttq;
  return ttq ?? null;
};

const sha256Hex = async (input: string): Promise<string> => {
  const normalised = input.trim().toLowerCase();
  const buf = new TextEncoder().encode(normalised);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const identifyUser = async (params: {
  email?: string;
  phone?: string;
  externalId?: string;
}): Promise<void> => {
  const ttq = getTtq();
  if (!ttq) return;
  try {
    const payload: Record<string, string> = {};
    if (params.email) payload.email = await sha256Hex(params.email);
    if (params.phone) payload.phone_number = await sha256Hex(params.phone);
    if (params.externalId)
      payload.external_id = await sha256Hex(params.externalId);
    ttq.identify(payload);
  } catch (err) {
    console.error("TikTok identify failed (non-blocking):", err);
  }
};

export const trackEvent = (
  event:
    | "ViewContent"
    | "InitiateCheckout"
    | "AddToCart"
    | "AddPaymentInfo"
    | "PlaceAnOrder"
    | "CompleteRegistration"
    | "Purchase"
    | "Search"
    | "AddToWishlist",
  payload: Partial<TtqEventPayload> & { search_string?: string },
): void => {
  const ttq = getTtq();
  if (!ttq) return;
  try {
    ttq.track(event, {
      currency: "GBP",
      value: 0,
      contents: [],
      ...payload,
    });
  } catch (err) {
    console.error(`TikTok track ${event} failed (non-blocking):`, err);
  }
};
