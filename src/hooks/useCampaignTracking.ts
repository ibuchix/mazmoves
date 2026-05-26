// useCampaignTracking
// Mount once at the app root (inside the Router). Captures ?cid= on every
// navigation and fires a `landing_view` event whenever the user lands on one
// of the /removals/:slug location pages. Slugs are imported directly from
// src/data/locations.ts so this list cannot drift from the actual routes.

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { captureCidFromUrl, track } from "@/lib/campaign-tracking";
import { locations } from "@/data/locations";

const LOCATION_SLUGS = new Set(locations.map((l) => l.slug));

export function useCampaignTracking() {
  const location = useLocation();

  useEffect(() => {
    captureCidFromUrl();
    // Match /removals/:slug exactly (ignore trailing slash, optional query)
    const parts = location.pathname.replace(/^\/+|\/+$/g, "").split("/");
    if (parts[0] === "removals" && parts[1] && LOCATION_SLUGS.has(parts[1])) {
      track({ event_type: "landing_view", location_slug: parts[1] });
    }
  }, [location.pathname, location.search]);
}
