import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "@/pages/Index";
import Services from "@/pages/Services";
import Companies from "@/pages/Companies";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsAndConditions from "@/pages/TermsAndConditions";
import Login from "@/pages/auth/Login";
import Register from "@/pages/company/Register";
import CompanyDashboard from "@/pages/company/Dashboard";
import PublicDashboard from "@/pages/company/PublicDashboard";
import RequestMove from "@/pages/RequestMove";
import CompanyInvoices from "@/pages/company/Invoices";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminBilling from "@/pages/admin/Billing";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/components/AuthProvider";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<Services />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
              <Route path="/login" element={<Login />} />
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
          </main>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;