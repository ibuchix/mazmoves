// CampaignRedirect — route /go/:code
// Hands off immediately to the campaign-redirect edge function (?redirect=1)
// which records the click in the background and returns a 302 to the campaign
// destination. One round-trip total — no fetch/JSON parse on the client.

import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { getVisitorId } from "@/lib/campaign-tracking";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

export default function CampaignRedirect() {
  const { code } = useParams<{ code: string }>();

  useEffect(() => {
    if (!code) return;
    const params = new URLSearchParams({
      code,
      redirect: "1",
      visitor_id: getVisitorId(),
      base_url: window.location.origin,
      referrer: document.referrer || "",
    });
    // Top-level navigation — the browser follows the 302 from the edge
    // function directly to the destination.
    window.location.replace(`${SUPABASE_URL}/functions/v1/campaign-redirect?${params}`);
  }, [code]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] text-gray-600">
      Redirecting…
    </div>
  );
}
