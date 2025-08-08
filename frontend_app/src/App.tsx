import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AIDetection from "./pages/AiDetection";
import Humanizer from "./pages/Humanizer";
import PlagiarismChecker from "./pages/PlagiarismChecker";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ProtectedRoute from "./components/ProtectedRoute";
import EmailVerification from "pages/EmailVerification";
import EmailVerified from "./pages/EmailVerified";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* Protected pages */}
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/ai-detection"
  element={
    <ProtectedRoute>
      <AIDetection />
    </ProtectedRoute>
  }
/>
<Route
  path="/humanizer"
  element={
    <ProtectedRoute>
      <Humanizer />
    </ProtectedRoute>
  }
/>
<Route
  path="/plagiarism-checker"
  element={
    <ProtectedRoute>
      <PlagiarismChecker />
    </ProtectedRoute>
  }
/>


          {/* Public pages */}
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          {/* Email verification */}
          <Route path="/email-verified" element={<EmailVerified />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
