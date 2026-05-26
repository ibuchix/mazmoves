// CampaignRedirect — route /go/:code
// Calls the public `campaign-redirect` edge function which records the click
// server-side and returns the destination URL. We then window.location.replace
// to it. If anything fails we fall back to the home page.

import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { getVisitorId } from "@/lib/campaign-tracking";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export default function CampaignRedirect() {
  const { code } = useParams<{ code: string }>();

  useEffect(() => {
    if (!code) {
      window.location.replace("/");
      return;
    }
    const params = new URLSearchParams({
      code,
      visitor_id: getVisitorId(),
      base_url: window.location.origin,
      referrer: document.referrer || "",
    });
    fetch(`${SUPABASE_URL}/functions/v1/campaign-redirect?${params.toString()}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.destination) {
          window.location.replace(d.destination);
        } else {
          window.location.replace("/");
        }
      })
      .catch(() => window.location.replace("/"));
  }, [code]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] text-gray-600">
      Redirecting…
    </div>
  );
}
