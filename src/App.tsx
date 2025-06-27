
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import ContactUs from "./pages/ContactUs";
import FAQ from "./pages/FAQ";
import TestSync from "./pages/TestSync";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    console.log("Route changed to:", pathname);
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Debug component to log route information
const RouteDebugger = () => {
  const location = useLocation();
  
  useEffect(() => {
    console.log("Current route info:", {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      state: location.state
    });
  }, [location]);

  return null;
};

const App = () => {
  console.log("App component rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <RouteDebugger />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/test-sync" element={<TestSync />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
