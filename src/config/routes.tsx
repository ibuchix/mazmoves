// Public routes only — auth, company, and admin areas removed.
// The platform is a simple move-request submission site.
import { lazy } from "react";
import { RouteConfig } from "@/types/route";

const Index = lazy(() => import("@/pages/Index"));
const Services = lazy(() => import("@/pages/Services"));
const Contact = lazy(() => import("@/pages/Contact"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("@/pages/TermsAndConditions"));
const RequestMove = lazy(() => import("@/pages/RequestMove"));

export const publicRoutes: RouteConfig[] = [
  { path: "/", element: <Index /> },
  { path: "/services", element: <Services /> },
  { path: "/contact", element: <Contact /> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/terms-and-conditions", element: <TermsAndConditions /> },
  { path: "/request-move/*", element: <RequestMove /> },
];
