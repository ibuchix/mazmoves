// Root app shell. AuthProvider, ProtectedRoute, company and admin route trees removed —
// the app is now a public-only move-request platform.
import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { publicRoutes } from "@/config/routes";
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
      <MainLayout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {publicRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </MainLayout>
    </QueryClientProvider>
  );
}

export default App;
