import { lazy } from "react";
import { RouteConfig } from "@/types/route";

// Lazy load route components
const Index = lazy(() => import("@/pages/Index"));
const Services = lazy(() => import("@/pages/Services"));
const Companies = lazy(() => import("@/pages/Companies"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("@/pages/TermsAndConditions"));
const Login = lazy(() => import("@/pages/auth/Login"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const Register = lazy(() => import("@/pages/company/Register"));
const CompanyDashboard = lazy(() => import("@/pages/company/Dashboard"));
const PublicDashboard = lazy(() => import("@/pages/company/PublicDashboard"));
const RequestMove = lazy(() => import("@/pages/RequestMove"));
const CompanyInvoices = lazy(() => import("@/pages/company/Invoices"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminBilling = lazy(() => import("@/pages/admin/Billing"));
const ConfirmEmail = lazy(() => import("@/pages/auth/ConfirmEmail"));

export const publicRoutes: RouteConfig[] = [
  { path: "/", element: <Index /> },
  { path: "/services", element: <Services /> },
  { path: "/companies", element: <Companies /> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/terms-and-conditions", element: <TermsAndConditions /> },
  { path: "/login", element: <Login /> },
  { path: "/auth/forgot-password", element: <ForgotPassword /> },
  { path: "/auth/reset-password", element: <ResetPassword /> },
  { path: "/company/register", element: <Register /> },
  { path: "/request-move", element: <RequestMove /> },
  { path: "/company/:id", element: <PublicDashboard /> },
  { path: "/confirm-email", element: <ConfirmEmail /> },
];

export const companyRoutes: RouteConfig[] = [
  { 
    path: "/company/dashboard", 
    element: <CompanyDashboard />,
    requiresAuth: true,
    allowedRoles: ["company"]
  },
  {
    path: "/company/invoices",
    element: <CompanyInvoices />,
    requiresAuth: true,
    allowedRoles: ["company"]
  }
];

export const adminRoutes: RouteConfig[] = [
  {
    path: "/admin/dashboard",
    element: <AdminDashboard />,
    requiresAuth: true,
    allowedRoles: ["admin"]
  },
  {
    path: "/admin/billing",
    element: <AdminBilling />,
    requiresAuth: true,
    allowedRoles: ["admin"]
  }
];
