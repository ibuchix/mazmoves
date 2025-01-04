import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Services from "@/pages/Services";
import Companies from "@/pages/Companies";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsAndConditions from "@/pages/TermsAndConditions";
import Login from "@/pages/auth/Login";
import Register from "@/pages/company/Register";
import CompanyDashboard from "@/pages/company/Dashboard";
import AdminDashboard from "@/pages/admin/Dashboard";
import CompanyVerification from "@/pages/admin/CompanyVerification";
import PublicDashboard from "@/pages/company/PublicDashboard";
import RequestMove from "@/pages/RequestMove";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/components/AuthProvider";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
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
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/verification"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <CompanyVerification />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;