// estimate-verify.ts
// Local copy of HMAC verification + recalculation for submit-move-request.
// Cross-function imports are not supported by the Edge bundler so we
// duplicate the small amount of logic needed to validate an estimate token
// produced by calculate-move-estimate.

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function fromBase64Url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export interface VerifiedEstimate {
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
  issuedAt: number;
}

export async function verifyEstimateToken(
  token: string,
  secret: string,
  maxAgeMs = 30 * 60 * 1000,
): Promise<VerifiedEstimate | null> {
  try {
    const [payloadB64, sigB64] = token.split(".");
    if (!payloadB64 || !sigB64) return null;
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const payloadBytes = fromBase64Url(payloadB64);
    const sigBytes = fromBase64Url(sigB64);
    const ok = await crypto.subtle.verify("HMAC", key, sigBytes, payloadBytes);
    if (!ok) return null;
    const payload = JSON.parse(decoder.decode(payloadBytes)) as VerifiedEstimate;
    if (Date.now() - payload.issuedAt > maxAgeMs) return null;
    return payload;
  } catch {
    return null;
  }
}
