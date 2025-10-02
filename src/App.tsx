
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { preloadCriticalPages } from "@/utils/preloader";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const TestSync = lazy(() => import("./pages/TestSync"));
const Jumps = lazy(() => import("./pages/Jumps"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const SubscriptionSuccess = lazy(() => import("./pages/SubscriptionSuccess"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Download = lazy(() => import("./pages/Download"));
const DownloadPro = lazy(() => import("./pages/DownloadPro"));
const ForInvestors = lazy(() => import("./pages/ForInvestors"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Resources = lazy(() => import("./pages/Resources"));
const Profile = lazy(() => import("./pages/Profile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Auth = lazy(() => import("./pages/Auth"));
const PricingNew = lazy(() => import("./pages/PricingNew"));
const JumpinAIStudio = lazy(() => import("./pages/JumpinAIStudio"));
const SyncStripe = lazy(() => import("./pages/SyncStripe"));

// Loading component for Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient();

// Component to handle scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Route change handler (debug info removed for production)
const RouteDebugger = () => {
  return null;
};

const App = () => {
  // Initialize critical page preloading after main app loads
  useEffect(() => {
    preloadCriticalPages();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <RouteDebugger />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/jumpinai-studio" element={<JumpinAIStudio />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-use" element={<TermsOfUse />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/pricing" element={<PricingNew />} />
              <Route path="/sync-stripe" element={<SyncStripe />} />
              <Route path="/test-sync" element={<TestSync />} />
              <Route path="/jumps" element={<Jumps />} />
              <Route path="/for-investors" element={<ForInvestors />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/subscription-success" element={<SubscriptionSuccess />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/download/:token" element={<Download />} />
              <Route path="/download-pro/:productId" element={<DownloadPro />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard/*" element={<Dashboard />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
