// Public routes only — auth, company, and admin areas removed.
// Services standalone page removed; the homepage still shows ServicesSection.
// Added /agents page documenting the MCP endpoint for AI agents.
import { lazy } from "react";
import { RouteConfig } from "@/types/route";

const Index = lazy(() => import("@/pages/Index"));
const Contact = lazy(() => import("@/pages/Contact"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("@/pages/TermsAndConditions"));
const RequestMove = lazy(() => import("@/pages/RequestMove"));
const Agents = lazy(() => import("@/pages/Agents"));

export const publicRoutes: RouteConfig[] = [
  { path: "/", element: <Index /> },
  { path: "/contact", element: <Contact /> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/terms-and-conditions", element: <TermsAndConditions /> },
  { path: "/request-move/*", element: <RequestMove /> },
  { path: "/agents", element: <Agents /> },
];

