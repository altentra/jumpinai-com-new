import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  FileText, 
  GitBranch, 
  Layers, 
  Target,
  Lock,
  ExternalLink,
  Copy,
  Star,
  TrendingUp,
  Play,
  Type,
  Image,
  Video,
  Headphones,
  Globe
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import WorkflowDetailModal from "@/components/WorkflowDetailModal";
import BlueprintDetailModal from "@/components/BlueprintDetailModal";
import StrategyDetailModal from "@/components/StrategyDetailModal";

// Updated data models with structured information
type Tool = {
  name: string;
  url: string;
  whatItIs: string;
  whatItsFor: string;
  desiredOutcome: string;
  topicCategory: 'Text' | 'Image' | 'Video' | 'Audio' | 'Web/App';
  category: string;
};

type PromptTemplate = {
  name: string;
  whatItIs: string;
  whatItsFor: string;
  desiredOutcome: string;
  prompt: string;
  topicCategory: 'Text' | 'Image' | 'Video' | 'Audio' | 'Web/App';
  category: string;
};

type Workflow = {
  name: string;
  whatItIs: string;
  whatItsFor: string;
  desiredOutcome: string;
  steps: string[];
  topicCategory: 'Text' | 'Image' | 'Video' | 'Audio' | 'Web/App';
  category: string;
};

type Blueprint = {
  name: string;
  whatItIs: string;
  whatItsFor: string;
  desiredOutcome: string;
  template: string;
  topicCategory: 'Text' | 'Image' | 'Video' | 'Audio' | 'Web/App';
  category: string;
};

type Strategy = {
  name: string;
  whatItIs: string;
  whatItsFor: string;
  desiredOutcome: string;
  approach: string;
  topicCategory: 'Text' | 'Image' | 'Video' | 'Audio' | 'Web/App';
  category: string;
};

type TopicCategory = 'Text' | 'Image' | 'Video' | 'Audio' | 'Web/App';

// Tools data with structured information
const tools: Tool[] = [
  // Text Tools
  { 
    name: "OpenAI ChatGPT", 
    url: "https://openai.com/", 
    whatItIs: "Advanced conversational AI model for text generation and analysis",
    whatItsFor: "Writing assistance, content creation, problem-solving, and complex reasoning tasks",
    desiredOutcome: "High-quality text outputs, accurate information, and contextual understanding",
    topicCategory: "Text",
    category: "AI Assistant"
  },
  { 
    name: "Anthropic Claude", 
    url: "https://claude.ai/", 
    whatItIs: "Constitutional AI assistant with strong analytical capabilities",
    whatItsFor: "Long-form content analysis, research, and ethical reasoning",
    desiredOutcome: "Thoughtful analysis, reliable information, and nuanced understanding",
    topicCategory: "Text",
    category: "AI Assistant"
  },
  { 
    name: "Google Gemini", 
    url: "https://gemini.google.com/", 
    whatItIs: "Multimodal AI model integrated with Google's ecosystem",
    whatItsFor: "Text generation with access to real-time information and Google services",
    desiredOutcome: "Current information, seamless integration, and multimodal capabilities",
    topicCategory: "Text",
    category: "AI Assistant"
  },
  { 
    name: "Perplexity", 
    url: "https://www.perplexity.ai/", 
    whatItIs: "AI-powered search engine with source citations",
    whatItsFor: "Research tasks requiring current information with verifiable sources",
    desiredOutcome: "Accurate research with citations, real-time data, and source verification",
    topicCategory: "Text",
    category: "Research"
  },

  // Image Tools
  { 
    name: "Midjourney", 
    url: "https://www.midjourney.com/", 
    whatItIs: "AI image generation platform with artistic focus",
    whatItsFor: "Creating high-quality, stylized images for creative and commercial use",
    desiredOutcome: "Visually stunning, artistic images with unique aesthetic appeal",
    topicCategory: "Image",
    category: "Image Generation"
  },
  { 
    name: "Adobe Firefly", 
    url: "https://www.adobe.com/sensei/generative-ai/firefly.html", 
    whatItIs: "Adobe's generative AI integrated into Creative Cloud",
    whatItsFor: "Professional image creation and editing within existing workflows",
    desiredOutcome: "Brand-safe, editable images with seamless Creative Cloud integration",
    topicCategory: "Image",
    category: "Image Generation"
  },
  { 
    name: "DALL-E 3", 
    url: "https://openai.com/dall-e-3", 
    whatItIs: "OpenAI's advanced text-to-image generation model",
    whatItsFor: "Creating detailed, accurate images from complex text descriptions",
    desiredOutcome: "Precise visual representations that match detailed prompts",
    topicCategory: "Image",
    category: "Image Generation"
  },

  // Video Tools
  { 
    name: "Runway", 
    url: "https://runwayml.com/", 
    whatItIs: "AI-powered video creation and editing platform",
    whatItsFor: "Generating and editing videos with AI assistance",
    desiredOutcome: "Professional-quality video content with AI-enhanced effects",
    topicCategory: "Video",
    category: "Video Generation"
  },
  { 
    name: "Synthesia", 
    url: "https://www.synthesia.io/", 
    whatItIs: "AI video creation platform with synthetic avatars",
    whatItsFor: "Creating training videos, presentations, and educational content",
    desiredOutcome: "Professional videos with AI avatars for scalable content creation",
    topicCategory: "Video",
    category: "Video Generation"
  },
  { 
    name: "Luma Dream Machine", 
    url: "https://lumalabs.ai/", 
    whatItIs: "AI video generation from text and image prompts",
    whatItsFor: "Creating short video clips and animations from descriptions",
    desiredOutcome: "Smooth, realistic video clips for content and marketing",
    topicCategory: "Video",
    category: "Video Generation"
  },

  // Audio Tools
  { 
    name: "ElevenLabs", 
    url: "https://elevenlabs.io/", 
    whatItIs: "AI voice synthesis and speech generation platform",
    whatItsFor: "Creating realistic voiceovers, podcasts, and audio content",
    desiredOutcome: "Natural-sounding speech with customizable voices and emotions",
    topicCategory: "Audio",
    category: "Voice Generation"
  },
  { 
    name: "AIVA", 
    url: "https://www.aiva.ai/", 
    whatItIs: "AI music composition platform",
    whatItsFor: "Creating original soundtracks, background music, and compositions",
    desiredOutcome: "Professional-quality music tailored to specific moods and purposes",
    topicCategory: "Audio",
    category: "Music Generation"
  },
  { 
    name: "Mubert", 
    url: "https://mubert.com/", 
    whatItIs: "AI-powered royalty-free music generation",
    whatItsFor: "Creating background music for content, apps, and commercial use",
    desiredOutcome: "Endless, royalty-free music streams customized to specific needs",
    topicCategory: "Audio",
    category: "Music Generation"
  },

  // Web/App Tools
  { 
    name: "n8n", 
    url: "https://n8n.io/", 
    whatItIs: "Open-source workflow automation platform",
    whatItsFor: "Building automated workflows connecting apps and AI services",
    desiredOutcome: "Streamlined business processes with AI-powered automation",
    topicCategory: "Web/App",
    category: "Automation"
  },
  { 
    name: "Zapier", 
    url: "https://zapier.com/", 
    whatItIs: "No-code automation platform connecting thousands of apps",
    whatItsFor: "Automating repetitive tasks between different web applications",
    desiredOutcome: "Increased productivity through seamless app integrations",
    topicCategory: "Web/App",
    category: "Automation"
  },
  { 
    name: "Bubble", 
    url: "https://bubble.io/", 
    whatItIs: "No-code platform for building web applications",
    whatItsFor: "Creating full-featured web apps without traditional coding",
    desiredOutcome: "Functional web applications built through visual programming",
    topicCategory: "Web/App",
    category: "No-Code Development"
  }
];

// Prompts data with structured information
const promptTemplates: PromptTemplate[] = [
  // Text Prompts
  {
    name: "Product Marketing Brief",
    whatItIs: "Comprehensive product launch messaging framework",
    whatItsFor: "Creating structured marketing briefs for new features or products",
    desiredOutcome: "Clear positioning, benefits, and compelling messaging that drives adoption",
    prompt: "Act as a senior product marketer. Create a 500‑word launch brief for a B2B SaaS feature. Include: 1) narrative, 2) ICP pain, 3) 3 key benefits, 4) messaging pillars, 5) CTA. Tone: confident, concise.",
    topicCategory: "Text",
    category: "Marketing"
  },
  {
    name: "Policy Analysis",
    whatItIs: "Systematic document analysis and SOP creation framework",
    whatItsFor: "Converting complex policy documents into actionable procedures",
    desiredOutcome: "Clear, implementable SOPs with defined steps, owners, and timelines",
    prompt: "You are an operations analyst. Summarize this policy PDF into an SOP with steps, owners, and SLAs. Flag ambiguities and propose fixes.",
    topicCategory: "Text",
    category: "Analysis"
  },
  {
    name: "Executive Summary",
    whatItIs: "Data-driven executive communication template",
    whatItsFor: "Transforming complex data into executive-ready insights",
    desiredOutcome: "Concise, actionable summaries that drive leadership decisions",
    prompt: "As a data storyteller, explain these metrics (paste table) to an executive in 5 bullets. Add a final risk/opportunity section.",
    topicCategory: "Text",
    category: "Business Intelligence"
  },
  {
    name: "Brand Voice Rewrite",
    whatItIs: "Content optimization framework for brand consistency",
    whatItsFor: "Ensuring all communications align with established brand voice",
    desiredOutcome: "Consistent, on-brand messaging that resonates with target audience",
    prompt: "Rewrite this email to match our brand voice (confident, concise, friendly). Keep to 120 words and include CTA to demo.",
    topicCategory: "Text",
    category: "Content Creation"
  },

  // Image Prompts  
  {
    name: "Social Media Visual Brief",
    whatItIs: "Visual content creation framework for social platforms",
    whatItsFor: "Generating engaging social media graphics and visual content",
    desiredOutcome: "Platform-optimized visuals that drive engagement and brand recognition",
    prompt: "Create a visual content brief for [PLATFORM]. Include: 1) Brand elements to incorporate, 2) Color palette and style, 3) Key message hierarchy, 4) Call-to-action placement, 5) Platform specifications and best practices.",
    topicCategory: "Image",
    category: "Social Media"
  },
  {
    name: "Product Photography Direction",
    whatItIs: "Professional product visual planning framework",
    whatItsFor: "Creating compelling product imagery for marketing and sales",
    desiredOutcome: "High-converting product visuals that showcase features and benefits",
    prompt: "Develop product photography direction for [PRODUCT]. Include: 1) Lighting setup and mood, 2) Props and styling requirements, 3) Key features to highlight, 4) Multiple angle requirements, 5) Brand consistency guidelines.",
    topicCategory: "Image",
    category: "Product Marketing"
  },

  // Video Prompts
  {
    name: "Explainer Video Script",
    whatItIs: "Structured video content creation framework",
    whatItsFor: "Creating engaging explainer videos for products or concepts",
    desiredOutcome: "Clear, compelling video content that educates and converts viewers",
    prompt: "Write an explainer video script for [TOPIC]. Structure: Hook (0-5s), Problem (5-15s), Solution (15-45s), Benefits (45-60s), CTA (60-70s). Include visual cues and timing.",
    topicCategory: "Video",
    category: "Educational Content"
  },

  // Audio Prompts
  {
    name: "Podcast Episode Structure",
    whatItIs: "Professional podcast content planning framework",
    whatItsFor: "Creating engaging, well-structured podcast episodes",
    desiredOutcome: "Compelling audio content that retains listeners and drives engagement",
    prompt: "Design podcast episode structure for [TOPIC]. Include: 1) Hook and intro (0-2min), 2) Main content segments with transitions, 3) Guest interview questions, 4) Key takeaways summary, 5) CTA and outro.",
    topicCategory: "Audio",
    category: "Content Creation"
  },

  // Web/App Prompts
  {
    name: "User Experience Audit",
    whatItIs: "Comprehensive UX evaluation and improvement framework",
    whatItsFor: "Identifying and fixing user experience issues in digital products",
    desiredOutcome: "Improved user satisfaction, conversion rates, and product usability",
    prompt: "Conduct UX audit for [WEBSITE/APP]. Analyze: 1) User journey and pain points, 2) Interface usability issues, 3) Conversion funnel optimization, 4) Accessibility compliance, 5) Mobile responsiveness, 6) Performance recommendations.",
    topicCategory: "Web/App",
    category: "User Experience"
  }
];

// Workflows data with structured information
const workflows: Workflow[] = [
  // Text Workflows
  {
    name: "Content Creation Pipeline",
    whatItIs: "Systematic approach to producing high-quality written content",
    whatItsFor: "Creating consistent, engaging content across multiple channels",
    desiredOutcome: "Streamlined content production with consistent quality and brand voice",
    steps: [
      "Define target audience, goals, and key messages",
      "Research topic thoroughly and gather supporting data",
      "Create detailed outline with clear structure",
      "Write first draft focusing on core message",
      "Review and optimize for brand voice and SEO",
      "Get feedback and iterate based on input",
      "Finalize and schedule for publication"
    ],
    topicCategory: "Text",
    category: "Content Marketing"
  },
  {
    name: "Document Analysis Workflow",
    whatItIs: "Structured process for analyzing and extracting insights from documents",
    whatItsFor: "Converting complex documents into actionable business intelligence",
    desiredOutcome: "Clear insights and recommendations from document analysis",
    steps: [
      "Upload and digitize source documents",
      "Identify key sections and data points",
      "Extract and categorize important information",
      "Analyze patterns and trends in the data",
      "Create executive summary with recommendations",
      "Validate findings with stakeholders"
    ],
    topicCategory: "Text",
    category: "Business Intelligence"
  },

  // Image Workflows
  {
    name: "Visual Brand Asset Creation",
    whatItIs: "Comprehensive process for creating consistent visual brand materials",
    whatItsFor: "Maintaining brand consistency across all visual touchpoints",
    desiredOutcome: "Cohesive visual identity that strengthens brand recognition",
    steps: [
      "Define brand visual guidelines and standards",
      "Create mood boards and style references",
      "Design primary visual assets and templates",
      "Test assets across different platforms and contexts",
      "Create usage guidelines and asset library",
      "Distribute assets to relevant teams"
    ],
    topicCategory: "Image",
    category: "Brand Management"
  },

  // Video Workflows
  {
    name: "Video Content Production",
    whatItIs: "End-to-end process for creating professional video content",
    whatItsFor: "Producing engaging video content for marketing and education",
    desiredOutcome: "High-quality videos that achieve specific business objectives",
    steps: [
      "Define video objectives and target audience",
      "Create detailed script and storyboard",
      "Plan production schedule and resource requirements",
      "Film or create video assets",
      "Edit and add graphics, music, and effects",
      "Review, get approval, and make final adjustments",
      "Publish and promote across relevant channels"
    ],
    topicCategory: "Video",
    category: "Content Production"
  },

  // Audio Workflows
  {
    name: "Podcast Production Pipeline",
    whatItIs: "Complete workflow for podcast creation and distribution",
    whatItsFor: "Creating professional podcasts that engage and retain audiences",
    desiredOutcome: "Consistent, high-quality podcast episodes that build audience",
    steps: [
      "Research topic and prepare detailed outline",
      "Schedule and conduct interviews or record content",
      "Edit audio for clarity and pacing",
      "Add intro, outro, and background music",
      "Create show notes and timestamps",
      "Upload to podcast platforms and promote"
    ],
    topicCategory: "Audio",
    category: "Content Creation"
  },

  // Web/App Workflows
  {
    name: "App Development Lifecycle",
    whatItIs: "Structured approach to building and launching digital applications",
    whatItsFor: "Creating user-friendly applications that meet business requirements",
    desiredOutcome: "Successful app launch with strong user adoption and engagement",
    steps: [
      "Define app requirements and user stories",
      "Create wireframes and user interface designs",
      "Develop MVP with core functionality",
      "Conduct user testing and gather feedback",
      "Iterate based on user feedback and metrics",
      "Launch with marketing and user acquisition strategy"
    ],
    topicCategory: "Web/App",
    category: "Product Development"
  }
];

// Blueprints data with structured information
const blueprints: Blueprint[] = [
  // Text Blueprints
  {
    name: "Content Strategy Blueprint",
    whatItIs: "Comprehensive template for planning content marketing initiatives",
    whatItsFor: "Creating data-driven content strategies that drive business results",
    desiredOutcome: "Clear content roadmap with defined goals, metrics, and execution plan",
    template: `# Content Strategy Blueprint

## Executive Summary
[Brief overview of content strategy goals and approach]

## Target Audience Analysis
### Primary Audience
- Demographics: [Age, location, job title]
- Pain Points: [Key challenges they face]
- Content Preferences: [Preferred formats and channels]

### Secondary Audiences
[Additional audience segments and their characteristics]

## Content Pillars
1. [Pillar 1]: [Description and purpose]
2. [Pillar 2]: [Description and purpose]
3. [Pillar 3]: [Description and purpose]

## Content Calendar
### Monthly Themes
- Month 1: [Theme and focus]
- Month 2: [Theme and focus]
- Month 3: [Theme and focus]

### Content Types & Frequency
- Blog Posts: [Frequency and topics]
- Social Media: [Platform-specific content plan]
- Email Newsletter: [Frequency and themes]

## Success Metrics
### Primary KPIs
- [Metric 1]: [Target and measurement method]
- [Metric 2]: [Target and measurement method]

### Secondary Metrics
- [Additional metrics to track]

## Resource Requirements
- Team members needed: [Roles and responsibilities]
- Budget allocation: [Content creation, promotion, tools]
- Tools and platforms: [Required software and subscriptions]

## Implementation Timeline
### Phase 1 (Months 1-2): [Initial focus and deliverables]
### Phase 2 (Months 3-4): [Scaling and optimization]
### Phase 3 (Months 5-6): [Advanced tactics and analysis]`,
    topicCategory: "Text",
    category: "Marketing Strategy"
  },

  // Image Blueprints
  {
    name: "Visual Brand Guidelines",
    whatItIs: "Complete template for defining and maintaining visual brand consistency",
    whatItsFor: "Ensuring consistent brand representation across all visual materials",
    desiredOutcome: "Cohesive brand identity that builds recognition and trust",
    template: `# Visual Brand Guidelines

## Brand Overview
### Mission Statement
[Company mission and values]

### Brand Personality
[Key personality traits and characteristics]

## Logo Usage
### Primary Logo
- File formats: [Available formats and usage]
- Minimum sizes: [Size requirements for different applications]
- Clear space: [Spacing requirements around logo]

### Logo Variations
- Horizontal version: [When to use]
- Vertical version: [When to use]
- Icon version: [When to use]

### Logo Don'ts
- [List of prohibited logo uses]

## Color Palette
### Primary Colors
- Color 1: [Hex code, RGB, CMYK values and usage]
- Color 2: [Hex code, RGB, CMYK values and usage]

### Secondary Colors
- [Additional colors with specifications]

### Color Applications
- Digital: [RGB values for screens]
- Print: [CMYK values for printing]

## Typography
### Primary Typeface
- Font family: [Name and characteristics]
- Usage: [When to use this font]

### Secondary Typeface
- Font family: [Name and characteristics]
- Usage: [When to use this font]

## Visual Elements
### Photography Style
- [Description of preferred photography style]
- [Do's and don'ts for imagery]

### Iconography
- [Style guidelines for icons and graphics]
- [Approved icon libraries or custom requirements]

## Application Examples
### Business Cards
### Letterhead
### Website Headers
### Social Media Assets`,
    topicCategory: "Image",
    category: "Brand Identity"
  },

  // Video Blueprints
  {
    name: "Video Marketing Campaign Template",
    whatItIs: "Structured framework for planning and executing video marketing campaigns",
    whatItsFor: "Creating effective video campaigns that drive engagement and conversions",
    desiredOutcome: "Successful video campaigns with measurable business impact",
    template: `# Video Marketing Campaign Blueprint

## Campaign Overview
### Campaign Name: [Campaign title]
### Campaign Goals: [Specific, measurable objectives]
### Target Audience: [Primary and secondary audiences]
### Campaign Duration: [Start and end dates]

## Video Content Strategy
### Core Message
[Primary message to communicate]

### Video Types
1. **Hero Video**
   - Purpose: [Main campaign driver]
   - Length: [Duration]
   - Distribution: [Where it will be shared]

2. **Supporting Videos**
   - Video 2: [Purpose and specifications]
   - Video 3: [Purpose and specifications]

## Production Requirements
### Pre-Production
- Script development: [Timeline and requirements]
- Storyboard creation: [Visual planning needs]
- Location scouting: [If applicable]
- Talent casting: [If applicable]

### Production
- Filming schedule: [Dates and logistics]
- Equipment needs: [Cameras, lighting, audio]
- Crew requirements: [Roles needed]

### Post-Production
- Editing timeline: [Expected completion dates]
- Graphics and animation: [Requirements]
- Sound design and music: [Audio needs]

## Distribution Strategy
### Primary Channels
- [Platform 1]: [Content format and posting schedule]
- [Platform 2]: [Content format and posting schedule]

### Paid Promotion
- Budget allocation: [Amount per platform]
- Targeting criteria: [Audience specifications]
- Timeline: [Campaign dates]

## Success Metrics
### Awareness Metrics
- Reach: [Target numbers]
- Impressions: [Target numbers]
- Brand lift: [Measurement method]

### Engagement Metrics
- View completion rate: [Target percentage]
- Social shares: [Target numbers]
- Comments and likes: [Target engagement]

### Conversion Metrics
- Click-through rate: [Target percentage]
- Lead generation: [Target numbers]
- Sales attribution: [Revenue goals]

## Timeline and Milestones
### Week 1-2: [Planning and preparation]
### Week 3-4: [Production phase]
### Week 5-6: [Post-production and review]
### Week 7-8: [Launch and promotion]
### Week 9-10: [Optimization and analysis]`,
    topicCategory: "Video",
    category: "Marketing Campaign"
  },

  // Audio Blueprints
  {
    name: "Podcast Launch Strategy",
    whatItIs: "Complete framework for launching and growing a successful podcast",
    whatItsFor: "Building an engaged podcast audience and establishing thought leadership",
    desiredOutcome: "Successful podcast launch with sustainable growth and engagement",
    template: `# Podcast Launch Strategy Blueprint

## Podcast Concept
### Show Name: [Podcast title]
### Tagline: [Brief description of the show]
### Format: [Interview, solo, panel, etc.]
### Episode Length: [Target duration]
### Release Schedule: [Frequency and day of week]

## Target Audience
### Primary Listener
- Demographics: [Age, profession, interests]
- Pain points: [What challenges they face]
- Listening habits: [When and where they consume podcasts]

### Value Proposition
[What unique value does your podcast provide?]

## Content Strategy
### Show Themes
1. [Theme 1]: [Description and episode ideas]
2. [Theme 2]: [Description and episode ideas]
3. [Theme 3]: [Description and episode ideas]

### Episode Structure
- Intro: [Duration and content]
- Main content: [Segments and flow]
- Outro: [Call-to-action and closing]

### Guest Strategy
- Target guest profile: [Type of guests to pursue]
- Outreach process: [How to find and contact guests]
- Preparation process: [Pre-interview requirements]

## Production Workflow
### Recording Setup
- Equipment: [Microphones, software, etc.]
- Recording schedule: [When and how often]
- Remote recording: [Tools and process]

### Post-Production
- Editing software: [Tools and workflow]
- Audio enhancement: [Noise reduction, leveling]
- Intro/outro music: [Selection and licensing]

## Distribution Strategy
### Podcast Platforms
- Primary platforms: [Apple Podcasts, Spotify, etc.]
- Submission process: [Requirements and timeline]
- RSS feed setup: [Technical requirements]

### Promotion Channels
- Social media: [Platform-specific strategies]
- Email marketing: [Newsletter integration]
- Website integration: [Show notes and transcripts]

## Monetization Strategy
### Revenue Streams
- Sponsorships: [Target advertisers and rates]
- Premium content: [Paid subscription options]
- Affiliate marketing: [Product recommendations]

### Audience Growth Targets
- Month 1: [Download and subscriber goals]
- Month 3: [Growth milestones]
- Month 6: [Long-term targets]

## Launch Plan
### Pre-Launch (8 weeks out)
- Week 1-2: [Content planning and guest booking]
- Week 3-4: [Recording first episodes]
- Week 5-6: [Website and artwork creation]
- Week 7-8: [Platform submission and marketing prep]

### Launch Week
- Day 1: [Launch activities]
- Day 2-3: [Promotion push]
- Day 4-7: [Community engagement and feedback collection]

### Post-Launch (First 3 months)
- Month 1: [Focus areas and goals]
- Month 2: [Optimization and growth tactics]
- Month 3: [Review and strategy adjustment]`,
    topicCategory: "Audio",
    category: "Content Strategy"
  },

  // Web/App Blueprints
  {
    name: "SaaS Product Launch Blueprint",
    whatItIs: "Comprehensive template for launching software-as-a-service products",
    whatItsFor: "Ensuring successful product launches with strong market penetration",
    desiredOutcome: "Successful SaaS launch with rapid user acquisition and revenue growth",
    template: `# SaaS Product Launch Blueprint

## Product Overview
### Product Name: [Product title]
### Core Value Proposition: [Primary benefit and differentiation]
### Target Market: [Primary customer segment]
### Pricing Model: [Subscription tiers and pricing]

## Pre-Launch Strategy
### Market Research
- Competitive analysis: [Key competitors and positioning]
- Customer interviews: [Validation and feedback]
- Market size: [TAM, SAM, SOM analysis]

### Product Development
- MVP features: [Core functionality for launch]
- User testing: [Beta program and feedback integration]
- Technical requirements: [Infrastructure and security]

## Go-to-Market Strategy
### Customer Acquisition
#### Primary Channels
1. **Content Marketing**
   - Blog strategy: [Topics and publishing schedule]
   - SEO focus: [Target keywords and content gaps]
   - Lead magnets: [Free resources to capture leads]

2. **Paid Advertising**
   - Google Ads: [Campaign structure and budget]
   - Social media ads: [Platform selection and targeting]
   - Budget allocation: [Monthly spend by channel]

3. **Partnership Marketing**
   - Integration partners: [Technical partnerships]
   - Referral program: [Partner incentive structure]
   - Industry associations: [Speaking and sponsorship opportunities]

### Sales Process
- Lead qualification: [BANT criteria or similar framework]
- Sales funnel: [Stages from lead to customer]
- Demo process: [Product demonstration strategy]
- Pricing negotiations: [Discount policies and approval process]

## Launch Timeline
### 3 Months Before Launch
- Finalize product features and pricing
- Build marketing website and landing pages
- Start content marketing and SEO efforts
- Begin partnership discussions

### 1 Month Before Launch
- Complete beta testing and incorporate feedback
- Launch paid advertising campaigns
- Begin PR and media outreach
- Train sales team on positioning and demo

### Launch Week
- Product announcement across all channels
- Press release distribution
- Customer success team activation
- Monitor metrics and respond to feedback

### Post-Launch (First 90 Days)
- Daily monitoring of key metrics
- Weekly optimization of marketing campaigns
- Monthly business review and strategy adjustment
- Quarterly product roadmap updates

## Success Metrics
### Product Metrics
- Monthly active users: [Target growth rate]
- User retention: [30, 60, 90-day retention rates]
- Feature adoption: [Core feature usage rates]

### Business Metrics
- Monthly recurring revenue: [Growth targets]
- Customer acquisition cost: [Target CAC by channel]
- Lifetime value: [LTV targets and cohort analysis]
- Churn rate: [Acceptable churn thresholds]

### Marketing Metrics
- Website traffic: [Organic and paid traffic goals]
- Conversion rates: [Landing page and trial conversions]
- Lead quality: [SQL and MQL targets]

## Risk Management
### Technical Risks
- Scalability issues: [Mitigation strategies]
- Security vulnerabilities: [Security protocols]
- Integration failures: [Backup plans]

### Market Risks
- Competitive responses: [Monitoring and response plans]
- Economic conditions: [Scenario planning]
- Customer feedback: [Issue resolution processes]

## Team Responsibilities
### Product Team
- Feature development and bug fixes
- User experience optimization
- Technical documentation

### Marketing Team
- Campaign execution and optimization
- Content creation and distribution
- Lead generation and nurturing

### Sales Team
- Lead qualification and conversion
- Customer onboarding
- Expansion revenue opportunities

### Customer Success Team
- User onboarding and training
- Customer support and retention
- Feedback collection and analysis`,
    topicCategory: "Web/App",
    category: "Product Launch"
  }
];

// Strategies data with structured information
const strategies: Strategy[] = [
  // Text Strategies
  {
    name: "Content-First Growth Strategy",
    whatItIs: "Systematic approach to building business growth through valuable content creation",
    whatItsFor: "Companies looking to establish thought leadership and drive organic growth",
    desiredOutcome: "Sustainable growth through content that attracts, engages, and converts ideal customers",
    approach: "Create valuable, educational content that addresses customer pain points, optimized for search and social sharing, with clear conversion paths to turn readers into leads and customers",
    topicCategory: "Text",
    category: "Growth Marketing"
  },
  {
    name: "SEO-Driven Organic Growth",
    whatItIs: "Long-term strategy for building organic search traffic and brand visibility",
    whatItsFor: "Businesses wanting to reduce paid advertising dependency and build sustainable traffic",
    desiredOutcome: "Dominant search rankings for key terms driving qualified traffic and conversions",
    approach: "Comprehensive keyword research, technical SEO optimization, content cluster creation, and authority building through high-quality backlinks and thought leadership content",
    topicCategory: "Text",
    category: "Search Marketing"
  },

  // Image Strategies
  {
    name: "Visual Storytelling Strategy",
    whatItIs: "Brand building approach through compelling visual narratives and consistent imagery",
    whatItsFor: "Brands looking to create emotional connections and memorable experiences",
    desiredOutcome: "Strong brand recognition and emotional engagement leading to customer loyalty",
    approach: "Develop cohesive visual identity, create story-driven imagery that resonates with target audience, and maintain consistency across all touchpoints to build brand recognition and trust",
    topicCategory: "Image",
    category: "Brand Strategy"
  },
  {
    name: "Social Visual Engagement",
    whatItIs: "Strategy for maximizing social media engagement through optimized visual content",
    whatItsFor: "Businesses looking to build social media presence and community engagement",
    desiredOutcome: "Increased social media following, engagement rates, and social-driven conversions",
    approach: "Create platform-specific visual content, use trending formats and aesthetics, engage with community through visual storytelling, and optimize posting times and frequency for maximum reach",
    topicCategory: "Image",
    category: "Social Media Strategy"
  },

  // Video Strategies
  {
    name: "Video-First Marketing Approach",
    whatItIs: "Comprehensive strategy prioritizing video content across all marketing channels",
    whatItsFor: "Brands wanting to maximize engagement and conversion through video content",
    desiredOutcome: "Higher engagement rates, improved conversion metrics, and stronger brand connection",
    approach: "Develop video content for each stage of customer journey, optimize for platform-specific requirements, create series and campaigns that build audience, and track performance metrics to optimize strategy",
    topicCategory: "Video",
    category: "Content Marketing"
  },
  {
    name: "Educational Video Series Strategy",
    whatItIs: "Long-form strategy using educational video content to build authority and trust",
    whatItsFor: "B2B companies and service providers looking to demonstrate expertise",
    desiredOutcome: "Established thought leadership, improved sales cycle, and higher-quality leads",
    approach: "Create comprehensive educational content addressing customer challenges, structure as ongoing series to build viewership, integrate with sales process, and measure impact on lead quality and conversion",
    topicCategory: "Video",
    category: "Thought Leadership"
  },

  // Audio Strategies
  {
    name: "Podcast Authority Building",
    whatItIs: "Long-term strategy using podcast content to establish industry leadership",
    whatItsFor: "Executives and companies looking to build thought leadership and network",
    desiredOutcome: "Recognized industry authority, expanded professional network, and business opportunities",
    approach: "Develop podcast focusing on industry insights, interview key industry figures, share valuable perspectives regularly, and leverage content across multiple channels to amplify reach and impact",
    topicCategory: "Audio",
    category: "Thought Leadership"
  },
  {
    name: "Audio Content Repurposing",
    whatItIs: "Strategy for maximizing value from audio content across multiple formats and channels",
    whatItsFor: "Content creators looking to efficiently scale their content production",
    desiredOutcome: "Increased content output and reach without proportional increase in production effort",
    approach: "Create primary audio content, then systematically repurpose into blog posts, social media content, email newsletters, and video content to maximize reach and engagement across all channels",
    topicCategory: "Audio",
    category: "Content Strategy"
  },

  // Web/App Strategies
  {
    name: "Product-Led Growth Strategy",
    whatItIs: "Growth strategy where the product itself drives user acquisition, expansion, and retention",
    whatItsFor: "SaaS companies and digital products looking to scale efficiently",
    desiredOutcome: "Sustainable growth with lower customer acquisition costs and higher lifetime value",
    approach: "Optimize product for viral sharing, create self-service onboarding, implement usage-based expansion opportunities, and use in-product messaging to drive upgrades and referrals",
    topicCategory: "Web/App",
    category: "Growth Strategy"
  },
  {
    name: "User Experience Optimization",
    whatItIs: "Systematic approach to improving user experience for increased conversions and retention",
    whatItsFor: "Digital products looking to improve user satisfaction and business metrics",
    desiredOutcome: "Higher user engagement, improved conversion rates, and reduced churn",
    approach: "Conduct user research, identify friction points in user journey, implement A/B testing framework, make data-driven improvements, and continuously monitor and optimize based on user behavior and feedback",
    topicCategory: "Web/App",
    category: "User Experience"
  }
];

// Helper function to get topic icon
const getTopicIcon = (topic: TopicCategory) => {
  switch (topic) {
    case 'Text': return Type;
    case 'Image': return Image;
    case 'Video': return Video;
    case 'Audio': return Headphones;
    case 'Web/App': return Globe;
    default: return Type;
  }
};

// Helper function to filter items by topic category
const filterByTopicCategory = <T extends { topicCategory: TopicCategory }>(items: T[], category: TopicCategory) => {
  return items.filter(item => item.topicCategory === category);
};

export default function Resources() {
  const { isAuthenticated, subscription } = useAuth();
  const [activeTab, setActiveTab] = useState("tools");
  const [activeTopicTab, setActiveTopicTab] = useState<TopicCategory>("Text");
  
  // Modal states
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);

  // Show all content if user has Pro subscription
  const showAllContent = subscription?.subscribed && subscription.subscription_tier === 'JumpinAI Pro';

  const UpgradeSection = ({ message }: { message: string }) => (
    <div className="bg-muted/50 border border-border rounded-lg p-8 text-center mt-8">
      <Lock className="h-8 w-8 text-muted-foreground mb-3 mx-auto" />
      <p className="text-lg font-medium mb-2">{message}</p>
      <p className="text-muted-foreground mb-4">Upgrade to Pro to unlock all premium resources</p>
      <Button 
        onClick={() => {
          if (!isAuthenticated) {
            window.location.href = '/auth?next=' + encodeURIComponent(window.location.pathname);
          } else {
            window.location.href = '/pricing';
          }
        }}
        className="text-sm"
      >
        {!isAuthenticated ? 'Login to Subscribe' : 'Upgrade to Pro'} - $10/month
      </Button>
    </div>
  );

  // Component for rendering resource cards with new structure
  const ResourceCard = ({ item, type, isBlurred = false }: { 
    item: Tool | PromptTemplate | Workflow | Blueprint | Strategy; 
    type: string;
    isBlurred?: boolean;
  }) => {
    const handleCardClick = () => {
      if (isBlurred) return;
      
      if (type === 'workflow' && 'steps' in item) {
        setSelectedWorkflow(item as Workflow);
        setIsWorkflowModalOpen(true);
      } else if (type === 'blueprint' && 'template' in item) {
        setSelectedBlueprint(item as Blueprint);
        setIsBlueprintModalOpen(true);
      } else if (type === 'strategy' && 'approach' in item) {
        setSelectedStrategy(item as Strategy);
        setIsStrategyModalOpen(true);
      } else if (type === 'tool' && 'url' in item) {
        window.open((item as Tool).url, '_blank');
      }
    };

    return (
      <Card 
        className={`h-full cursor-pointer hover:shadow-lg transition-all ${isBlurred ? 'filter blur-[2px] pointer-events-none' : ''}`}
        onClick={handleCardClick}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{item.name}</CardTitle>
            <Badge variant="secondary">{item.category}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm text-primary mb-1">What it is:</h4>
            <p className="text-sm text-muted-foreground">{item.whatItIs}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm text-primary mb-1">What it's for:</h4>
            <p className="text-sm text-muted-foreground">{item.whatItsFor}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm text-primary mb-1">Desired outcome:</h4>
            <p className="text-sm text-muted-foreground">{item.desiredOutcome}</p>
          </div>

          {type === 'tool' && 'url' in item && (
            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" size="sm" onClick={(e) => {
                e.stopPropagation();
                window.open((item as Tool).url, '_blank');
              }}>
                <ExternalLink className="h-3 w-3 mr-1" />
                Visit
              </Button>
            </div>
          )}

          {type === 'prompt' && 'prompt' in item && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Template Preview:</h4>
              <p className="text-xs bg-muted p-2 rounded italic line-clamp-2">
                {(item as PromptTemplate).prompt}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Helmet>
        <title>AI Resources - Tools, Prompts, Workflows & Strategies | JumpinAI</title>
        <meta name="description" content="Comprehensive collection of AI tools, prompt templates, workflows, blueprints, and strategies organized by topic: Text, Image, Video, Audio, and Web/App development." />
        <link rel="canonical" href={`${window.location.origin}/resources`} />
      </Helmet>
      
      <Navigation />
      
      <main className="min-h-screen bg-background pt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">AI Resources Hub</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive collection of AI tools, templates, and strategies organized by topic to accelerate your projects
            </p>
          </div>

          {/* Two-row tab system */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* First row: Resource type tabs */}
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="tools" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Tools
              </TabsTrigger>
              <TabsTrigger value="prompts" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Prompts
              </TabsTrigger>
              <TabsTrigger value="workflows" className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Workflows
              </TabsTrigger>
              <TabsTrigger value="blueprints" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Blueprints
              </TabsTrigger>
              <TabsTrigger value="strategies" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Strategies
              </TabsTrigger>
            </TabsList>

            {/* Second row: Topic category tabs */}
            <div className="mb-8">
              <Tabs value={activeTopicTab} onValueChange={setActiveTopicTab as (value: string) => void}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="Text" className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="Image" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Image
                  </TabsTrigger>
                  <TabsTrigger value="Video" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video
                  </TabsTrigger>
                  <TabsTrigger value="Audio" className="flex items-center gap-2">
                    <Headphones className="h-4 w-4" />
                    Audio
                  </TabsTrigger>
                  <TabsTrigger value="Web/App" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Web/App
                  </TabsTrigger>
                </TabsList>

                {/* Content for each resource type */}
                <TabsContent value="tools" className="mt-8">
                  {(['Text', 'Image', 'Video', 'Audio', 'Web/App'] as TopicCategory[]).map(topic => (
                    <TabsContent key={topic} value={topic}>
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          {(() => {
                            const IconComponent = getTopicIcon(topic);
                            return <IconComponent className="h-6 w-6 text-primary" />;
                          })()}
                          <h2 className="text-2xl font-semibold">{topic} Tools</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filterByTopicCategory(tools, topic).map((tool, index) => (
                            <ResourceCard 
                              key={index} 
                              item={tool} 
                              type="tool"
                            />
                          ))}
                        </div>
                        
                        {filterByTopicCategory(tools, topic).length === 0 && (
                          <div className="text-center py-12">
                            <p className="text-muted-foreground">No {topic.toLowerCase()} tools available yet. Check back soon!</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </TabsContent>

                <TabsContent value="prompts" className="mt-8">
                  {(['Text', 'Image', 'Video', 'Audio', 'Web/App'] as TopicCategory[]).map(topic => (
                    <TabsContent key={topic} value={topic}>
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          {(() => {
                            const IconComponent = getTopicIcon(topic);
                            return <IconComponent className="h-6 w-6 text-primary" />;
                          })()}
                          <h2 className="text-2xl font-semibold">{topic} Prompts</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filterByTopicCategory(promptTemplates, topic).slice(0, showAllContent ? undefined : 6).map((prompt, index) => (
                            <ResourceCard 
                              key={index} 
                              item={prompt} 
                              type="prompt"
                              isBlurred={!showAllContent && index >= 4}
                            />
                          ))}
                        </div>
                        
                        {filterByTopicCategory(promptTemplates, topic).length === 0 && (
                          <div className="text-center py-12">
                            <p className="text-muted-foreground">No {topic.toLowerCase()} prompts available yet. Check back soon!</p>
                          </div>
                        )}
                        
                        {!showAllContent && filterByTopicCategory(promptTemplates, topic).length > 4 && (
                          <UpgradeSection message={`Unlock all ${topic} prompts`} />
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </TabsContent>

                <TabsContent value="workflows" className="mt-8">
                  {(['Text', 'Image', 'Video', 'Audio', 'Web/App'] as TopicCategory[]).map(topic => (
                    <TabsContent key={topic} value={topic}>
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          {(() => {
                            const IconComponent = getTopicIcon(topic);
                            return <IconComponent className="h-6 w-6 text-primary" />;
                          })()}
                          <h2 className="text-2xl font-semibold">{topic} Workflows</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filterByTopicCategory(workflows, topic).slice(0, showAllContent ? undefined : 4).map((workflow, index) => (
                            <ResourceCard 
                              key={index} 
                              item={workflow} 
                              type="workflow"
                              isBlurred={!showAllContent && index >= 2}
                            />
                          ))}
                        </div>
                        
                        {filterByTopicCategory(workflows, topic).length === 0 && (
                          <div className="text-center py-12">
                            <p className="text-muted-foreground">No {topic.toLowerCase()} workflows available yet. Check back soon!</p>
                          </div>
                        )}
                        
                        {!showAllContent && filterByTopicCategory(workflows, topic).length > 2 && (
                          <UpgradeSection message={`Unlock all ${topic} workflows`} />
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </TabsContent>

                <TabsContent value="blueprints" className="mt-8">
                  {(['Text', 'Image', 'Video', 'Audio', 'Web/App'] as TopicCategory[]).map(topic => (
                    <TabsContent key={topic} value={topic}>
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          {(() => {
                            const IconComponent = getTopicIcon(topic);
                            return <IconComponent className="h-6 w-6 text-primary" />;
                          })()}
                          <h2 className="text-2xl font-semibold">{topic} Blueprints</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filterByTopicCategory(blueprints, topic).slice(0, showAllContent ? undefined : 4).map((blueprint, index) => (
                            <ResourceCard 
                              key={index} 
                              item={blueprint} 
                              type="blueprint"
                              isBlurred={!showAllContent && index >= 2}
                            />
                          ))}
                        </div>
                        
                        {filterByTopicCategory(blueprints, topic).length === 0 && (
                          <div className="text-center py-12">
                            <p className="text-muted-foreground">No {topic.toLowerCase()} blueprints available yet. Check back soon!</p>
                          </div>
                        )}
                        
                        {!showAllContent && filterByTopicCategory(blueprints, topic).length > 2 && (
                          <UpgradeSection message={`Unlock all ${topic} blueprints`} />
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </TabsContent>

                <TabsContent value="strategies" className="mt-8">
                  {(['Text', 'Image', 'Video', 'Audio', 'Web/App'] as TopicCategory[]).map(topic => (
                    <TabsContent key={topic} value={topic}>
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          {(() => {
                            const IconComponent = getTopicIcon(topic);
                            return <IconComponent className="h-6 w-6 text-primary" />;
                          })()}
                          <h2 className="text-2xl font-semibold">{topic} Strategies</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filterByTopicCategory(strategies, topic).slice(0, showAllContent ? undefined : 4).map((strategy, index) => (
                            <ResourceCard 
                              key={index} 
                              item={strategy} 
                              type="strategy"
                              isBlurred={!showAllContent && index >= 2}
                            />
                          ))}
                        </div>
                        
                        {filterByTopicCategory(strategies, topic).length === 0 && (
                          <div className="text-center py-12">
                            <p className="text-muted-foreground">No {topic.toLowerCase()} strategies available yet. Check back soon!</p>
                          </div>
                        )}
                        
                        {!showAllContent && filterByTopicCategory(strategies, topic).length > 2 && (
                          <UpgradeSection message={`Unlock all ${topic} strategies`} />
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Modals */}
      <WorkflowDetailModal
        workflow={selectedWorkflow}
        isOpen={isWorkflowModalOpen}
        onClose={() => {
          setIsWorkflowModalOpen(false);
          setSelectedWorkflow(null);
        }}
      />

      <BlueprintDetailModal
        blueprint={selectedBlueprint}
        isOpen={isBlueprintModalOpen}
        onClose={() => {
          setIsBlueprintModalOpen(false);
          setSelectedBlueprint(null);
        }}
      />

      <StrategyDetailModal
        strategy={selectedStrategy}
        isOpen={isStrategyModalOpen}
        onClose={() => {
          setIsStrategyModalOpen(false);
          setSelectedStrategy(null);
        }}
      />
    </>
  );
}