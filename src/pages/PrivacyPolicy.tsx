
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useEffect } from "react";

const PrivacyPolicy = () => {
  useEffect(() => {
    // Add no-index meta tag
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow';
    document.head.appendChild(metaRobots);

    return () => {
      // Cleanup on unmount
      document.head.removeChild(metaRobots);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black gradient-text-primary mb-6 animate-fade-in-up">
            Privacy Policy
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up animate-delay-100">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
          <div className="bg-muted/30 p-8 rounded-2xl mb-8">
            <p className="text-sm text-muted-foreground mb-2">Last updated: January 1, 2025</p>
            <p className="text-base">
              This Privacy Policy describes how JumpinAI, LLC ("we," "our," or "us") collects, uses, and shares information about you when you use our website and services.
            </p>
          </div>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">Information We Collect</h2>
          
          <h3 className="text-2xl font-semibold mb-4 mt-8">Information You Provide</h3>
          <p className="mb-6">We collect information you provide directly to us, such as when you:</p>
          <ul className="mb-8">
            <li>Subscribe to our newsletter</li>
            <li>Contact us through our contact form</li>
            <li>Engage with our content and services</li>
            <li>Participate in surveys or feedback</li>
          </ul>

          <h3 className="text-2xl font-semibold mb-4 mt-8">Information We Collect Automatically</h3>
          <p className="mb-6">When you use our website, we may automatically collect certain information, including:</p>
          <ul className="mb-8">
            <li>Your IP address and location information</li>
            <li>Browser type and version</li>
            <li>Pages you visit and time spent on our site</li>
            <li>Referring website addresses</li>
            <li>Device information</li>
          </ul>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">How We Use Your Information</h2>
          <p className="mb-6">We use the information we collect to:</p>
          <ul className="mb-8">
            <li>Provide, maintain, and improve our services</li>
            <li>Send you newsletters and updates (with your consent)</li>
            <li>Respond to your comments and questions</li>
            <li>Analyze how our website is used</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">Information Sharing</h2>
          <p className="mb-6">We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy:</p>
          <ul className="mb-8">
            <li>With service providers who assist us in operating our website</li>
            <li>When required by law or to protect our rights</li>
            <li>In connection with a business transfer or merger</li>
          </ul>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">Data Security</h2>
          <p className="mb-8">We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.</p>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">Your Rights</h2>
          <p className="mb-6">Depending on your location, you may have certain rights regarding your personal information, including:</p>
          <ul className="mb-8">
            <li>The right to access your personal information</li>
            <li>The right to correct inaccurate information</li>
            <li>The right to delete your personal information</li>
            <li>The right to withdraw consent</li>
            <li>The right to data portability</li>
          </ul>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">Cookies</h2>
          <p className="mb-8">Our website may use cookies to enhance your experience. You can control cookie settings through your browser preferences.</p>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">Children's Privacy</h2>
          <p className="mb-8">Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.</p>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">Changes to This Policy</h2>
          <p className="mb-8">We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">Contact Us</h2>
          <p className="mb-6">If you have any questions about this Privacy Policy, please contact us at:</p>
          <div className="bg-muted/30 p-6 rounded-xl">
            <p><strong>JumpinAI, LLC</strong></p>
            <p>Email: info@jumpinai.com</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
