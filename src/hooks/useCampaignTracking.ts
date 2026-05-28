// useCampaignTracking
// Mount once at the app root (inside the Router). Captures ?cid= on every
// navigation and fires a `landing_view` event whenever the user lands on a
// location landing page. Primary match is /removals/:slug; falls back to
// first-segment slugs in case any location is ever served at the root.
// Slugs imported from src/data/locations.ts so this list cannot drift.

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { captureCidFromUrl, track } from "@/lib/campaign-tracking";
import { locations } from "@/data/locations";

const LOCATION_SLUGS = new Set(locations.map((l) => l.slug));

export function useCampaignTracking() {
  const location = useLocation();

  useEffect(() => {
    captureCidFromUrl();
    // Location landing pages live under /removals/<slug>; fall back to first
    // segment in case any slugs are ever served at the root.
    const parts = location.pathname.replace(/^\/+|\/+$/g, "").split("/");
    const slug = parts[0] === "removals" ? parts[1] : parts[0];
    if (slug && LOCATION_SLUGS.has(slug)) {
      track({ event_type: "landing_view", location_slug: slug });
    }
  }, [location.pathname, location.search]);
}
