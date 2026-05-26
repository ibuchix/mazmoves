// Campaign attribution storage + event dispatcher for housemove.co.
// Reads ?cid=<short_code> on every page load and persists it alongside a stable
// visitor_id. First-touch (hm_first_cid) is preserved; last-touch (hm_cid) is
// overwritten on each new ?cid. Events POST to the public `track-event` Supabase
// edge function via navigator.sendBeacon (fallback: fetch keepalive) so they
// never block the user. All errors are swallowed — tracking must never throw.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const TRACK_URL = `${SUPABASE_URL}/functions/v1/track-event`;

const VISITOR_KEY = "hm_visitor_id";
const SESSION_KEY = "hm_session_id";
const CID_KEY = "hm_cid";
const FIRST_CID_KEY = "hm_first_cid";

const COOKIE_DAYS = 90;

const setCookie = (name: string, value: string, days = COOKIE_DAYS) => {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; samesite=lax`;
};

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
};

const uuid = () =>
  "crypto" in globalThis && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export function getVisitorId(): string {
  let v = localStorage.getItem(VISITOR_KEY) || getCookie(VISITOR_KEY);
  if (!v) {
    v = uuid();
    localStorage.setItem(VISITOR_KEY, v);
    setCookie(VISITOR_KEY, v);
  }
  return v;
}

export function getSessionId(): string {
  let s = sessionStorage.getItem(SESSION_KEY);
  if (!s) {
    s = uuid();
    sessionStorage.setItem(SESSION_KEY, s);
  }
  return s;
}

export function captureCidFromUrl(): { cid: string | null; first_cid: string | null } {
  try {
    const params = new URLSearchParams(window.location.search);
    const urlCid = params.get("cid");
    if (urlCid) {
      localStorage.setItem(CID_KEY, urlCid);
      setCookie(CID_KEY, urlCid);
      if (!localStorage.getItem(FIRST_CID_KEY)) {
        localStorage.setItem(FIRST_CID_KEY, urlCid);
        setCookie(FIRST_CID_KEY, urlCid);
      }
    }
  } catch {
    // ignore
  }
  return {
    cid: localStorage.getItem(CID_KEY) || getCookie(CID_KEY),
    first_cid: localStorage.getItem(FIRST_CID_KEY) || getCookie(FIRST_CID_KEY),
  };
}

export interface TrackPayload {
  event_type: "landing_view" | "move_type_selected" | "form_submitted";
  location_slug?: string;
  move_type?: string;
  request_id?: string;
  metadata?: Record<string, unknown>;
}

export function track(payload: TrackPayload): void {
  try {
    const { cid, first_cid } = captureCidFromUrl();
    const body = JSON.stringify({
      ...payload,
      cid,
      first_cid,
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
    });
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(TRACK_URL, blob);
      return;
    }
    fetch(TRACK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // never throw from tracking
  }
}
