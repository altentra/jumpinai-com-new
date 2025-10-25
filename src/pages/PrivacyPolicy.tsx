
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
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">Last updated: October 1, 2025</p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                This Privacy Policy describes how JumpinAI, LLC ("we," "our," or "us"), a Wyoming limited liability company, collects, uses, and shares information about you when you use our website and services.
              </p>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">1. Information We Collect</h2>
            
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Information You Provide</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">We collect information you provide directly to us, such as when you:</p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li>Create an account using email/password or third-party authentication (Google, Apple)</li>
              <li>Subscribe to our newsletter or monthly subscription plans</li>
              <li>Purchase digital products, credits, or services</li>
              <li>Contact us through our contact form</li>
              <li>Download digital assets or resources</li>
              <li>Engage with our AI-powered tools (JumpinAI Studio)</li>
              <li>Provide feedback or participate in surveys</li>
            </ul>

            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Information We Collect Automatically</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">When you use our website, we automatically collect:</p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li>Device information and browser type</li>
              <li>IP address and general location data (country/city level)</li>
              <li>Pages visited, features used, and time spent on our site</li>
              <li>Referring website addresses and clickstream data</li>
              <li>Usage patterns and preferences</li>
            </ul>

            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Cookies and Tracking Technologies</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              We use cookies and similar technologies to enhance your experience. For detailed information about cookies we use and how to manage them, see our <strong>Cookie Policy</strong> section below. You can also manage your preferences through our "Your Privacy Choices" tool available in the footer.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">2. Legal Basis for Processing</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">We process your personal information based on the following legal grounds:</p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li><strong>Contract Performance:</strong> To provide services, process transactions, and fulfill our contractual obligations</li>
              <li><strong>Legitimate Interests:</strong> To improve our website, conduct analytics, and enhance user experience</li>
              <li><strong>Consent:</strong> To send marketing communications and newsletters (you can withdraw consent at any time)</li>
              <li><strong>Legal Obligations:</strong> To comply with applicable laws, respond to legal requests, and protect our rights</li>
            </ul>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">3. How We Use Your Information</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">We use the information we collect to:</p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li>Provide, maintain, and improve our services</li>
              <li>Process payments, subscriptions, and deliver digital products</li>
              <li>Generate AI-powered content and personalized recommendations</li>
              <li>Send transactional emails related to your purchases and account</li>
              <li>Send newsletters and promotional materials (with your consent)</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Analyze usage patterns and conduct analytics</li>
              <li>Detect, prevent, and address technical issues, fraud, and security threats</li>
              <li>Comply with legal obligations and protect our rights</li>
            </ul>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">4. Information Sharing and Disclosure</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed"><strong>We do not sell your personal information to third parties.</strong> We may share your information in the following circumstances:</p>
            
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Service Providers</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">We share data with trusted third-party service providers including:</p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li><strong>Supabase:</strong> Database hosting and authentication services</li>
              <li><strong>Google & Apple:</strong> Third-party authentication services (subject to their respective privacy policies)</li>
              <li><strong>Stripe:</strong> Payment processing (complies with PCI-DSS standards)</li>
              <li><strong>AI Providers:</strong> OpenAI, Anthropic Claude, Google Gemini, and xAI for content generation</li>
              <li><strong>Analytics Providers:</strong> Website performance monitoring and user behavior analysis</li>
              <li><strong>Email Service Providers:</strong> Transactional and marketing email delivery</li>
            </ul>

            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Other Circumstances</h3>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li><strong>Legal Compliance:</strong> To comply with legal obligations, court orders, or lawful government requests</li>
              <li><strong>Protection of Rights:</strong> To protect our rights, privacy, safety, property, or that of our users</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, sale of assets, or bankruptcy proceeding</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share specific information</li>
            </ul>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">5. Third-Party Services</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              Our website integrates with and uses various third-party services. These services have their own privacy policies:
            </p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 space-y-2 list-disc list-inside">
              <li><strong>Google:</strong> Authentication services (subject to Google's Privacy Policy)</li>
              <li><strong>Apple:</strong> Sign in with Apple authentication services (subject to Apple's Privacy Policy)</li>
              <li><strong>Stripe:</strong> Payment processing (subject to Stripe's Privacy Policy)</li>
              <li><strong>AI Providers:</strong> Content generation services with their respective privacy policies</li>
            </ul>
            
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Third-Party Authentication</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              When you choose to sign in with Google or Apple, we collect basic profile information from your account including:
            </p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 space-y-2 list-disc list-inside">
              <li>Your email address</li>
              <li>Your profile name</li>
              <li>Your profile picture (if available and authorized)</li>
              <li>Basic account information necessary for authentication</li>
            </ul>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              We use this information to create and manage your account, verify your identity, and provide our services. Your use of Google Sign-In is subject to Google's Privacy Policy, and your use of Sign in with Apple is subject to Apple's Privacy Policy. We do not store your Google or Apple passwords or access your accounts beyond the basic profile information you authorize.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              <strong>Apple Sign In:</strong> If you use Sign in with Apple and choose to hide your email address, Apple will provide us with a unique, random email address that forwards to your actual email. You can manage this in your Apple ID settings.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              We encourage you to review the privacy policies of these third-party services. We are not responsible for their privacy practices or how they handle your information.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">6. International Data Transfers</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence, including the United States. These countries may have different data protection laws. When we transfer your data internationally, we ensure appropriate safeguards are in place:
            </p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li>Standard contractual clauses approved by regulatory authorities</li>
              <li>Data processing agreements with our service providers</li>
              <li>Compliance with applicable data protection frameworks (GDPR, CCPA)</li>
            </ul>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">7. Data Security</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              We implement industry-standard technical and organizational security measures to protect your personal information:
            </p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li>Encryption of data in transit (HTTPS/TLS) and at rest</li>
              <li>Secure authentication protocols and password hashing</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and activity monitoring</li>
              <li>Secure payment processing through PCI-DSS compliant providers</li>
            </ul>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">8. Data Retention</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy:
            </p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li><strong>Account Data:</strong> Retained for 1 year after account closure or last activity</li>
              <li><strong>Transaction Records:</strong> Retained for 7 years to comply with tax and financial regulations</li>
              <li><strong>Marketing Data:</strong> Retained until you withdraw consent or 2 years of inactivity</li>
              <li><strong>Analytics Data:</strong> Anonymized and retained for statistical purposes</li>
              <li><strong>Support Communications:</strong> Retained for 3 years for quality assurance</li>
            </ul>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              After the retention period expires, we will securely delete or anonymize your personal information.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">9. Your Privacy Rights</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">Depending on your location, you may have the following rights regarding your personal information:</p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li><strong>Right to Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete information</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal information ("right to be forgotten")</li>
              <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong>Right to Object:</strong> Object to processing of your personal information for certain purposes</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for marketing communications at any time</li>
              <li><strong>Right to Lodge a Complaint:</strong> File a complaint with your local data protection authority</li>
            </ul>

            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">How to Exercise Your Rights</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              To exercise any of these rights, please contact us at <strong>privacy@jumpinai.com</strong> or through your account settings. We will respond to your request within 30 days. You may need to verify your identity before we process your request.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">10. Cookie Policy</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience on our website. Cookies are small data files stored on your device.
            </p>
            
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Types of Cookies We Use</h3>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-3 list-disc list-inside">
              <li><strong>Necessary Cookies (Always Active):</strong> Essential for website functionality, including authentication, security, and basic features. These cannot be disabled. <em>Retention: Session or up to 1 year</em></li>
              <li><strong>Analytics & Performance Cookies:</strong> Help us understand how visitors interact with our website through anonymous data collection. <em>Retention: Up to 2 years</em></li>
              <li><strong>Personalization Cookies:</strong> Remember your preferences and settings for future visits (theme, language). <em>Retention: Up to 1 year</em></li>
              <li><strong>Marketing & Advertising Cookies:</strong> Used to deliver relevant advertisements and measure campaign effectiveness. <em>Retention: Up to 1 year</em></li>
            </ul>

            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Managing Cookies</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              You can manage your cookie preferences at any time through our <strong>"Your Privacy Choices"</strong> tool available in the footer of our website. You can also configure your browser to refuse cookies or alert you when cookies are being sent. However, some features may not function properly if cookies are disabled.
            </p>

            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Third-Party Cookies</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Some cookies are placed by third-party services that appear on our pages (Stripe, Google, analytics providers). We do not control these cookies. Please review the privacy policies of these third parties for more information.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">11. Do Not Track Signals</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Some web browsers have a "Do Not Track" (DNT) feature that signals to websites that you do not want your online activities tracked. Currently, there is no industry standard for how to respond to DNT signals. At this time, our website does not respond to DNT signals. However, you can manage your privacy preferences through our "Your Privacy Choices" tool.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">12. Automated Decision-Making and Profiling</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              We use AI-powered tools to generate personalized content and recommendations based on your usage patterns and preferences. This automated processing is used to enhance your experience and provide you with relevant content. This does not involve decisions that produce legal effects concerning you. You have the right to object to automated decision-making. If you wish to opt-out, please contact us at privacy@jumpinai.com.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">13. Data Breach Notification</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              In the event of a data breach that may affect your personal information, we will notify you and relevant authorities as required by applicable law within 72 hours of becoming aware of the breach. We will provide information about the nature of the breach, the data affected, and the steps we are taking to address the issue and prevent future occurrences.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">14. Children's Privacy</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Our services are not intended for children under 13 years of age. We do not knowingly collect, use, or disclose personal information from children under 13. We require users to confirm they are at least 13 years old during account registration. If we learn that we have collected personal information from a child under 13, we will delete that information immediately. If you believe we have collected information from a child under 13, please contact us at privacy@jumpinai.com.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">15. California Privacy Rights (CCPA)</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li>Right to know what personal information is collected, used, shared, or sold</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of the sale of personal information (we do not sell personal information)</li>
              <li>Right to non-discrimination for exercising your privacy rights</li>
            </ul>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              To exercise these rights, contact us at privacy@jumpinai.com. We will not discriminate against you for exercising your CCPA rights.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">16. European Privacy Rights (GDPR)</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              If you are in the European Union, you have rights under the General Data Protection Regulation (GDPR) including all rights listed in Section 9 above. You also have the right to lodge a complaint with your local data protection supervisory authority.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">17. Changes to This Privacy Policy</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by:
            </p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li>Posting the updated Privacy Policy on this page with a new "Last updated" date</li>
              <li>Sending you an email notification (for material changes)</li>
              <li>Displaying a prominent notice on our website</li>
            </ul>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Your continued use of our services after any changes indicates your acceptance of the updated Privacy Policy. We encourage you to review this Privacy Policy periodically.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">18. Contact Us</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="glass backdrop-blur-sm bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4 sm:p-6 mb-4">
              <p className="text-sm sm:text-base font-semibold text-foreground">JumpinAI, LLC</p>
              <p className="text-sm sm:text-base text-muted-foreground"><strong>Email:</strong> privacy@jumpinai.com</p>
              <p className="text-sm sm:text-base text-muted-foreground"><strong>Support:</strong> support@jumpinai.com</p>
              <p className="text-sm sm:text-base text-muted-foreground"><strong>Website:</strong> www.jumpinai.com/contact</p>
              <p className="text-sm sm:text-base text-muted-foreground"><strong>Data Protection Officer:</strong> dpo@jumpinai.com</p>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              We will respond to your inquiry within 30 days.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;