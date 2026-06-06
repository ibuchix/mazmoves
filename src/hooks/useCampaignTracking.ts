// useCampaignTracking
// Mount once at the app root (inside the Router). Captures ?cid= on every
// navigation and fires a `landing_view` event whenever the user lands on a
// tracked page. Tracked pages are:
//   1. Any of the 34 location landing pages (under /removals/<slug>, with
//      fallback to first-segment slugs).
//   2. Standalone landings listed in STANDALONE_LANDINGS (e.g. /move-calculator)
//      — the slug stored here MUST match the value the admin /campaigns page
//      writes into campaigns.target_location_slug so the funnel report joins
//      correctly.
// Location slugs are imported from src/data/locations.ts so the list cannot drift.
// Refactor: replaced the inline `/move-calculator` branch with a STANDALONE_LANDINGS
// map so future standalone landings are a one-line addition. Behaviour unchanged.

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { captureCidFromUrl, track } from "@/lib/campaign-tracking";
import { locations } from "@/data/locations";

const LOCATION_SLUGS = new Set(locations.map((l) => l.slug));

// path -> location_slug stored on the event. Path is normalised to a single
// leading slash with no trailing slash before lookup.
const STANDALONE_LANDINGS: Record<string, string> = {
  "/move-calculator": "move-calculator",
};

export function useCampaignTracking() {
  const location = useLocation();

  useEffect(() => {
    captureCidFromUrl();

    // 1. Standalone landings — match the full normalised path.
    const path = "/" + location.pathname.replace(/^\/+|\/+$/g, "");
    if (STANDALONE_LANDINGS[path]) {
      track({ event_type: "landing_view", location_slug: STANDALONE_LANDINGS[path] });
      return;
    }

    // 2. Location landing pages live under /removals/<slug>; fall back to
    //    first segment in case any slugs are ever served at the root.
    const parts = location.pathname.replace(/^\/+|\/+$/g, "").split("/");
    const slug = parts[0] === "removals" ? parts[1] : parts[0];
    if (slug && LOCATION_SLUGS.has(slug)) {
      track({ event_type: "landing_view", location_slug: slug });
    }
  }, [location.pathname, location.search]);
}
