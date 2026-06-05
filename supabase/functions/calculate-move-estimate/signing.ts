// signing.ts
// HMAC-SHA256 helpers used to sign and verify move-cost estimates so the
// browser cannot tamper with the price between calculation and booking.

const encoder = new TextEncoder();

async function getKey(secret: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toBase64Url(bytes: ArrayBuffer): string {
  const b = btoa(String.fromCharCode(...new Uint8Array(bytes)));
  return b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export interface EstimatePayload {
  low: number;
  high: number;
  moveType: string;
  propertySize: string;
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
  moveDate: string;
  distanceMiles: number;
  issuedAt: number; // ms epoch
}

export async function signEstimate(
  payload: EstimatePayload,
  secret: string,
): Promise<string> {
  const key = await getKey(secret);
  const json = JSON.stringify(payload);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(json));
  return `${toBase64Url(encoder.encode(json))}.${toBase64Url(sig)}`;
}

export async function verifyEstimate(
  token: string,
  secret: string,
  maxAgeMs = 30 * 60 * 1000,
): Promise<EstimatePayload | null> {
  try {
    const [payloadB64, sigB64] = token.split(".");
    if (!payloadB64 || !sigB64) return null;
    const key = await getKey(secret);
    const payloadBytes = fromBase64Url(payloadB64);
    const sigBytes = fromBase64Url(sigB64);
    const ok = await crypto.subtle.verify("HMAC", key, sigBytes, payloadBytes);
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as EstimatePayload;
    if (Date.now() - payload.issuedAt > maxAgeMs) return null;
    return payload;
  } catch {
    return null;
  }
}
