// Public routes only — auth, company, and admin areas removed.
// Services standalone page removed; the homepage still shows ServicesSection.
// Added /agents page documenting the MCP endpoint for AI agents.
// Added /removals hub and /removals/:slug dynamic town landing pages for SEO.
import { lazy } from "react";
import { RouteConfig } from "@/types/route";

const Index = lazy(() => import("@/pages/Index"));
const Contact = lazy(() => import("@/pages/Contact"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("@/pages/TermsAndConditions"));
const RequestMove = lazy(() => import("@/pages/RequestMove"));
const Agents = lazy(() => import("@/pages/Agents"));
const Removals = lazy(() => import("@/pages/Removals"));
const TownRemovals = lazy(() => import("@/pages/TownRemovals"));
const CampaignRedirect = lazy(() => import("@/pages/CampaignRedirect"));

export const publicRoutes: RouteConfig[] = [
  { path: "/", element: <Index /> },
  { path: "/contact", element: <Contact /> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/terms-and-conditions", element: <TermsAndConditions /> },
  { path: "/request-move/*", element: <RequestMove /> },
  { path: "/agents", element: <Agents /> },
  { path: "/removals", element: <Removals /> },
  { path: "/removals/:slug", element: <TownRemovals /> },
  { path: "/go/:code", element: <CampaignRedirect /> },
];

