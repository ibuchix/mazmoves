import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
          </Routes>
          <Footer />
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;