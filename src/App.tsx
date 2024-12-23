import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import { AuthProvider } from "@/components/AuthProvider";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;