import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

type Workflow = {
  name: string;
  description: string;
  steps: string[];
  category: string;
};

type DetailedStep = {
  title: string;
  description: string;
  actions: string[];
};

type Variation = {
  name: string;
  description: string;
};

type TroubleshootingItem = {
  problem: string;
  solution: string;
};

type Resource = {
  name: string;
  url: string;
};

type DetailedWorkflow = {
  name: string;
  description: string;
  steps: string[];
  category: string;
  overview: string;
  prerequisites: string[];
  timeEstimate: string;
  difficulty: string;
  tools: string[];
  detailedSteps: DetailedStep[];
  variations: Variation[];
  troubleshooting: TroubleshootingItem[];
  resources: Resource[];
};

const workflowDetails: Record<string, DetailedWorkflow> = {
  // TEXT WORKFLOWS
  "Content Creation Pipeline": {
    name: "Content Creation Pipeline",
    description: "Systematic approach to producing high-quality written content",
    steps: ["Define target audience, goals, and key messages", "Research topic thoroughly and gather supporting data", "Create detailed outline with clear structure", "Write first draft focusing on core message", "Review and optimize for brand voice and SEO", "Get feedback and iterate based on input", "Finalize and schedule for publication"],
    category: "Content Marketing",
    overview: "This comprehensive workflow transforms ideas into compelling content through systematic AI collaboration. Perfect for marketers, content creators, and business professionals who need consistent, high-quality output across multiple channels and formats.",
    prerequisites: ["Access to AI writing tools (ChatGPT, Claude, etc.)", "Clear understanding of target audience", "Brand guidelines and style preferences", "Content objectives and KPIs", "Basic SEO knowledge"],
    timeEstimate: "2-4 hours per piece",
    difficulty: "Beginner",
    tools: ["ChatGPT/Claude/Gemini", "Content calendar", "Brand style guide", "Analytics tools", "SEO tools", "Grammar checkers"],
    detailedSteps: [
      {
        title: "Step 1: Audience and Goal Definition",
        description: "Establish the fundamental parameters that will guide your entire content creation process.",
        actions: [
          "Define target audience: demographics, pain points, preferred communication style",
          "Set clear content objectives: awareness, education, conversion, engagement",
          "Identify key messages and value propositions to communicate",
          "Establish success metrics: traffic, engagement, conversions, brand awareness"
        ]
      },
      {
        title: "Step 2: Research and Data Gathering",
        description: "Collect comprehensive information to ensure content accuracy and depth.",
        actions: [
          "Conduct keyword research for SEO optimization",
          "Analyze competitor content and identify gaps",
          "Gather supporting statistics, case studies, and expert quotes",
          "Review industry trends and current events for relevance"
        ]
      },
      {
        title: "Step 3: Content Structure Development",
        description: "Create a logical framework that ensures comprehensive coverage and reader engagement.",
        actions: [
          "Develop compelling headline and subheadings",
          "Create detailed outline with main sections and subsections",
          "Plan content flow to guide reader through logical progression",
          "Identify opportunities for visuals, examples, and interactive elements"
        ]
      },
      {
        title: "Step 4: First Draft Creation",
        description: "Generate initial content focusing on core message delivery.",
        actions: [
          "Write engaging introduction that hooks the reader",
          "Develop body content with clear, actionable insights",
          "Use storytelling techniques and real examples",
          "Create strong conclusion with clear call-to-action"
        ]
      },
      {
        title: "Step 5: Optimization and Refinement",
        description: "Enhance content for brand consistency, SEO, and reader engagement.",
        actions: [
          "Review for brand voice and tone consistency",
          "Optimize for target keywords without keyword stuffing",
          "Improve readability with shorter sentences and paragraphs",
          "Add internal and external links for authority and user experience"
        ]
      },
      {
        title: "Step 6: Feedback and Iteration",
        description: "Gather input and refine content based on stakeholder feedback.",
        actions: [
          "Share draft with subject matter experts for accuracy review",
          "Get feedback from target audience representatives",
          "Incorporate suggestions while maintaining content integrity",
          "Conduct final proofread for grammar and factual accuracy"
        ]
      },
      {
        title: "Step 7: Publication and Promotion",
        description: "Finalize content and execute distribution strategy.",
        actions: [
          "Format content for chosen platform or medium",
          "Schedule publication at optimal times for audience",
          "Prepare social media promotion and email announcements",
          "Set up tracking for performance metrics and engagement"
        ]
      }
    ],
    variations: [
      { name: "Blog Post Creation", description: "Long-form educational content optimized for search engines and thought leadership" },
      { name: "Social Media Content", description: "Platform-specific content adapted for engagement and shareability" },
      { name: "Email Campaign Content", description: "Personalized content designed for direct communication and conversion" },
      { name: "Video Script Writing", description: "Conversational content structured for video presentation and engagement" }
    ],
    troubleshooting: [
      { problem: "Content lacks engagement", solution: "Add more storytelling elements, personal anecdotes, and interactive questions" },
      { problem: "SEO performance is poor", solution: "Revisit keyword research, improve meta descriptions, and add more relevant internal links" },
      { problem: "Brand voice inconsistency", solution: "Create detailed brand voice guidelines and use them as prompts for AI tools" },
      { problem: "Content production too slow", solution: "Develop templates and content frameworks to streamline the creation process" }
    ],
    resources: [
      { name: "Content Strategy Guide", url: "https://contentmarketinginstitute.com/articles/content-strategy-guide/" },
      { name: "AI Writing Tools Comparison", url: "https://blog.hubspot.com/marketing/ai-writing-tools" },
      { name: "Brand Voice Development", url: "https://blog.hootsuite.com/brand-voice/" },
      { name: "SEO Content Optimization", url: "https://moz.com/learn/seo/on-page-factors" }
    ]
  },

  "Document Analysis Workflow": {
    name: "Document Analysis Workflow",
    description: "Structured process for analyzing and extracting insights from documents",
    steps: ["Upload and digitize source documents", "Identify key sections and data points", "Extract and categorize important information", "Analyze patterns and trends in the data", "Create executive summary with recommendations", "Validate findings with stakeholders"],
    category: "Business Intelligence",
    overview: "Transform complex documents into actionable business intelligence through systematic analysis. Ideal for executives, analysts, and researchers who need to quickly extract insights from large volumes of documentation.",
    prerequisites: ["Document scanning/digitization tools", "Data analysis software", "Understanding of business context", "Stakeholder access for validation"],
    timeEstimate: "3-6 hours per document set",
    difficulty: "Intermediate",
    tools: ["AI document analysis tools", "Excel/Google Sheets", "OCR software", "Data visualization tools", "PDF readers with annotation"],
    detailedSteps: [
      {
        title: "Step 1: Document Preparation and Digitization",
        description: "Convert physical documents to digital format and organize for analysis.",
        actions: [
          "Scan physical documents using high-quality OCR technology",
          "Organize documents by type, date, or relevance",
          "Create backup copies and establish version control",
          "Ensure all text is searchable and accessible"
        ]
      },
      {
        title: "Step 2: Initial Document Review",
        description: "Conduct preliminary assessment to understand document scope and content.",
        actions: [
          "Skim through documents to understand overall content and structure",
          "Identify different document types and their purposes",
          "Note potential areas of interest or concern",
          "Create a high-level categorization system"
        ]
      },
      {
        title: "Step 3: Key Information Extraction",
        description: "Systematically extract relevant data points and information.",
        actions: [
          "Use AI tools to extract key entities, dates, and numbers",
          "Identify recurring themes and important concepts",
          "Highlight critical decisions, recommendations, and action items",
          "Create structured data tables from unstructured information"
        ]
      },
      {
        title: "Step 4: Pattern and Trend Analysis",
        description: "Analyze extracted data to identify meaningful patterns and insights.",
        actions: [
          "Look for trends over time in financial, operational, or performance data",
          "Identify correlations between different data points",
          "Compare findings against industry benchmarks or standards",
          "Note any anomalies or unexpected patterns"
        ]
      },
      {
        title: "Step 5: Synthesis and Recommendations",
        description: "Combine insights into actionable recommendations and executive summary.",
        actions: [
          "Synthesize key findings into major themes and insights",
          "Develop specific, actionable recommendations based on analysis",
          "Create executive summary highlighting most critical findings",
          "Prepare supporting data and evidence for each recommendation"
        ]
      },
      {
        title: "Step 6: Validation and Refinement",
        description: "Validate findings with stakeholders and refine analysis based on feedback.",
        actions: [
          "Present preliminary findings to subject matter experts",
          "Gather feedback on accuracy and completeness of analysis",
          "Refine recommendations based on stakeholder input",
          "Finalize report with validated insights and action items"
        ]
      }
    ],
    variations: [
      { name: "Financial Document Analysis", description: "Specialized analysis of financial statements, reports, and related documents" },
      { name: "Legal Document Review", description: "Systematic review of contracts, agreements, and legal documentation" },
      { name: "Research Paper Analysis", description: "Academic or scientific document analysis for research synthesis" },
      { name: "Competitive Intelligence", description: "Analysis of competitor documents and market intelligence materials" }
    ],
    troubleshooting: [
      { problem: "Poor OCR quality affects analysis", solution: "Use higher resolution scanning and multiple OCR tools for comparison" },
      { problem: "Information overload from too many documents", solution: "Prioritize documents by relevance and analyze in focused batches" },
      { problem: "Difficulty extracting structured data", solution: "Use AI-powered document parsing tools and create custom extraction templates" },
      { problem: "Stakeholders disagree with findings", solution: "Provide detailed methodology and supporting evidence for all conclusions" }
    ],
    resources: [
      { name: "Document Analysis Best Practices", url: "https://www.archives.gov/research/genealogy/charts-forms" },
      { name: "AI Document Processing Tools", url: "https://blog.nanonets.com/document-ai-tools/" },
      { name: "Business Intelligence Frameworks", url: "https://www.tableau.com/learn/articles/business-intelligence" },
      { name: "Data Visualization Techniques", url: "https://www.storytellingwithdata.com/" }
    ]
  },

  "Blog Writing Process": {
    name: "Blog Writing Process",
    description: "Step-by-step methodology for creating SEO-optimized blog content",
    steps: ["Conduct keyword research and identify target terms", "Analyze competitor content and identify content gaps", "Create comprehensive content outline with H2/H3 structure", "Write engaging introduction with hook and value proposition", "Develop body content with actionable insights and examples", "Optimize for on-page SEO including meta descriptions and alt tags", "Proofread, fact-check, and publish with internal linking strategy"],
    category: "SEO Content",
    overview: "Master the art of creating search-engine optimized blog content that ranks well and engages readers. This workflow combines SEO best practices with engaging storytelling to drive organic traffic and build authority.",
    prerequisites: ["SEO tool access (Ahrefs, SEMrush, etc.)", "Understanding of target audience", "Basic knowledge of HTML and WordPress", "Content management system access"],
    timeEstimate: "4-6 hours per blog post",
    difficulty: "Intermediate",
    tools: ["SEO research tools", "Google Analytics", "WordPress/CMS", "Grammarly", "Canva for images", "Schema markup tools"],
    detailedSteps: [
      {
        title: "Step 1: Keyword Research and Topic Selection",
        description: "Identify high-potential keywords and topics that align with your audience's search intent.",
        actions: [
          "Use SEO tools to find keywords with good search volume and manageable competition",
          "Analyze search intent behind target keywords (informational, commercial, navigational)",
          "Group related keywords into topic clusters for comprehensive coverage",
          "Validate topic relevance with your target audience and business goals"
        ]
      },
      {
        title: "Step 2: Competitive Content Analysis",
        description: "Study top-ranking content to identify opportunities for differentiation and improvement.",
        actions: [
          "Analyze top 10 search results for your target keyword",
          "Identify content gaps and opportunities for unique angles",
          "Note the structure, length, and format of successful competitors",
          "Look for outdated information you can update and improve upon"
        ]
      },
      {
        title: "Step 3: Content Structure and Outline Creation",
        description: "Build a comprehensive outline that covers all important aspects of the topic.",
        actions: [
          "Create H1 title that includes primary keyword naturally",
          "Develop H2 and H3 structure covering subtopics and related keywords",
          "Plan introduction that hooks readers with compelling opening",
          "Outline conclusion with clear takeaways and call-to-action"
        ]
      },
      {
        title: "Step 4: Content Writing and Development",
        description: "Create engaging, informative content that provides real value to readers.",
        actions: [
          "Write compelling meta title and description under character limits",
          "Craft introduction that immediately addresses reader's search intent",
          "Develop body sections with actionable insights, examples, and data",
          "Use formatting (bullet points, numbered lists, bold text) for readability"
        ]
      },
      {
        title: "Step 5: SEO Optimization",
        description: "Optimize content for search engines while maintaining readability and user experience.",
        actions: [
          "Include target keyword in title, first paragraph, and naturally throughout content",
          "Add relevant internal links to other valuable content on your site",
          "Include external links to authoritative sources for credibility",
          "Optimize images with descriptive alt text and file names"
        ]
      },
      {
        title: "Step 6: Quality Assurance and Publishing",
        description: "Review, refine, and publish content with proper technical setup.",
        actions: [
          "Proofread for grammar, spelling, and factual accuracy",
          "Check that all links work correctly and open appropriately",
          "Add schema markup for rich snippets if applicable",
          "Set up social media sharing and email promotion"
        ]
      },
      {
        title: "Step 7: Performance Monitoring and Optimization",
        description: "Track content performance and make improvements based on data.",
        actions: [
          "Monitor rankings, traffic, and engagement in Google Analytics",
          "Update content regularly with new information and insights",
          "Respond to comments and engage with readers",
          "Repurpose successful content into other formats (videos, social posts)"
        ]
      }
    ],
    variations: [
      { name: "How-to Blog Posts", description: "Step-by-step instructional content that solves specific problems" },
      { name: "Listicle Articles", description: "Numbered or bulleted lists that are easy to scan and share" },
      { name: "Comparison Posts", description: "Side-by-side evaluations of products, services, or solutions" },
      { name: "Industry News Analysis", description: "Commentary and insights on current events in your field" }
    ],
    troubleshooting: [
      { problem: "Low search rankings despite good content", solution: "Build more high-quality backlinks and improve site technical SEO" },
      { problem: "High bounce rate on blog posts", solution: "Improve page loading speed and ensure content matches search intent" },
      { problem: "Difficulty finding unique angles", solution: "Survey your audience for specific questions and pain points" },
      { problem: "Content not converting readers", solution: "Add more compelling calls-to-action and lead magnets throughout content" }
    ],
    resources: [
      { name: "Google's SEO Starter Guide", url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide" },
      { name: "Ahrefs Blog Writing Guide", url: "https://ahrefs.com/blog/how-to-write-a-blog-post/" },
      { name: "Content Marketing Institute", url: "https://contentmarketinginstitute.com/" },
      { name: "Yoast SEO Blog", url: "https://yoast.com/seo-blog/" }
    ]
  },

  "Email Marketing Campaign": {
    name: "Email Marketing Campaign",
    description: "Comprehensive workflow for creating effective email marketing campaigns",
    steps: ["Define campaign objectives and success metrics", "Segment audience based on behavior and demographics", "Create compelling subject lines and preview text", "Design email template with clear call-to-action", "Write persuasive copy that addresses customer pain points", "Set up automation triggers and follow-up sequences", "Test, analyze performance, and optimize based on results"],
    category: "Email Marketing",
    overview: "Build high-converting email campaigns that nurture leads and drive sales through strategic messaging and automation. Perfect for marketers looking to maximize email ROI and customer engagement.",
    prerequisites: ["Email marketing platform (Mailchimp, ConvertKit, etc.)", "Segmented email list", "Brand guidelines", "Clear campaign objectives", "Analytics tracking setup"],
    timeEstimate: "6-10 hours per campaign",
    difficulty: "Intermediate",
    tools: ["Email marketing platform", "Design tools (Canva, Figma)", "A/B testing tools", "Analytics platforms", "CRM system", "Automation tools"],
    detailedSteps: [
      {
        title: "Step 1: Campaign Strategy and Goal Setting",
        description: "Define clear objectives and success metrics for your email campaign.",
        actions: [
          "Set specific, measurable goals (open rates, click rates, conversions)",
          "Define target audience and create detailed buyer personas",
          "Choose campaign type (newsletter, promotional, nurture sequence, etc.)",
          "Establish timeline and frequency for email sends"
        ]
      },
      {
        title: "Step 2: Audience Segmentation",
        description: "Divide your email list into targeted segments for personalized messaging.",
        actions: [
          "Segment by demographics, behavior, purchase history, and engagement level",
          "Create dynamic segments that update automatically based on criteria",
          "Develop personalized messaging angles for each segment",
          "Test segment sizes to ensure statistical significance for testing"
        ]
      },
      {
        title: "Step 3: Subject Line and Preview Text Creation",
        description: "Craft compelling subject lines that maximize open rates.",
        actions: [
          "Write multiple subject line variations using different psychological triggers",
          "Keep subject lines under 50 characters for mobile optimization",
          "Create preview text that complements and extends the subject line",
          "Avoid spam trigger words and excessive punctuation"
        ]
      },
      {
        title: "Step 4: Email Template Design",
        description: "Design visually appealing emails that work across all devices and email clients.",
        actions: [
          "Choose responsive template that displays well on mobile devices",
          "Include clear branding elements and consistent visual hierarchy",
          "Design prominent, action-oriented call-to-action buttons",
          "Ensure accessibility with alt text for images and proper contrast ratios"
        ]
      },
      {
        title: "Step 5: Email Copy Development",
        description: "Write persuasive email content that drives action and engagement.",
        actions: [
          "Start with attention-grabbing opening that connects with reader's needs",
          "Focus on benefits rather than features in your messaging",
          "Use storytelling and social proof to build credibility",
          "Include clear, single call-to-action that guides readers to next step"
        ]
      },
      {
        title: "Step 6: Automation and Sequence Setup",
        description: "Configure email automation to deliver the right message at the right time.",
        actions: [
          "Set up trigger-based automation for behavior-driven emails",
          "Create drip sequences for lead nurturing and onboarding",
          "Configure follow-up emails based on engagement and actions",
          "Test automation flows with different scenarios and edge cases"
        ]
      },
      {
        title: "Step 7: Testing and Optimization",
        description: "Continuously test and improve campaign performance through data-driven optimization.",
        actions: [
          "A/B test subject lines, send times, and content variations",
          "Monitor key metrics: open rates, click rates, conversion rates, unsubscribes",
          "Analyze heatmaps and click tracking data for optimization insights",
          "Implement winning variations and document learnings for future campaigns"
        ]
      }
    ],
    variations: [
      { name: "Welcome Email Series", description: "Automated sequence for new subscribers to introduce your brand and build relationships" },
      { name: "Product Launch Campaign", description: "Multi-email sequence building anticipation and driving sales for new products" },
      { name: "Re-engagement Campaign", description: "Targeted emails to win back inactive subscribers and reduce list churn" },
      { name: "Event Promotion Series", description: "Time-sensitive campaign promoting webinars, conferences, or special events" }
    ],
    troubleshooting: [
      { problem: "Low open rates", solution: "Test different subject lines, sender names, and send times; clean inactive subscribers" },
      { problem: "High unsubscribe rates", solution: "Review email frequency, ensure content relevance, and improve list opt-in process" },
      { problem: "Poor deliverability", solution: "Authenticate your domain, maintain good sender reputation, and avoid spam triggers" },
      { problem: "Low click-through rates", solution: "Improve call-to-action design, reduce friction, and ensure mobile optimization" }
    ],
    resources: [
      { name: "Email Marketing Best Practices", url: "https://mailchimp.com/resources/email-marketing-best-practices/" },
      { name: "Campaign Monitor Email Guide", url: "https://www.campaignmonitor.com/resources/guides/" },
      { name: "Really Good Emails Gallery", url: "https://reallygoodemails.com/" },
      { name: "Email Marketing Benchmarks", url: "https://www.mailchimp.com/resources/email-marketing-benchmarks/" }
    ]
  },

  "Technical Documentation Process": {
    name: "Technical Documentation Process",
    description: "Structured approach to creating clear and comprehensive technical documentation",
    steps: ["Analyze user personas and documentation needs", "Create information architecture and navigation structure", "Write step-by-step procedures with screenshots", "Include code examples and troubleshooting guides", "Review with subject matter experts and end users", "Implement feedback and maintain documentation currency", "Track usage analytics and continuously improve content"],
    category: "Technical Writing",
    overview: "Create user-friendly technical documentation that reduces support tickets and improves product adoption. Essential for software companies, API providers, and technical teams who need clear communication with users.",
    prerequisites: ["Access to product/system being documented", "Understanding of user personas", "Documentation platform setup", "Screen capture tools", "Subject matter expert availability"],
    timeEstimate: "8-12 hours per major feature/section",
    difficulty: "Advanced",
    tools: ["Documentation platforms (GitBook, Notion, Confluence)", "Screen recording/capture tools", "Code editors", "Diagramming tools", "Analytics tools", "Version control systems"],
    detailedSteps: [
      {
        title: "Step 1: User Research and Requirements Analysis",
        description: "Understand your documentation users and their specific needs and contexts.",
        actions: [
          "Survey existing users about their documentation pain points and preferences",
          "Create detailed user personas including technical skill levels and use cases",
          "Analyze support tickets to identify common questions and confusion points",
          "Define success metrics for documentation effectiveness"
        ]
      },
      {
        title: "Step 2: Information Architecture Design",
        description: "Create logical structure and navigation that helps users find information quickly.",
        actions: [
          "Organize content by user journey and task-based categories",
          "Create hierarchical structure with clear categories and subcategories",
          "Design intuitive navigation with search functionality and filtering",
          "Plan content relationships and cross-referencing strategy"
        ]
      },
      {
        title: "Step 3: Content Creation and Writing",
        description: "Write clear, actionable documentation with appropriate detail level for your audience.",
        actions: [
          "Use clear, concise language avoiding unnecessary jargon",
          "Write step-by-step procedures with numbered lists and clear actions",
          "Include relevant screenshots, diagrams, and visual aids",
          "Provide context and explain the 'why' behind procedures when helpful"
        ]
      },
      {
        title: "Step 4: Code Examples and Technical Details",
        description: "Include comprehensive code samples and technical specifications that developers need.",
        actions: [
          "Provide working code examples in multiple programming languages where applicable",
          "Include complete request/response examples for APIs",
          "Document all parameters, options, and configuration details",
          "Create interactive code samples where possible for better user experience"
        ]
      },
      {
        title: "Step 5: Troubleshooting and FAQ Development",
        description: "Anticipate common issues and provide solutions to reduce support burden.",
        actions: [
          "Document common error messages and their solutions",
          "Create troubleshooting flowcharts for complex issues",
          "Include FAQ section addressing frequently asked questions",
          "Provide debugging tips and diagnostic procedures"
        ]
      },
      {
        title: "Step 6: Review and Quality Assurance",
        description: "Ensure accuracy and usability through comprehensive review process.",
        actions: [
          "Conduct technical review with subject matter experts for accuracy",
          "Test all procedures and code examples to ensure they work correctly",
          "Get feedback from representative end users on clarity and completeness",
          "Review for consistency in style, terminology, and formatting"
        ]
      },
      {
        title: "Step 7: Maintenance and Continuous Improvement",
        description: "Keep documentation current and improve based on user behavior and feedback.",
        actions: [
          "Set up analytics to track page views, search queries, and user behavior",
          "Establish regular review cycles to update content for product changes",
          "Monitor user feedback and support tickets for documentation gaps",
          "Continuously optimize based on user data and changing needs"
        ]
      }
    ],
    variations: [
      { name: "API Documentation", description: "Technical reference for developers integrating with APIs and SDKs" },
      { name: "User Manuals", description: "End-user guides for software applications and digital products" },
      { name: "Installation Guides", description: "Step-by-step setup and configuration instructions" },
      { name: "Developer Tutorials", description: "Educational content teaching concepts and implementation patterns" }
    ],
    troubleshooting: [
      { problem: "Users still contacting support despite documentation", solution: "Analyze support tickets to identify gaps and improve content discoverability" },
      { problem: "Documentation quickly becomes outdated", solution: "Integrate documentation updates into your product development workflow" },
      { problem: "Low user engagement with documentation", solution: "Improve information architecture and add interactive elements like search and filtering" },
      { problem: "Inconsistent quality across different sections", solution: "Create style guides and templates for consistent documentation standards" }
    ],
    resources: [
      { name: "Write the Docs Community", url: "https://www.writethedocs.org/" },
      { name: "Technical Writing Best Practices", url: "https://developers.google.com/tech-writing" },
      { name: "Documentation Style Guides", url: "https://github.com/styleguide/templates" },
      { name: "API Documentation Examples", url: "https://github.com/Redocly/awesome-openapi3" }
    ]
  },

  // IMAGE WORKFLOWS
  "Visual Brand Asset Creation": {
    name: "Visual Brand Asset Creation",
    description: "Comprehensive process for creating consistent visual brand materials",
    steps: ["Define brand visual guidelines and standards", "Create mood boards and style references", "Design primary visual assets and templates", "Test assets across different platforms and contexts", "Create usage guidelines and asset library", "Distribute assets to relevant teams"],
    category: "Brand Management",
    overview: "Establish a cohesive visual identity that strengthens brand recognition across all touchpoints. Essential for businesses building consistent brand presence across digital and print media.",
    prerequisites: ["Brand strategy documentation", "Design software proficiency", "Understanding of brand values", "Access to design tools", "Stakeholder feedback process"],
    timeEstimate: "2-4 weeks for complete brand system",
    difficulty: "Advanced",
    tools: ["Adobe Creative Suite", "Figma/Sketch", "Brand management platforms", "Color palette tools", "Font management software", "Asset management systems"],
    detailedSteps: [
      {
        title: "Step 1: Brand Foundation and Guidelines",
        description: "Establish the visual foundation based on brand strategy and positioning.",
        actions: [
          "Review brand strategy documents and core values",
          "Define brand personality traits that should be reflected visually",
          "Research visual trends in your industry and competitive landscape",
          "Create comprehensive brand guidelines document with visual standards"
        ]
      },
      {
        title: "Step 2: Visual Research and Mood Boarding",
        description: "Gather visual inspiration and create mood boards to guide design direction.",
        actions: [
          "Collect visual references that align with brand personality",
          "Create mood boards exploring different aesthetic directions",
          "Test mood boards with stakeholders to validate direction",
          "Refine visual direction based on feedback and brand requirements"
        ]
      },
      {
        title: "Step 3: Primary Asset Development",
        description: "Design core visual elements that will form the foundation of your brand identity.",
        actions: [
          "Design logo variations for different use cases and contexts",
          "Develop comprehensive color palette with primary and secondary colors",
          "Select and specify typography system with hierarchy and pairing rules",
          "Create iconography system with consistent style and meaning"
        ]
      },
      {
        title: "Step 4: Template and Application Design",
        description: "Create templates and guidelines for consistent application across materials.",
        actions: [
          "Design business card, letterhead, and basic stationery templates",
          "Create social media templates for consistent posting across platforms",
          "Develop presentation templates and document formatting guidelines",
          "Design email signature templates and digital application guidelines"
        ]
      },
      {
        title: "Step 5: Cross-Platform Testing and Optimization",
        description: "Test visual assets across different contexts to ensure consistent quality.",
        actions: [
          "Test logo legibility at various sizes from favicon to billboard scale",
          "Verify color accuracy across digital screens and print materials",
          "Check typography readability in different contexts and sizes",
          "Ensure visual consistency across web, mobile, and print applications"
        ]
      },
      {
        title: "Step 6: Asset Library and Documentation",
        description: "Organize assets and create comprehensive usage guidelines.",
        actions: [
          "Create organized digital asset library with naming conventions",
          "Document usage guidelines including do's and don'ts for each asset",
          "Specify file formats and technical requirements for different uses",
          "Create brand guidelines document with visual examples and specifications"
        ]
      },
      {
        title: "Step 7: Distribution and Team Training",
        description: "Ensure proper implementation across the organization.",
        actions: [
          "Set up shared access to brand assets for relevant team members",
          "Train teams on proper brand asset usage and guidelines",
          "Establish approval processes for new brand applications",
          "Create system for maintaining and updating brand assets over time"
        ]
      }
    ],
    variations: [
      { name: "Logo Design Focus", description: "Concentrated development of logo and primary brand mark variations" },
      { name: "Digital Brand System", description: "Brand assets optimized specifically for digital applications and platforms" },
      { name: "Print Brand Materials", description: "Traditional print-focused brand assets including business cards and stationery" },
      { name: "Brand Refresh Project", description: "Updating and modernizing existing brand assets while maintaining recognition" }
    ],
    troubleshooting: [
      { problem: "Brand assets look inconsistent across applications", solution: "Create more detailed usage guidelines and provide design templates for common applications" },
      { problem: "Team members not using brand assets correctly", solution: "Improve training and create simplified asset packs for non-designers" },
      { problem: "Brand assets don't work well in all contexts", solution: "Develop more logo variations and alternative color schemes for different backgrounds" },
      { problem: "Brand feels outdated quickly", solution: "Build flexibility into the system and establish regular review cycles for updates" }
    ],
    resources: [
      { name: "Brand Identity Design Best Practices", url: "https://www.smashingmagazine.com/2010/06/design-better-brand-identity/" },
      { name: "Logo Design Guidelines", url: "https://logogeek.uk/logo-design/logo-design-process/" },
      { name: "Color Theory for Brands", url: "https://blog.hubspot.com/marketing/color-theory-for-marketers" },
      { name: "Typography in Branding", url: "https://www.canva.com/learn/typography-branding/" }
    ]
  },

  "Social Media Visual Content Creation": {
    name: "Social Media Visual Content Creation",
    description: "Systematic approach to creating engaging visual content for social platforms",
    steps: ["Research platform-specific visual requirements and trends", "Create content calendar with visual themes and campaigns", "Design templates for different content types and formats", "Create original graphics, photos, or source stock images", "Optimize images for each platform's specifications", "Add brand elements, text overlays, and call-to-actions", "Schedule posts and monitor engagement metrics for optimization"],
    category: "Social Media",
    overview: "Build a consistent visual presence across social media platforms that engages your audience and drives brand awareness. Perfect for social media managers and content creators building online communities.",
    prerequisites: ["Social media platform knowledge", "Basic design skills", "Brand guidelines", "Content planning tools", "Design software access"],
    timeEstimate: "3-5 hours per week for ongoing content",
    difficulty: "Beginner to Intermediate",
    tools: ["Canva or Adobe Creative Suite", "Social media scheduling tools", "Stock photo platforms", "Analytics tools", "Phone camera or professional photography equipment", "Content planning platforms"],
    detailedSteps: [
      {
        title: "Step 1: Platform Research and Requirements Analysis",
        description: "Understand each social media platform's unique visual requirements and audience preferences.",
        actions: [
          "Research optimal image dimensions for each platform (Instagram, Facebook, Twitter, LinkedIn, TikTok)",
          "Study successful content in your industry to identify trends and engagement patterns",
          "Analyze your audience demographics and content preferences on each platform",
          "Document platform-specific best practices for visual content"
        ]
      },
      {
        title: "Step 2: Content Calendar and Theme Development",
        description: "Plan visual content themes and campaigns that align with business goals and seasonal trends.",
        actions: [
          "Create monthly content themes tied to business objectives and seasonal events",
          "Plan content mix including educational, entertaining, promotional, and behind-the-scenes content",
          "Establish consistent posting frequency and optimal timing for each platform",
          "Coordinate visual content with overall marketing campaigns and product launches"
        ]
      },
      {
        title: "Step 3: Template Design and Brand Consistency",
        description: "Create reusable templates that maintain brand consistency while allowing for content variety.",
        actions: [
          "Design template variations for quotes, tips, product features, and announcements",
          "Establish consistent color schemes, fonts, and brand element placement",
          "Create templates for Stories, feed posts, and platform-specific formats",
          "Design templates that can be easily customized for different content topics"
        ]
      },
      {
        title: "Step 4: Content Creation and Asset Development",
        description: "Produce original visual content including graphics, photos, and multimedia assets.",
        actions: [
          "Take high-quality photos of products, team members, and behind-the-scenes content",
          "Create original graphics using brand templates and visual elements",
          "Source appropriate stock photos that align with brand aesthetic",
          "Develop video content and animated graphics for enhanced engagement"
        ]
      },
      {
        title: "Step 5: Platform Optimization and Formatting",
        description: "Optimize visual content for each platform's specific requirements and best practices.",
        actions: [
          "Resize and format images for optimal display on each platform",
          "Add appropriate hashtags and platform-specific elements",
          "Optimize image file sizes for fast loading while maintaining quality",
          "Create platform-specific variations of the same content when beneficial"
        ]
      },
      {
        title: "Step 6: Brand Integration and Call-to-Action Addition",
        description: "Enhance visuals with brand elements and strategic calls-to-action.",
        actions: [
          "Add brand logos, watermarks, or subtle branding elements to protect content",
          "Include clear, action-oriented text overlays and calls-to-action",
          "Ensure all text is readable on mobile devices and various screen sizes",
          "Balance promotional content with value-driven educational content"
        ]
      },
      {
        title: "Step 7: Scheduling, Publishing, and Performance Monitoring",
        description: "Deploy content strategically and monitor performance for continuous improvement.",
        actions: [
          "Use scheduling tools to post content at optimal times for audience engagement",
          "Monitor engagement metrics including likes, shares, comments, and reach",
          "A/B test different visual styles and formats to identify top performers",
          "Adjust content strategy based on performance data and audience feedback"
        ]
      }
    ],
    variations: [
      { name: "Instagram-First Strategy", description: "Visual content optimized primarily for Instagram feed and Stories" },
      { name: "LinkedIn Professional Content", description: "Business-focused visual content for professional networking and B2B marketing" },
      { name: "TikTok Video Graphics", description: "Eye-catching graphics designed for video content and trending formats" },
      { name: "Multi-Platform Campaigns", description: "Coordinated visual campaigns adapted for multiple social media platforms" }
    ],
    troubleshooting: [
      { problem: "Low engagement on visual posts", solution: "Test different content types, posting times, and increase use of trending hashtags and topics" },
      { problem: "Inconsistent brand appearance", solution: "Create more detailed brand guidelines and use template systems for consistency" },
      { problem: "Time-consuming content creation", solution: "Batch create content and use templates to streamline the production process" },
      { problem: "Poor image quality on mobile", solution: "Optimize image resolution and test display on various mobile devices" }
    ],
    resources: [
      { name: "Social Media Image Size Guide", url: "https://blog.hootsuite.com/social-media-image-sizes-guide/" },
      { name: "Visual Content Marketing Statistics", url: "https://blog.hubspot.com/marketing/visual-content-marketing-statistics" },
      { name: "Canva Design School", url: "https://www.canva.com/designschool/" },
      { name: "Instagram Business Resources", url: "https://business.instagram.com/getting-started" }
    ]
  },
};

export interface WorkflowDetailModalProps {
  workflow: Workflow | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WorkflowDetailModal: React.FC<WorkflowDetailModalProps> = ({
  workflow,
  isOpen,
  onClose,
}) => {
  if (!workflow) return null;

  const detailedWorkflow = workflowDetails[workflow.name];

  if (!detailedWorkflow) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {workflow.name}
              <Badge variant="secondary">{workflow.category}</Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              Detailed workflow documentation for "{workflow.name}" is being prepared.
              Check back soon for comprehensive step-by-step guidance.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {detailedWorkflow.name}
            <Badge variant="secondary">{detailedWorkflow.category}</Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="prerequisites">Prerequisites</TabsTrigger>
            <TabsTrigger value="steps">Steps</TabsTrigger>
            <TabsTrigger value="variations">Variations</TabsTrigger>  
            <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-semibold text-sm text-primary mb-1">Time Estimate</h4>
                <p className="text-sm">{detailedWorkflow.timeEstimate}</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-semibold text-sm text-primary mb-1">Difficulty</h4>
                <p className="text-sm">{detailedWorkflow.difficulty}</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-semibold text-sm text-primary mb-1">Category</h4>
                <p className="text-sm">{detailedWorkflow.category}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Overview</h3>
              <p className="text-muted-foreground leading-relaxed">{detailedWorkflow.overview}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Tools Required</h3>
              <div className="flex flex-wrap gap-2">
                {detailedWorkflow.tools.map((tool, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prerequisites" className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Prerequisites</h3>
            <ul className="space-y-3">
              {detailedWorkflow.prerequisites.map((prerequisite, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{prerequisite}</span>
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="steps" className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Detailed Steps</h3>
            {detailedWorkflow.detailedSteps.map((step, index) => (
              <div key={index} className="border border-border rounded-lg p-6">
                <h4 className="font-semibold text-primary mb-2">{step.title}</h4>
                <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                <ul className="space-y-2">
                  {step.actions.map((action, actionIndex) => (
                    <li key={actionIndex} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="variations" className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Workflow Variations</h3>
            <div className="grid gap-4">
              {detailedWorkflow.variations.map((variation, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">{variation.name}</h4>
                  <p className="text-sm text-muted-foreground">{variation.description}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="troubleshooting" className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Common Issues & Solutions</h3>
            <div className="space-y-4">
              {detailedWorkflow.troubleshooting.map((item, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-red-600 mb-2">Problem: {item.problem}</h4>
                  <p className="text-sm text-green-700"><strong>Solution:</strong> {item.solution}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Additional Resources</h3>
            <div className="grid gap-3">
              {detailedWorkflow.resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium text-primary">{resource.name}</span>
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
