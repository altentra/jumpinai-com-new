
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-primary/5 dark:bg-gradient-to-br dark:from-black dark:via-gray-950/90 dark:to-gray-900/60">
      {/* Enhanced floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary/5 dark:bg-gradient-to-br dark:from-gray-800/30 dark:to-gray-700/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary/15 to-secondary/5 dark:bg-gradient-to-tr dark:from-gray-700/25 dark:to-gray-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-accent/10 dark:bg-gradient-radial dark:from-gray-800/20 dark:to-transparent rounded-full blur-2xl"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent dark:bg-gradient-to-br dark:from-gray-700/20 dark:to-transparent rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-tr from-secondary/8 to-transparent dark:bg-gradient-to-tr dark:from-gray-600/15 dark:to-transparent rounded-full blur-xl"></div>
      </div>
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative px-4 pt-24 sm:pt-28 pb-8 sm:pb-10">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="space-y-3 sm:space-y-4">
            <div className="relative mb-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-foreground via-primary/90 to-foreground bg-clip-text text-transparent leading-tight tracking-tight">
                Privacy Policy
              </h1>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 sm:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full"></div>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="px-4 py-8 sm:py-10 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/40 dark:bg-background/20 border border-primary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl shadow-primary/10">
            <div className="glass backdrop-blur-sm bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">Last updated: September 1, 2025</p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                This Privacy Policy describes how JumpinAI, LLC ("we," "our," or "us") collects, uses, and shares information about you when you use our website and services, including when you authenticate using third-party services like Google.
              </p>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">Information We Collect</h2>
            
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Information You Provide</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">We collect information you provide directly to us, such as when you:</p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
            <li>Subscribe to our newsletter</li>
            <li>Contact us through our contact form</li>
            <li>Purchase digital products from our store</li>
            <li>Create an account using email/password or third-party authentication (Google)</li>
            <li>Make payments</li>
            <li>Download digital assets or resources</li>
            <li>Engage with our content and services</li>
            <li>Participate in surveys or feedback</li>
          </ul>

            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Information We Collect Automatically</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">When you use our website, we may automatically collect certain information, including:</p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
            <li>Your IP address and location information</li>
            <li>Browser type and version</li>
            <li>Pages you visit and time spent on our site</li>
            <li>Referring website addresses</li>
            <li>Device information</li>
          </ul>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">Payment Information</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">When you make a purchase, we collect payment information through our third-party payment processor, Stripe. This includes:</p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
            <li>Credit card or payment method details (processed securely by Stripe)</li>
            <li>Billing address and contact information</li>
            <li>Transaction history and purchase records</li>
            <li>Email address for receipt and product delivery</li>
          </ul>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">We do not store your complete payment card details on our servers. All payment processing is handled securely by Stripe, which complies with PCI DSS standards.</p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">How We Use Your Information</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">We use the information we collect to:</p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
            <li>Provide, maintain, and improve our services</li>
            <li>Process payments and deliver digital products</li>
            <li>Send you newsletters and updates (with your consent)</li>
            <li>Send transactional emails related to your purchases</li>
            <li>Provide customer support and respond to inquiries</li>
            <li>Prevent fraud and ensure payment security</li>
            <li>Respond to your comments and questions</li>
            <li>Analyze how our website is used</li>
            <li>Comply with legal obligations</li>
          </ul>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">Information Sharing</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy:</p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
            <li>With service providers who assist us in operating our website and processing payments (including Stripe)</li>
            <li>With Supabase for secure data hosting and authentication services</li>
            <li>For email delivery services to send newsletters and product notifications</li>
            <li>When required by law or to protect our rights</li>
            <li>In connection with a business transfer or merger</li>
          </ul>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">Google Authentication</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">When you choose to sign in with Google, we collect and process the following information from your Google account:</p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 space-y-2 list-disc list-inside">
              <li>Your Google email address</li>
              <li>Your Google profile name</li>
              <li>Your Google profile picture (if available)</li>
              <li>Basic profile information</li>
            </ul>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">We use this information to:</p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li>Create and manage your account</li>
              <li>Provide personalized services</li>
              <li>Verify your identity</li>
              <li>Deliver our services and communicate with you</li>
            </ul>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">Your use of Google Sign-In is subject to Google's Privacy Policy. We do not store your Google password or access your Google account beyond the basic profile information you authorize.</p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">Third-Party Services</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">We use trusted third-party services to provide our services:</p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
            <li><strong>Google:</strong> For authentication services (subject to Google's Privacy Policy)</li>
            <li><strong>Stripe:</strong> For secure payment processing (subject to Stripe's Privacy Policy)</li>
            <li><strong>Supabase:</strong> For data storage and user authentication</li>
            <li><strong>Email Service Providers:</strong> For delivering newsletters and transactional emails</li>
          </ul>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">These third parties have their own privacy policies and we encourage you to review them.</p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">Data Security</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.</p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">Your Privacy Rights</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">Depending on your location, you may have certain rights regarding your personal information:</p>
            
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">General Rights</h3>
            <ul className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 space-y-2 list-disc list-inside">
            <li>The right to access your personal information</li>
            <li>The right to correct inaccurate information</li>
            <li>The right to delete your personal information</li>
            <li>The right to withdraw consent</li>
            <li>The right to data portability</li>
          </ul>

            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">California Privacy Rights (CCPA)</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">If you are a California resident, you have additional rights including:</p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 space-y-2 list-disc list-inside">
              <li>The right to know what personal information we collect about you</li>
              <li>The right to delete personal information we have collected</li>
              <li>The right to opt-out of the sale of personal information</li>
              <li>The right to non-discrimination for exercising your privacy rights</li>
            </ul>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">We do not sell personal information. You can exercise your privacy rights by contacting us or using our "Your Privacy Choices" tool.</p>

            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">European Privacy Rights (GDPR)</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">If you are in the European Union, you have additional rights including:</p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
            <li>The right to object to processing</li>
            <li>The right to restrict processing</li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent at any time</li>
          </ul>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">Cookies</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">Our website may use cookies to enhance your experience. You can control cookie settings through your browser preferences.</p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">Children's Privacy</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.</p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">Changes to This Policy</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">Contact Us</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">If you have any questions about this Privacy Policy, please contact us at:</p>
            <div className="glass backdrop-blur-sm bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4 sm:p-6">
              <p className="text-sm sm:text-base font-semibold text-foreground">JumpinAI, LLC</p>
              <p className="text-sm sm:text-base text-muted-foreground">Email: info@jumpinai.com</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
