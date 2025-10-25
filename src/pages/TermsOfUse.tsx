
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
                Terms of Use
              </h1>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 sm:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full"></div>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Please read these terms carefully before using our website and services.
            </p>
          </div>
        </div>
      </section>

      {/* Terms of Use Content */}
      <section className="px-4 py-8 sm:py-10 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/40 dark:bg-background/20 border border-primary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl shadow-primary/10">
            <div className="glass backdrop-blur-sm bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">Last updated: October 1, 2025</p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                These Terms of Use ("Terms") govern your use of the JumpinAI website and services operated by JumpinAI, LLC, a Wyoming limited liability company ("we," "our," or "us").
              </p>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">1. Acceptance of Terms</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              By accessing and using JumpinAI ("the Service"), you accept and agree to be bound by these Terms of Use. If you do not agree to these Terms, please do not use our Service. Your continued use of the Service constitutes your acceptance of these Terms and any updates. You represent that you are at least 13 years old and have the legal capacity to enter into this agreement.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">2. Description of Service</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">JumpinAI provides AI-powered tools, resources, and educational content including:</p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li><strong>JumpinAI Studio:</strong> An interactive platform for generating AI-powered content, strategies, and action plans</li>
              <li><strong>Subscription Plans:</strong> Monthly subscription-based access to premium tools and features</li>
              <li><strong>Digital Products:</strong> Guides, templates, and educational resources</li>
              <li><strong>AI Credits:</strong> Purchase credits to access AI-powered features</li>
              <li><strong>AI Coaching:</strong> Personalized recommendations and guidance</li>
            </ul>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice, for any reason including maintenance, updates, or business decisions.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">3. User Accounts</h2>
            
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Account Creation</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              To access certain features, you must create an account. You must be at least 13 years old to use our Service. By creating an account, you represent that you meet this age requirement and that all information you provide is accurate, current, and complete.
            </p>

            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Account Security</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">You are responsible for:</p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access or security breach at support@jumpinai.com</li>
              <li>Ensuring your account information remains accurate and up-to-date</li>
            </ul>

            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Account Termination</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violations of these Terms, fraudulent activity, abuse of services, or any other reason at our sole discretion. You may terminate your account at any time by contacting us at support@jumpinai.com. Upon termination, you will lose access to your account and any associated content or credits.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">4. User Responsibilities and Acceptable Use</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">You agree to:</p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use the Service in compliance with all applicable laws and regulations</li>
              <li>Not use the Service for any illegal, harmful, or unauthorized purpose</li>
              <li>Not attempt to gain unauthorized access to our systems, other user accounts, or networks</li>
              <li>Not interfere with or disrupt the Service, servers, or networks</li>
              <li>Not use the Service to transmit malware, viruses, or harmful code</li>
              <li>Not impersonate any person or entity or misrepresent your affiliation</li>
              <li>Not scrape, harvest, or collect user data without explicit permission</li>
              <li>Not reverse engineer or attempt to extract source code from the Service</li>
              <li>Not resell, redistribute, or commercially exploit the Service without authorization</li>
            </ul>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">5. Subscriptions and Payments</h2>
            
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Subscription Plans</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              We offer monthly subscription plans that provide access to premium features and content. By subscribing, you agree to:
            </p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li>Pay the subscription fees as stated on our pricing page at the time of purchase</li>
              <li>Automatic renewal of your subscription on a monthly basis until cancelled</li>
              <li>Charges will be billed to your payment method on file on your renewal date</li>
              <li>Price changes will be communicated with at least 30 days' notice</li>
            </ul>

            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Billing and Payment</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              All payments are processed securely through Stripe, our third-party payment processor. You authorize us to charge your payment method for all fees incurred. You are responsible for providing accurate billing information and updating it as needed. Failed payments may result in service suspension or termination.
            </p>

            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Cancellation</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              You may cancel your subscription at any time through your account settings or by contacting us at support@jumpinai.com. Cancellation will take effect at the end of your current billing period. You will retain access to premium features until the end of the paid period. No refunds will be provided for partial subscription periods unless required by law.
            </p>

            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Price Changes</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              We reserve the right to change our pricing at any time. We will provide at least 30 days' notice of any price increases to existing subscribers. Your continued use of the Service after the price change constitutes acceptance of the new pricing. You may cancel your subscription before the new pricing takes effect if you do not agree to the changes.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">6. Digital Products and Services</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              When you purchase digital products (e-books, guides, courses, templates, or credits) from us, you receive a non-exclusive, non-transferable, revocable license to use them for personal or internal business purposes as specified in the product description. Digital products are delivered electronically and are non-refundable after download or use, except as required by law or our refund policy. You may not redistribute, resell, or share purchased content without explicit written permission.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">7. Refund Policy</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              We offer a 7-day refund policy for certain purchases:
            </p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li><strong>Digital Products:</strong> Refund requests must be submitted within 7 days of purchase and before significant use or download of the content</li>
              <li><strong>Subscriptions:</strong> First-time subscribers may request a refund within 7 days of initial purchase. Renewal charges are non-refundable unless there was a billing error</li>
              <li><strong>Credits:</strong> AI credit purchases are non-refundable once credits have been used. Unused credits may be eligible for refund within 7 days</li>
            </ul>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              To request a refund, contact us at support@jumpinai.com with your order details and reason for the refund request. We will review your request and respond within 3-5 business days. Approved refunds will be processed to the original payment method within 5-10 business days. We reserve the right to deny refund requests that do not meet our policy criteria or show evidence of abuse.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">8. Intellectual Property</h2>
            
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Our Intellectual Property</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              All content, features, functionality, software, designs, graphics, text, logos, and other materials on the Service are owned by JumpinAI, LLC or our licensors and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              The JumpinAI name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of JumpinAI, LLC. You may not use these marks without our prior written permission. All other names, logos, product and service names, designs, and slogans are the trademarks of their respective owners.
            </p>

            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">User-Generated Content</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              You retain ownership of any content you create using our Service. However, by using our Service, you grant us a non-exclusive, worldwide, royalty-free, sublicensable license to use, reproduce, modify, and display your content solely for the purpose of providing, improving, and promoting the Service. You represent and warrant that you have all rights necessary to grant this license.
            </p>

            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">AI-Generated Content</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Content generated by our AI tools is provided to you for your use according to the terms of your subscription or purchase. However, you acknowledge that AI-generated content may not be eligible for copyright protection under current law and may be similar to content generated for other users. You are responsible for reviewing, verifying, and ensuring the appropriateness of all AI-generated content before use. We do not claim ownership of AI-generated content, but we also cannot guarantee its uniqueness.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">9. AI Content Disclaimer</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              <strong>IMPORTANT NOTICE:</strong> Content generated by our AI tools is provided for educational and informational purposes only. It should NOT be considered as:
            </p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li>Professional advice (legal, financial, medical, tax, or otherwise)</li>
              <li>Guaranteed to be accurate, complete, current, or up-to-date</li>
              <li>A substitute for professional consultation from qualified experts</li>
              <li>Free from errors, biases, or inaccuracies</li>
              <li>Suitable for all purposes or use cases</li>
            </ul>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              AI-generated content may contain errors, biases, outdated information, or inaccuracies. You are solely responsible for verifying any information before relying on it for important decisions. We strongly recommend consulting with qualified professionals for specific advice tailored to your situation. You use AI-generated content at your own risk, and we disclaim all liability for any decisions made based on such content.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">10. Disclaimers</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              <strong>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:</strong>
            </p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li>Warranties of merchantability, fitness for a particular purpose, or non-infringement</li>
              <li>That the Service will be uninterrupted, timely, secure, or error-free</li>
              <li>That defects will be corrected or that results will meet your requirements</li>
              <li>That the Service or servers are free of viruses or harmful components</li>
              <li>The accuracy, reliability, completeness, or usefulness of any content or AI-generated information</li>
              <li>That any errors in technology will be corrected</li>
            </ul>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Use of the Service is at your sole risk. Some jurisdictions do not allow the exclusion of certain warranties, so some of the above exclusions may not apply to you.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">11. Limitation of Liability</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL JUMPINAI, LLC, ITS OFFICERS, DIRECTORS, EMPLOYEES, CONTRACTORS, AGENTS, LICENSORS, OR SUPPLIERS BE LIABLE FOR:</strong>
            </p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li>Any indirect, incidental, special, consequential, exemplary, or punitive damages</li>
              <li>Loss of profits, revenue, data, use, goodwill, or other intangible losses</li>
              <li>Loss of or damage to property, business interruption, or loss of business opportunity</li>
              <li>Personal injury, emotional distress, or reputational harm</li>
              <li>Any damages arising from your use, inability to use, or reliance on the Service</li>
              <li>Any damages arising from AI-generated content or decisions made based on such content</li>
              <li>Unauthorized access to or alteration of your transmissions or data</li>
            </ul>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              <strong>Our total liability to you for all claims arising from or related to the Service shall not exceed the greater of:</strong> (a) the amount you paid us in the 12 months preceding the claim, or (b) $100 USD.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above limitations may not apply to you. In such jurisdictions, our liability will be limited to the fullest extent permitted by law.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">12. Indemnification</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              You agree to indemnify, defend, and hold harmless JumpinAI, LLC and its officers, directors, employees, contractors, agents, licensors, and suppliers from and against any and all claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to:
            </p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li>Your violation of these Terms or any applicable law or regulation</li>
              <li>Your use or misuse of the Service</li>
              <li>Your violation of any rights of a third party, including intellectual property rights</li>
              <li>Any content you submit, post, or transmit through the Service</li>
              <li>Your breach of any representations, warranties, or covenants</li>
              <li>Any decisions or actions you take based on AI-generated content</li>
            </ul>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              We reserve the right to assume the exclusive defense and control of any matter subject to indemnification by you, in which event you will cooperate with us in asserting any available defenses.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">13. Privacy</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Your privacy is important to us. Please review our <a href="/privacy-policy" className="text-primary hover:underline font-medium">Privacy Policy</a> to understand how we collect, use, and protect your personal information. By using the Service, you consent to our privacy practices as described in the Privacy Policy, which is incorporated into these Terms by reference.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">14. Termination</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              We reserve the right to terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason, including but not limited to:
            </p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li>Breach of these Terms</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Violation of intellectual property rights</li>
              <li>Failure to pay fees when due</li>
              <li>At our sole discretion for any other reason</li>
            </ul>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Upon termination, your right to use the Service will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive, including but not limited to ownership provisions, warranty disclaimers, indemnity, limitations of liability, dispute resolution, and governing law provisions. You will remain liable for all charges incurred prior to termination.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">15. Dispute Resolution and Arbitration</h2>
            
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Informal Resolution</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Before filing a formal claim, you agree to try to resolve the dispute informally by contacting us at legal@jumpinai.com with a detailed description of the dispute. We will attempt to resolve the dispute informally by contacting you via email. If a dispute is not resolved within 60 days of submission, you or we may bring a formal proceeding.
            </p>

            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Binding Arbitration</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              <strong>PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR RIGHTS.</strong>
            </p>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              If we cannot resolve the dispute informally, any dispute, claim, or controversy arising out of or relating to these Terms or the Service shall be resolved through binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. The arbitration will be conducted in Wyoming, United States, or another mutually agreed location. The arbitration will be conducted by a single arbitrator, and judgment on the arbitration award may be entered in any court having jurisdiction.
            </p>

            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Class Action Waiver</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              <strong>YOU AGREE THAT ANY DISPUTE SHALL BE RESOLVED ON AN INDIVIDUAL BASIS AND NOT AS A CLASS ACTION, CONSOLIDATED ACTION, OR REPRESENTATIVE ACTION.</strong> You expressly waive any right to pursue claims on a class-wide basis or in a representative capacity. You may not consolidate claims with those of other users or join your claim with claims of any other person.
            </p>

            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-6 sm:mt-8 text-foreground">Exceptions to Arbitration</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Either party may seek injunctive or other equitable relief in any court of competent jurisdiction to prevent the actual or threatened infringement, misappropriation, or violation of intellectual property rights, or for disputes involving claims of $10,000 or less.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">16. Governing Law and Jurisdiction</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the State of Wyoming, United States, without regard to its conflict of law principles. Any legal action or proceeding (other than arbitration as provided above) shall be brought exclusively in the federal or state courts located in Wyoming, and you irrevocably consent to the personal jurisdiction and venue of such courts.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">17. Severability</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving its intent, or if that is not possible, it shall be severed from these Terms.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">18. Force Majeure</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              We shall not be liable for any failure or delay in performance of our obligations under these Terms due to circumstances beyond our reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, riots, civil unrest, embargoes, acts of civil or military authorities, fire, floods, accidents, epidemics, pandemics, strikes, labor disputes, shortages of transportation facilities, fuel, energy, labor or materials, or failure of third-party service providers.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">19. Export Compliance</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              You agree to comply with all applicable export and import control laws and regulations, including the Export Administration Regulations maintained by the U.S. Department of Commerce and sanctions programs administered by the U.S. Treasury Department's Office of Foreign Assets Control. You represent and warrant that you are not (a) located in a country that is subject to a U.S. Government embargo or has been designated by the U.S. Government as a "terrorist supporting" country, or (b) listed on any U.S. Government list of prohibited or restricted parties.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">20. Entire Agreement</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              These Terms, together with our Privacy Policy and any other legal notices, policies, or agreements published on the Service, constitute the entire agreement between you and JumpinAI, LLC regarding the Service and supersede all prior and contemporaneous agreements, proposals, or representations, written or oral, concerning the subject matter. No waiver of any provision of these Terms shall be deemed a further or continuing waiver of such provision or any other provision.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">21. Changes to Terms</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              We reserve the right to modify these Terms at any time at our sole discretion. We will notify you of material changes by:
            </p>
            <ul className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 space-y-2 list-disc list-inside">
              <li>Posting the updated Terms on this page with a new "Last updated" date</li>
              <li>Sending you an email notification to the address associated with your account (for material changes)</li>
              <li>Displaying a prominent notice on our website</li>
            </ul>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Your continued use of the Service after any changes constitutes acceptance of the modified Terms. If you do not agree to the modified Terms, you must stop using the Service and may terminate your account. It is your responsibility to review these Terms periodically for changes.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-10 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">22. Contact Information</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              If you have any questions, concerns, or disputes regarding these Terms of Use, please contact us:
            </p>
            <div className="glass backdrop-blur-sm bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4 sm:p-6 mb-4">
              <p className="text-sm sm:text-base font-semibold text-foreground">JumpinAI, LLC</p>
              <p className="text-sm sm:text-base text-muted-foreground">A Wyoming Limited Liability Company</p>
              <p className="text-sm sm:text-base text-muted-foreground mt-3"><strong>Email:</strong> legal@jumpinai.com</p>
              <p className="text-sm sm:text-base text-muted-foreground"><strong>Support:</strong> support@jumpinai.com</p>
              <p className="text-sm sm:text-base text-muted-foreground"><strong>Website:</strong> www.jumpinai.com/contact</p>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              We will respond to your inquiry within 5-7 business days.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsOfUse;