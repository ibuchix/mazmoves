import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import CookieConsent from "@/components/cookie/CookieConsent";
import ProtectedRoute from "@/components/ProtectedRoute";
import "./App.css";

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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/services" element={<Services />} />
                <Route path="/companies" element={<Companies />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/login" element={<Login />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                <Route path="/company/register" element={<Register />} />
                <Route path="/request-move" element={<RequestMove />} />
                <Route path="/company/:id" element={<PublicDashboard />} />
                
                <Route
                  path="/company/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["company"]}>
                      <CompanyDashboard />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/company/invoices"
                  element={
                    <ProtectedRoute allowedRoles={["company"]}>
                      <CompanyInvoices />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/billing"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminBilling />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
        <CookieConsent />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;