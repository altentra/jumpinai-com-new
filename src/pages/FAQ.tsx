
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqs = [
    {
      question: "What is JumpinAI and how can it help my business?",
      answer: "JumpinAI is a comprehensive platform that helps businesses and professionals implement artificial intelligence strategically. We provide curated AI tools, practical implementation guides, proven workflows, and expert insights to help you harness AI power effectively. Whether you're a startup, established business, or individual professional, we guide you through the AI adoption process with clarity and measurable results."
    },
    {
      question: "What types of AI tools and strategies do you recommend?",
      answer: "We curate and recommend AI tools across various categories including content creation (ChatGPT, Claude, Jasper), design automation (Midjourney, DALL-E, Canva AI), business automation (Zapier, Make, Microsoft Power Automate), data analysis (Tableau AI, Power BI), customer service (chatbots, virtual assistants), and productivity enhancement tools. Our strategies focus on practical implementation, ROI measurement, and scalable solutions."
    },
    {
      question: "Who is JumpinAI designed for?",
      answer: "JumpinAI serves three main audiences: 1) Entrepreneurs and business owners looking to leverage AI for competitive advantage, 2) Content creators, marketers, and professionals seeking to enhance productivity with AI tools, and 3) Students and lifelong learners wanting to understand and implement AI in their careers. Our content is designed for both beginners and intermediate users."
    },
    {
      question: "How do I get started with AI implementation in my business?",
      answer: "Start by subscribing to our newsletter for regular insights, then identify your biggest business challenges that AI could solve. Begin with simple, low-risk implementations like content creation or customer service automation. We recommend starting small, measuring results, and gradually expanding your AI usage. Our guides provide step-by-step implementation processes for different business scenarios."
    },
    {
      question: "What makes JumpinAI different from other AI resources?",
      answer: "JumpinAI focuses on practical, real-world implementation rather than theoretical concepts. We provide curated recommendations based on actual business needs, offer clear ROI frameworks, and emphasize strategic thinking over tool hopping. Our approach combines technical insights with business strategy, ensuring AI adoption drives measurable results."
    },
    {
      question: "How often do you update your AI tool recommendations?",
      answer: "The AI landscape evolves rapidly, so we continuously monitor and update our recommendations. Our newsletter subscribers receive weekly updates on new tools, strategy insights, and implementation guides. We also regularly review and update our core recommendations based on user feedback and market developments."
    },
    {
      question: "Do you offer consulting or custom AI implementation services?",
      answer: "Currently, JumpinAI focuses on educational content and strategic guidance through our newsletter and resources. For specific implementation questions, we encourage engagement through our contact form. We're always exploring ways to better serve our community's needs."
    },
    {
      question: "What's the cost of accessing JumpinAI resources?",
      answer: "Our core content and newsletter are completely free. We believe in democratizing AI knowledge and making it accessible to everyone. As we grow, we may introduce premium resources, but our fundamental mission remains providing valuable AI insights at no cost."
    },
    {
      question: "How can I stay updated with the latest AI trends and tools?",
      answer: "Subscribe to our newsletter for weekly AI insights, tool recommendations, and implementation strategies. Follow us on social media for daily tips and industry updates. We also recommend bookmarking our website and checking back regularly for new content and resources."
    },
    {
      question: "Can AI really help small businesses compete with larger companies?",
      answer: "Absolutely! AI is a great equalizer that allows small businesses to access capabilities that were previously only available to large corporations. With the right AI tools and strategies, small businesses can automate processes, enhance customer service, improve decision-making, and scale operations efficiently. We focus on cost-effective AI solutions that provide immediate value."
    },
    {
      question: "What are the most common mistakes businesses make when implementing AI?",
      answer: "Common mistakes include: 1) Implementing AI without clear objectives, 2) Choosing complex solutions when simple ones would work, 3) Not training team members properly, 4) Expecting immediate ROI without proper measurement frameworks, 5) Tool hopping without mastering basics, and 6) Ignoring data quality and preparation. Our guides help you avoid these pitfalls."
    },
    {
      question: "How do I measure the ROI of AI implementation?",
      answer: "Start by establishing baseline metrics before AI implementation. Focus on measurable outcomes like time saved, cost reduction, revenue increase, or quality improvements. Track both quantitative metrics (hours saved, conversion rates) and qualitative benefits (customer satisfaction, employee satisfaction). We provide frameworks for measuring AI ROI across different business functions."
    },
    {
      question: "Is my data safe when using AI tools?",
      answer: "Data security varies by AI tool and provider. We recommend reviewing privacy policies, understanding data usage terms, and choosing reputable providers with strong security practices. For sensitive business data, consider tools that offer on-premise deployment or strict data protection guarantees. Always implement proper data governance practices alongside AI adoption."
    },
    {
      question: "How can I get my team on board with AI adoption?",
      answer: "Start with education and clear communication about AI's benefits and limitations. Begin with pilot projects that demonstrate quick wins. Involve team members in the selection and implementation process. Provide adequate training and support. Address concerns openly and honestly. Focus on how AI can enhance their work rather than replace them."
    },
    {
      question: "What should I do if I have a specific question not covered here?",
      answer: "We'd love to hear from you! Use our contact form to send specific questions, and we'll do our best to provide helpful guidance. Your questions also help us create better content for the entire JumpinAI community. Don't hesitate to reach out – we're here to help you succeed with AI."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta Tags for No-Index */}
      <meta name="robots" content="noindex, nofollow" />
      
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black gradient-text-primary mb-6 animate-fade-in-up">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up animate-delay-100">
            Everything you need to know about AI implementation, tools, and strategies for your business success.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-muted/30 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-foreground pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDown 
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      openItems.includes(index) ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openItems.includes(index) && (
                  <div className="px-8 pb-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-16 text-center">
            <div className="bg-muted/30 p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 font-display">Still have questions?</h2>
              <p className="text-muted-foreground mb-6">
                Can't find what you're looking for? We're here to help you succeed with AI implementation.
              </p>
              <a 
                href="/contact-us" 
                className="inline-flex items-center bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 dark:from-white dark:to-gray-300 dark:hover:from-gray-100 dark:hover:to-gray-400 text-white dark:text-black px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
