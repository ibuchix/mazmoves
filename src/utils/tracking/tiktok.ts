// TikTok tracking helper (browser pixel + server Events API)
// ----------------------------------------------------------
// Fires every event from BOTH the client-side TikTok Pixel and the
// server-side `tiktok-track` edge function, sharing an `event_id` so
// TikTok deduplicates them. PII (email, phone) is SHA-256 hashed on
// the client before being sent via `ttq.identify`; the edge function
// also re-hashes server-side as defence in depth.
//
// Currency defaults to GBP (UK-only app). Move-request submissions are
// sent as both `PlaceAnOrder` and `CompleteRegistration` with value 0
// because the customer is not charged at submission.

import { supabase } from "@/integrations/supabase/client";

type TtqContent = {
  content_id: string;
  content_type: "product" | "product_group";
  content_name: string;
};

type TtqEventPayload = {
  contents: TtqContent[];
  value: number;
  currency: string;
  search_string?: string;
};

interface Ttq {
  page: () => void;
  track: (
    event: string,
    payload?: Record<string, unknown>,
    options?: { event_id?: string },
  ) => void;
  identify: (payload: Record<string, string>) => void;
}

type ServerEvent =
  | "ViewContent"
  | "InitiateCheckout"
  | "CompleteRegistration"
  | "PlaceAnOrder";

const SERVER_EVENTS: ReadonlySet<string> = new Set<ServerEvent>([
  "ViewContent",
  "InitiateCheckout",
  "CompleteRegistration",
  "PlaceAnOrder",
]);

// In-memory cache of the most recently identified user. Captured via
// identifyUser() and attached to each server event so TikTok can match
// the conversion against the same person.
let identifiedUser: {
  email?: string;
  phone?: string;
  external_id?: string;
} = {};

const TTCLID_KEY = "tt_ttclid";

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

const generateEventId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

// Read ?ttclid= from URL on first call and cache in localStorage so it
// persists across navigations. Falls back to the cached value on
// subsequent calls.
const getTtclid = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get("ttclid");
    if (fromUrl) {
      window.localStorage.setItem(TTCLID_KEY, fromUrl);
      return fromUrl;
    }
    return window.localStorage.getItem(TTCLID_KEY) ?? undefined;
  } catch {
    return undefined;
  }
};

// TikTok pixel sets a first-party cookie named `_ttp`. Read it for the
// server payload so TikTok can stitch the server event to the same
// browser session.
const getTtp = (): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/(?:^|;\s*)_ttp=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : undefined;
};

const sendServerEvent = (
  event: ServerEvent,
  payload: Partial<TtqEventPayload>,
  eventId: string,
): void => {
  if (typeof window === "undefined") return;

  const firstContent = payload.contents?.[0];
  const body = {
    event,
    event_id: eventId,
    event_time: Math.floor(Date.now() / 1000),
    url: window.location.href,
    content: firstContent
      ? {
          id: firstContent.content_id,
          type: firstContent.content_type,
          name: firstContent.content_name,
        }
      : undefined,
    value: payload.value ?? 0,
    currency: payload.currency ?? "GBP",
    search_string: payload.search_string,
    user: {
      email: identifiedUser.email,
      phone: identifiedUser.phone,
      external_id: identifiedUser.external_id,
      ttclid: getTtclid(),
      ttp: getTtp(),
    },
  };

  // Fire-and-forget. Tracking must never block UX.
  void supabase.functions
    .invoke("tiktok-track", { body })
    .catch((err) =>
      console.error(`tiktok-track ${event} failed (non-blocking):`, err),
    );
};

export const identifyUser = async (params: {
  email?: string;
  phone?: string;
  externalId?: string;
}): Promise<void> => {
  // Pre-compute hashes once for both pixel and server payloads.
  const hashedEmail = params.email ? await sha256Hex(params.email) : undefined;
  const hashedPhone = params.phone ? await sha256Hex(params.phone) : undefined;
  const hashedExt = params.externalId
    ? await sha256Hex(params.externalId)
    : undefined;

  identifiedUser = {
    email: hashedEmail,
    phone: hashedPhone,
    external_id: hashedExt,
  };

  const ttq = getTtq();
  if (!ttq) return;
  try {
    const payload: Record<string, string> = {};
    if (hashedEmail) payload.email = hashedEmail;
    if (hashedPhone) payload.phone_number = hashedPhone;
    if (hashedExt) payload.external_id = hashedExt;
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
  payload: Partial<TtqEventPayload>,
): void => {
  const eventId = generateEventId();
  const fullPayload = {
    currency: "GBP",
    value: 0,
    contents: [],
    ...payload,
  };

  // 1. Browser pixel — pass event_id explicitly for dedup.
  const ttq = getTtq();
  if (ttq) {
    try {
      ttq.track(event, fullPayload, { event_id: eventId });
    } catch (err) {
      console.error(`TikTok track ${event} failed (non-blocking):`, err);
    }
  }

  // 2. Server Events API — only for the events we forward.
  if (SERVER_EVENTS.has(event)) {
    sendServerEvent(event as ServerEvent, fullPayload, eventId);
  }
};
