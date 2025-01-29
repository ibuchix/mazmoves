import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/AuthProvider";
import { MainLayout } from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { publicRoutes, companyRoutes, adminRoutes } from "@/config/routes";
import "./App.css";

const queryClient = new QueryClient();

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MainLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              {publicRoutes.map((route) => (
                <Route 
                  key={route.path}
                  path={route.path} 
                  element={route.element} 
                />
              ))}

              {/* Protected Company Routes */}
              {companyRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <ProtectedRoute allowedRoles={route.allowedRoles || []}>
                      {route.element}
                    </ProtectedRoute>
                  }
                />
              ))}

              {/* Protected Admin Routes */}
              {adminRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <ProtectedRoute allowedRoles={route.allowedRoles || []}>
                      {route.element}
                    </ProtectedRoute>
                  }
                />
              ))}

              {/* Catch all route - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </MainLayout>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;