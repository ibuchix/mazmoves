// send-company-email.ts
// Sends a single "new job available" email to a matched moving company via
// Resend. Uses the same verified HouseMove sender that powers the customer
// confirmation email. Never throws — returns a structured result so the
// caller can aggregate outcomes across many companies.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface AddressLike {
  line1?: string;
  city?: string;
  town?: string;
  postcode?: string;
  postal_code?: string;
  formatted?: string;
  [key: string]: unknown;
}

export interface CompanyEmailInput {
  to: string;
  companyName: string;
  pickupAddress: AddressLike | null;
  deliveryAddress: AddressLike | null;
  requestedDate: string | null;
  moveType: string | null;
  estimatedSize: string | null;
  distanceMiles: number;
}

export interface CompanyEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

const formatAddress = (addr: AddressLike | null): string => {
  if (!addr) return "Not provided";
  if (addr.formatted && typeof addr.formatted === "string") return addr.formatted;
  const parts = [
    addr.line1,
    addr.town ?? addr.city,
    addr.postcode ?? addr.postal_code,
  ].filter((p): p is string => typeof p === "string" && p.length > 0);
  return parts.length > 0 ? parts.join(", ") : "Not provided";
};

const formatDate = (iso: string | null): string => {
  if (!iso) return "Date to be confirmed";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

export async function sendCompanyJobEmail(
  input: CompanyEmailInput,
): Promise<CompanyEmailResult> {
  if (!RESEND_API_KEY) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  const pickup = formatAddress(input.pickupAddress);
  const delivery = formatAddress(input.deliveryAddress);
  const when = formatDate(input.requestedDate);
  const distance = `${input.distanceMiles.toFixed(1)} miles from your base`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
      <h2 style="color: #334155; margin-bottom: 4px;">New move job available near you</h2>
      <p style="color: #64748b; margin-top: 0;">Hi ${input.companyName}, a customer in your area has requested a move.</p>

      <div style="background: #f1f5f9; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Pickup:</strong> ${pickup}</p>
        <p style="margin: 0 0 8px 0;"><strong>Delivery:</strong> ${delivery}</p>
        <p style="margin: 0 0 8px 0;"><strong>Move date:</strong> ${when}</p>
        ${input.moveType ? `<p style="margin: 0 0 8px 0;"><strong>Move type:</strong> ${input.moveType}</p>` : ""}
        ${input.estimatedSize ? `<p style="margin: 0 0 8px 0;"><strong>Property size:</strong> ${input.estimatedSize}</p>` : ""}
        <p style="margin: 0; color: #64748b; font-size: 14px;">${distance}</p>
      </div>

      <p>Log in to your HouseMove dashboard to view the full details and accept this job before another company does.</p>

      <p style="text-align: center; margin: 28px 0;">
        <a href="https://housemove.co"
           style="background: #334155; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; display: inline-block;">
          View job in dashboard
        </a>
      </p>

      <p style="color: #64748b; font-size: 13px; margin-top: 32px;">
        You're receiving this because your company is verified on HouseMove and within range of this customer's pickup or delivery address.
      </p>
      <p style="color: #94a3b8; font-size: 12px;">— The HouseMove Team</p>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "HouseMove <notifications@housemove.co>",
        to: [input.to],
        subject: "New move job available near you",
        html,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, error: data?.message ?? `HTTP ${response.status}` };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
