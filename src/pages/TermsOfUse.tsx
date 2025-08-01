
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useEffect } from "react";

const TermsOfUse = () => {
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
            Terms of Use
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up animate-delay-100">
            Please read these terms carefully before using our website and services.
          </p>
        </div>
      </section>

      {/* Terms of Use Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
          <div className="bg-muted/30 p-8 rounded-2xl mb-8">
            <p className="text-sm text-muted-foreground mb-2">Last updated: August 1, 2025</p>
            <p className="text-base">
              These Terms of Use ("Terms") govern your use of the JumpinAI website and services operated by JumpinAI, LLC ("we," "our," or "us").
            </p>
          </div>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">Acceptance of Terms</h2>
          <p className="mb-8">By accessing and using our website, you accept and agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.</p>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">Description of Service</h2>
          <p className="mb-6">JumpinAI provides educational content, insights, and resources related to artificial intelligence for professionals and organizations. Our services include:</p>
          <ul className="mb-8">
            <li>Educational content and articles</li>
            <li>Digital products and downloadable resources</li>
            <li>AI strategy guidance and templates</li>
            <li>Newsletter and updates</li>
            <li>Community engagement</li>
            <li>Payment processing for digital products</li>
          </ul>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">User Responsibilities</h2>
          <p className="mb-6">You agree to:</p>
          <ul className="mb-8">
            <li>Use our services for lawful purposes only</li>
            <li>Provide accurate information when required</li>
            <li>Respect intellectual property rights</li>
            <li>Not attempt to disrupt or harm our services</li>
            <li>Not use our services for spam or unauthorized marketing</li>
          </ul>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">Digital Products and Purchases</h2>
          <p className="mb-6">When you purchase digital products from us:</p>
          <ul className="mb-8">
            <li>You receive a limited, non-exclusive license to use the digital content for personal or commercial use as specified</li>
            <li>Digital products are delivered electronically via download links</li>
            <li>You are responsible for downloading and storing your purchased content</li>
            <li>Due to the digital nature of our products, all sales are final unless otherwise required by law</li>
            <li>Unauthorized redistribution or sharing of purchased content is prohibited</li>
          </ul>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">Payment and Billing</h2>
          <p className="mb-6">Payment processing is handled securely through Stripe. By making a purchase, you agree to:</p>
          <ul className="mb-8">
            <li>Provide accurate billing information</li>
            <li>Pay all charges associated with your purchases</li>
            <li>Accept that prices may change without notice</li>
            <li>Understand that failed payments may result in service suspension</li>
          </ul>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">Refunds and Cancellations</h2>
          <p className="mb-8">Due to the instant delivery nature of digital products, all sales are generally final. However, we may provide refunds at our sole discretion in cases of technical issues preventing download or other exceptional circumstances. Refund requests must be made within 7 days of purchase.</p>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">Intellectual Property</h2>
          <p className="mb-8">All content on our website, including text, graphics, logos, software, and digital products, is the property of JumpinAI, LLC or our licensors and is protected by copyright and other intellectual property laws. Purchased digital products grant you specific usage rights as outlined in the product description.</p>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">Prohibited Uses</h2>
          <p className="mb-6">You may not use our services to:</p>
          <ul className="mb-8">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Redistribute, resell, or share purchased digital content without authorization</li>
            <li>Use fraudulent payment methods or chargeback abuse</li>
            <li>Transmit harmful or malicious code</li>
            <li>Collect personal information without consent</li>
            <li>Impersonate others or provide false information</li>
            <li>Attempt to reverse engineer or extract our digital products</li>
          </ul>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">Disclaimer of Warranties</h2>
          <p className="mb-8">Our services are provided "as is" without warranties of any kind, either express or implied. We do not guarantee that our services will be uninterrupted, secure, or error-free.</p>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">Limitation of Liability</h2>
          <p className="mb-8">To the fullest extent permitted by law, JumpinAI, LLC shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.</p>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">Privacy</h2>
          <p className="mb-8">Your privacy is important to us. Please review our Privacy Policy, which governs how we collect, use, and protect your information.</p>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">Termination</h2>
          <p className="mb-8">We may terminate or suspend your access to our services at any time, without notice, for any reason, including breach of these Terms.</p>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">Changes to Terms</h2>
          <p className="mb-8">We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of our services constitutes acceptance of the modified Terms.</p>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">Governing Law</h2>
          <p className="mb-8">These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles.</p>

          <h2 className="text-3xl font-bold mb-6 mt-12 font-display">Contact Information</h2>
          <p className="mb-6">If you have any questions about these Terms of Use, please contact us at:</p>
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

export default TermsOfUse;
