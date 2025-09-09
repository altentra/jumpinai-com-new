
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import LeadMagnet from "@/components/LeadMagnet";
import BookPromotion from "@/components/BookPromotion";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { GoogleSheetsTest } from "@/components/GoogleSheetsTest";

const Index = () => {
  // Show test component only in development or when URL contains 'test'
  const showTest = window.location.hostname === 'localhost' || 
                   window.location.search.includes('test=true') ||
                   window.location.pathname.includes('test');

  return (
    <div className="min-h-screen scroll-snap-container">
      <Navigation />
      <Hero />
      <Features />
      <LeadMagnet />
      <BookPromotion />
      
      {showTest && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>DEBUG MODE:</strong> Google Sheets Test Component
              </p>
              <div className="mt-2">
                <GoogleSheetsTest />
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Index;
