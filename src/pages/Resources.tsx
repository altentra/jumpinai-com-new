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
  Star,
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
import ResourceBlueprintModal from "@/components/ResourceBlueprintModal";

// Updated data models with structured information
type Tool = {
  name: string;
  url: string;
  whatItIs: string;
  whatItsFor: string;
  desiredOutcome: string;
  topicCategory: 'Text' | 'Image' | 'Video' | 'Audio' | 'Web/App Dev' | 'Workflow/AI Agents';
  category: string;
};

type PromptTemplate = {
  name: string;
  whatItIs: string;
  whatItsFor: string;
  desiredOutcome: string;
  prompt: string;
  topicCategory: 'Text' | 'Image' | 'Video' | 'Audio' | 'Web/App Dev' | 'Workflow/AI Agents';
  category: string;
};

type Workflow = {
  name: string;
  whatItIs: string;
  whatItsFor: string;
  desiredOutcome: string;
  steps: string[];
  topicCategory: 'Text' | 'Image' | 'Video' | 'Audio' | 'Web/App Dev' | 'Workflow/AI Agents';
  category: string;
  description?: string;
};

type Blueprint = {
  name: string;
  whatItIs: string;
  whatItsFor: string;
  desiredOutcome: string;
  template: string;
  topicCategory: 'Text' | 'Image' | 'Video' | 'Audio' | 'Web/App Dev' | 'Workflow/AI Agents';
  category: string;
};

type Strategy = {
  name: string;
  whatItIs: string;
  whatItsFor: string;
  desiredOutcome: string;
  approach: string;
  topicCategory: 'Text' | 'Image' | 'Video' | 'Audio' | 'Web/App Dev' | 'Workflow/AI Agents';
  category: string;
};

type TopicCategory = 'Text' | 'Image' | 'Video' | 'Audio' | 'Web/App Dev' | 'Workflow/AI Agents';

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
  { 
    name: "Jasper", 
    url: "https://www.jasper.ai/", 
    whatItIs: "AI-powered content creation platform for marketing teams",
    whatItsFor: "Creating blog posts, social media content, and marketing copy at scale",
    desiredOutcome: "High-converting marketing content optimized for brand voice and SEO",
    topicCategory: "Text",
    category: "Content Creation"
  },
  { 
    name: "Copy.ai", 
    url: "https://www.copy.ai/", 
    whatItIs: "AI writing assistant focused on marketing and sales copy",
    whatItsFor: "Generating persuasive copy for ads, emails, and landing pages",
    desiredOutcome: "Compelling copy that drives conversions and engagement",
    topicCategory: "Text",
    category: "Copywriting"
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
  { 
    name: "Fotor", 
    url: "https://www.fotor.com/", 
    whatItIs: "Online photo editor and design platform with AI features",
    whatItsFor: "Editing photos and creating graphic designs with AI assistance",
    desiredOutcome: "Professional-quality images and designs without complex software",
    topicCategory: "Image",
    category: "Photo Editing"
  },
  { 
    name: "PicsArt", 
    url: "https://picsart.com/", 
    whatItIs: "Creative platform with AI-powered photo and video editing tools",
    whatItsFor: "Creating social media content, photo edits, and creative designs",
    desiredOutcome: "Engaging visual content optimized for social media platforms",
    topicCategory: "Image",
    category: "Creative Design"
  },
  { 
    name: "Canva", 
    url: "https://www.canva.com/", 
    whatItIs: "Design platform with AI-powered templates and editing tools",
    whatItsFor: "Creating presentations, social media graphics, and marketing materials",
    desiredOutcome: "Professional designs that maintain brand consistency across channels",
    topicCategory: "Image",
    category: "Graphic Design"
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
  { 
    name: "Descript", 
    url: "https://www.descript.com/", 
    whatItIs: "All-in-one video and podcast editing platform with AI transcription",
    whatItsFor: "Editing videos and podcasts through text-based editing interface",
    desiredOutcome: "Streamlined video editing with automated transcription and voice cloning",
    topicCategory: "Video",
    category: "Video Editing"
  },
  { 
    name: "InVideo", 
    url: "https://invideo.io/", 
    whatItIs: "Online video creation platform with AI-powered templates",
    whatItsFor: "Creating marketing videos, social media content, and presentations",
    desiredOutcome: "Professional videos created quickly using templates and automation",
    topicCategory: "Video",
    category: "Video Creation"
  },
  { 
    name: "Pictory", 
    url: "https://pictory.ai/", 
    whatItIs: "AI video creation platform that turns text and articles into videos",
    whatItsFor: "Converting blog posts, scripts, and articles into engaging video content",
    desiredOutcome: "Automated video creation from existing written content",
    topicCategory: "Video",
    category: "Video Generation"
  },
  { 
    name: "HeyGen", 
    url: "https://www.heygen.com/", 
    whatItIs: "AI avatar video generation platform with multilingual support",
    whatItsFor: "Creating personalized video messages and presentations with AI avatars",
    desiredOutcome: "Scalable video content with realistic AI presenters in multiple languages",
    topicCategory: "Video",
    category: "AI Avatars"
  },
  { 
    name: "Kapwing", 
    url: "https://www.kapwing.com/", 
    whatItIs: "Collaborative online video editor with AI-powered features",
    whatItsFor: "Creating and editing videos for social media, marketing, and education",
    desiredOutcome: "Professional video content with team collaboration and AI enhancements",
    topicCategory: "Video",
    category: "Video Editing"
  },
  { 
    name: "Pika", 
    url: "https://pika.art/", 
    whatItIs: "AI-powered video generation platform creating videos from text prompts",
    whatItsFor: "Generating short video clips and animations from text descriptions",
    desiredOutcome: "Creative video content generated entirely through AI from text prompts",
    topicCategory: "Video",
    category: "AI Video Generation"
  },
  { 
    name: "Kling AI", 
    url: "https://klingai.com/", 
    whatItIs: "Advanced AI video generation model for creating realistic video content",
    whatItsFor: "Producing high-quality video content from text and image inputs",
    desiredOutcome: "Professional-grade AI-generated videos with realistic motion and details",
    topicCategory: "Video",
    category: "AI Video Generation"
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
  { 
    name: "Murf AI", 
    url: "https://murf.ai/", 
    whatItIs: "AI voice generator with realistic human-like voices",
    whatItsFor: "Creating professional voiceovers for videos, presentations, and podcasts",
    desiredOutcome: "Natural-sounding voiceovers that enhance content engagement and accessibility",
    topicCategory: "Audio",
    category: "Voice Generation"
  },
  { 
    name: "Play.ht", 
    url: "https://play.ht/", 
    whatItIs: "AI voice generation platform with ultra-realistic speech synthesis",
    whatItsFor: "Generating high-quality voiceovers and speech for various media formats",
    desiredOutcome: "Indistinguishable AI voices for professional audio content creation",
    topicCategory: "Audio",
    category: "Voice Synthesis"
  },
  { 
    name: "LOVO", 
    url: "https://lovo.ai/", 
    whatItIs: "AI voice generator and text-to-speech platform with emotion control",
    whatItsFor: "Creating expressive voiceovers with emotional nuance and character voices",
    desiredOutcome: "Emotionally rich audio content that connects with audiences",
    topicCategory: "Audio",
    category: "Voice Generation"
  },
  { 
    name: "Suno", 
    url: "https://suno.ai/", 
    whatItIs: "AI music creation platform that generates songs from text prompts",
    whatItsFor: "Creating original music tracks, jingles, and background music",
    desiredOutcome: "Custom music compositions tailored to specific moods and requirements",
    topicCategory: "Audio",
    category: "Music Generation"
  },

  // Web/App Dev Tools
  { 
    name: "Lovable", 
    url: "https://lovable.dev/", 
    whatItIs: "AI-powered web application development platform",
    whatItsFor: "Building full-stack web applications with AI assistance",
    desiredOutcome: "Rapid development of modern web apps with intelligent code generation",
    topicCategory: "Web/App Dev",
    category: "AI Development"
  },
  { 
    name: "Bolt.new", 
    url: "https://bolt.new/", 
    whatItIs: "AI-powered full-stack web development environment",
    whatItsFor: "Creating complete web applications from prompts",
    desiredOutcome: "Instant web app prototyping and development through AI",
    topicCategory: "Web/App Dev",
    category: "AI Development"
  },
  { 
    name: "Replit", 
    url: "https://replit.com/", 
    whatItIs: "Cloud-based development environment with AI coding assistant",
    whatItsFor: "Collaborative coding and rapid prototyping with AI help",
    desiredOutcome: "Streamlined development workflow with AI-powered coding assistance",
    topicCategory: "Web/App Dev",
    category: "Development Platform"
  },
  { 
    name: "Cursor", 
    url: "https://cursor.sh/", 
    whatItIs: "AI-first code editor built for pair programming with AI",
    whatItsFor: "Writing code with intelligent AI assistance and autocompletion",
    desiredOutcome: "Faster, more accurate coding with AI-powered suggestions and edits",
    topicCategory: "Web/App Dev",
    category: "Code Editor"
  },
  { 
    name: "GitHub Copilot", 
    url: "https://github.com/features/copilot", 
    whatItIs: "AI-powered code completion and generation tool",
    whatItsFor: "Accelerating coding with intelligent code suggestions",
    desiredOutcome: "Increased development productivity with AI-generated code snippets",
    topicCategory: "Web/App Dev",
    category: "AI Assistant"
  },
  { 
    name: "Claude Code", 
    url: "https://claude.ai/", 
    whatItIs: "Anthropic's AI assistant specialized for coding tasks",
    whatItsFor: "Code review, debugging, and complex programming problems",
    desiredOutcome: "High-quality code solutions with detailed explanations",
    topicCategory: "Web/App Dev",
    category: "AI Assistant"
  },

  // Workflow/AI Agents Tools
  { 
    name: "n8n", 
    url: "https://n8n.io/", 
    whatItIs: "Open-source workflow automation platform",
    whatItsFor: "Building automated workflows connecting apps and AI services",
    desiredOutcome: "Streamlined business processes with AI-powered automation",
    topicCategory: "Workflow/AI Agents",
    category: "Workflow Automation"
  },
  { 
    name: "Zapier", 
    url: "https://zapier.com/", 
    whatItIs: "No-code automation platform connecting thousands of apps",
    whatItsFor: "Automating repetitive tasks between different web applications",
    desiredOutcome: "Increased productivity through seamless app integrations",
    topicCategory: "Workflow/AI Agents",
    category: "Automation"
  },
  { 
    name: "Make.com", 
    url: "https://www.make.com/", 
    whatItIs: "Visual automation platform for connecting apps and services",
    whatItsFor: "Creating complex automated workflows with visual interface",
    desiredOutcome: "Advanced automation scenarios with conditional logic and data transformation",
    topicCategory: "Workflow/AI Agents",
    category: "Automation"
  },
  { 
    name: "ManyChat", 
    url: "https://manychat.com/", 
    whatItIs: "Chatbot platform for Facebook Messenger, Instagram, and SMS",
    whatItsFor: "Building conversational AI agents for customer engagement",
    desiredOutcome: "Automated customer interactions that drive sales and support",
    topicCategory: "Workflow/AI Agents",
    category: "Chatbots"
  },
  { 
    name: "Notion", 
    url: "https://www.notion.so/", 
    whatItIs: "All-in-one workspace with AI-powered features",
    whatItsFor: "Managing projects, documentation, and workflows with AI assistance",
    desiredOutcome: "Organized, collaborative workspace that enhances team productivity",
    topicCategory: "Workflow/AI Agents",
    category: "Productivity"
  },
  { 
    name: "Motion", 
    url: "https://www.usemotion.com/", 
    whatItIs: "AI-powered calendar and task management platform",
    whatItsFor: "Optimizing schedules and automating task prioritization",
    desiredOutcome: "Perfectly organized calendar with AI-optimized time allocation",
    topicCategory: "Workflow/AI Agents",
    category: "Time Management"
  },
  { 
    name: "ClickUp", 
    url: "https://clickup.com/", 
    whatItIs: "Project management platform with AI-powered features",
    whatItsFor: "Managing complex projects with AI-assisted planning and tracking",
    desiredOutcome: "Streamlined project delivery with intelligent task management",
    topicCategory: "Workflow/AI Agents",
    category: "Project Management"
  },
  { 
    name: "Monday.com", 
    url: "https://monday.com/", 
    whatItIs: "Work management platform with automation and AI features",
    whatItsFor: "Coordinating team workflows and automating project processes",
    desiredOutcome: "Enhanced team collaboration with automated project tracking",
    topicCategory: "Workflow/AI Agents",
    category: "Work Management"
  },
  { 
    name: "SEMrush", 
    url: "https://www.semrush.com/", 
    whatItIs: "Digital marketing toolkit with AI-powered insights",
    whatItsFor: "SEO, content marketing, and competitive analysis with AI assistance",
    desiredOutcome: "Data-driven marketing strategies with AI-powered recommendations",
    topicCategory: "Workflow/AI Agents",
    category: "Marketing Analytics"
  },
  { 
    name: "Tidio", 
    url: "https://www.tidio.com/", 
    whatItIs: "Live chat and chatbot platform with AI capabilities",
    whatItsFor: "Providing automated customer support and lead generation",
    desiredOutcome: "Improved customer satisfaction with AI-powered chat support",
    topicCategory: "Workflow/AI Agents",
    category: "Customer Support"
  }
];

// Prompts data with structured information
const promptTemplates: PromptTemplate[] = [
  // Text Prompts
  {
    name: "Content Marketing Strategy",
    whatItIs: "Comprehensive content planning framework for marketing campaigns",
    whatItsFor: "Creating data-driven content strategies that align with business goals",
    desiredOutcome: "Strategic content roadmap with clear objectives, audience targeting, and measurable outcomes",
    prompt: "Act as a content marketing strategist. Create a 3-month content strategy for [BUSINESS TYPE] targeting [AUDIENCE]. Include: 1) Content pillars and themes, 2) Platform-specific content calendar, 3) SEO keyword integration, 4) Engagement tactics, 5) Performance metrics and KPIs. Format as actionable roadmap with timelines.",
    topicCategory: "Text",
    category: "Marketing Strategy"
  },
  {
    name: "Email Campaign Copywriter",
    whatItIs: "High-converting email sequence creation framework",
    whatItsFor: "Writing persuasive email campaigns that drive opens, clicks, and conversions",
    desiredOutcome: "Engaging email sequences with compelling subject lines and strong calls-to-action",
    prompt: "You are an expert email copywriter. Write a 5-email welcome sequence for [PRODUCT/SERVICE]. Each email should: 1) Have a compelling subject line, 2) Hook readers in first sentence, 3) Provide value and build trust, 4) Include clear CTA, 5) Maintain consistent brand voice. Include open/click optimization tips.",
    topicCategory: "Text",
    category: "Email Marketing"
  },
  {
    name: "SEO Blog Post Writer",
    whatItIs: "Search-optimized content creation framework",
    whatItsFor: "Creating blog posts that rank well and provide value to readers",
    desiredOutcome: "High-quality, SEO-optimized articles that drive organic traffic and engagement",
    prompt: "Act as an SEO content specialist. Write a 1500-word blog post about [TOPIC] targeting keyword '[KEYWORD]'. Include: 1) Compelling title with keyword, 2) Meta description (150 chars), 3) H2/H3 structure with related keywords, 4) Internal linking opportunities, 5) Expert insights and data, 6) Strong conclusion with CTA.",
    topicCategory: "Text",
    category: "SEO Content"
  },
  {
    name: "Social Media Caption Creator",
    whatItIs: "Platform-specific social media content framework",
    whatItsFor: "Creating engaging social media posts that drive interaction and brand awareness",
    desiredOutcome: "Compelling social content optimized for each platform's unique audience and format",
    prompt: "Create social media captions for [PLATFORM] about [TOPIC/PRODUCT]. Include: 1) Attention-grabbing hook, 2) Value-driven content, 3) Platform-appropriate hashtags, 4) Clear call-to-action, 5) Brand voice consistency. Provide 3 variations with different angles and optimize for platform algorithms.",
    topicCategory: "Text",
    category: "Social Media"
  },
  {
    name: "Product Description Writer",
    whatItIs: "Conversion-focused product copy framework",
    whatItsFor: "Writing compelling product descriptions that highlight benefits and drive sales",
    desiredOutcome: "Persuasive product copy that addresses customer pain points and motivates purchases",
    prompt: "You are a conversion copywriter. Write product descriptions for [PRODUCT] targeting [CUSTOMER TYPE]. Include: 1) Benefit-focused headline, 2) Key features with emotional benefits, 3) Social proof elements, 4) Urgency/scarcity if applicable, 5) Strong purchase CTA. Address common objections and use persuasive language.",
    topicCategory: "Text",
    category: "E-commerce"
  },
  {
    name: "Press Release Template",
    whatItIs: "Professional PR announcement framework",
    whatItsFor: "Creating newsworthy press releases that capture media attention",
    desiredOutcome: "Professional PR content that generates media coverage and brand awareness",
    prompt: "Write a press release for [ANNOUNCEMENT/EVENT]. Follow AP style and include: 1) Compelling headline and subheadline, 2) Strong lead paragraph with 5 W's, 3) Executive quotes, 4) Company background, 5) Media contact information. Make it newsworthy and include relevant industry data.",
    topicCategory: "Text",
    category: "Public Relations"
  },

  // Image Prompts
  {
    name: "Brand Visual Identity",
    whatItIs: "Comprehensive visual branding framework",
    whatItsFor: "Creating cohesive visual identity systems for brands and businesses",
    desiredOutcome: "Professional brand visuals that communicate values and attract target customers",
    prompt: "Design a visual identity for [BRAND/COMPANY] in [INDUSTRY]. Create mood board including: 1) Logo concepts and variations, 2) Color palette with hex codes, 3) Typography pairings, 4) Visual style and imagery direction, 5) Brand applications (business cards, social media, etc.). Ensure consistency across all touchpoints.",
    topicCategory: "Image",
    category: "Brand Design"
  },
  {
    name: "Social Media Graphics",
    whatItIs: "Platform-optimized visual content creation framework",
    whatItsFor: "Creating engaging graphics for various social media platforms",
    desiredOutcome: "Eye-catching visuals that drive engagement and maintain brand consistency",
    prompt: "Create social media graphics for [PLATFORM] promoting [CONTENT/OFFER]. Include: 1) Platform-specific dimensions, 2) Brand colors and fonts, 3) Clear hierarchy and readable text, 4) Strong visual focal point, 5) Call-to-action if needed. Design for mobile viewing and platform best practices.",
    topicCategory: "Image",
    category: "Social Media"
  },
  {
    name: "Website Hero Section",
    whatItIs: "High-impact website header design framework",
    whatItsFor: "Creating compelling above-the-fold website sections that convert visitors",
    desiredOutcome: "Engaging hero sections that communicate value proposition and drive user action",
    prompt: "Design a website hero section for [BUSINESS/PRODUCT]. Include: 1) Compelling headline and subheadline, 2) Hero image or illustration, 3) Primary CTA button, 4) Trust signals or social proof, 5) Mobile-responsive layout. Focus on clear value proposition and conversion optimization.",
    topicCategory: "Image",
    category: "Web Design"
  },
  {
    name: "Infographic Designer",
    whatItIs: "Data visualization and information design framework",
    whatItsFor: "Creating informative and shareable infographic content",
    desiredOutcome: "Clear, visually appealing infographics that simplify complex information",
    prompt: "Create an infographic about [TOPIC/DATA]. Include: 1) Compelling title and introduction, 2) Clear data visualization with charts/graphs, 3) Logical flow and sections, 4) Consistent color scheme and branding, 5) Sources and credits. Make it shareable and easy to understand at a glance.",
    topicCategory: "Image",
    category: "Data Visualization"
  },
  {
    name: "Product Photography Direction",
    whatItIs: "Professional product visual planning framework",
    whatItsFor: "Creating compelling product imagery for marketing and e-commerce",
    desiredOutcome: "High-quality product photos that showcase features and drive conversions",
    prompt: "Plan product photography for [PRODUCT]. Include: 1) Shot list with multiple angles, 2) Lighting setup and mood, 3) Props and styling requirements, 4) Background and environment, 5) Post-processing guidelines. Focus on highlighting key features and creating lifestyle context.",
    topicCategory: "Image",
    category: "Product Photography"
  },
  {
    name: "Marketing Materials Design",
    whatItIs: "Print and digital marketing collateral framework",
    whatItsFor: "Creating professional marketing materials for various business needs",
    desiredOutcome: "Cohesive marketing collateral that reinforces brand identity and drives action",
    prompt: "Design marketing materials for [CAMPAIGN/EVENT]. Create: 1) Flyer/brochure layout, 2) Business card design, 3) Email header graphics, 4) Social media ad visuals, 5) Presentation template. Maintain brand consistency and include clear CTAs throughout.",
    topicCategory: "Image",
    category: "Marketing Design"
  },

  // Video Prompts
  {
    name: "Product Demo Video",
    whatItIs: "Compelling product demonstration framework",
    whatItsFor: "Creating effective product demo videos that showcase features and benefits",
    desiredOutcome: "Engaging demos that educate prospects and drive product adoption",
    prompt: "Create a product demo video script for [PRODUCT]. Structure: 1) Hook with problem statement (0-10s), 2) Product introduction and key features (10-45s), 3) Live demonstration with use cases (45-90s), 4) Benefits and results (90-105s), 5) Strong CTA (105-120s). Include visual cues and screen directions.",
    topicCategory: "Video",
    category: "Product Marketing"
  },
  {
    name: "Educational Tutorial Series",
    whatItIs: "Structured learning video content framework",
    whatItsFor: "Creating comprehensive tutorial videos that teach skills or concepts",
    desiredOutcome: "Clear, engaging educational content that helps viewers learn and apply knowledge",
    prompt: "Plan a tutorial video series for [SKILL/TOPIC]. Create: 1) Series overview and learning objectives, 2) Episode breakdown with progression, 3) Individual video scripts with step-by-step instructions, 4) Visual aids and demonstrations needed, 5) Practice exercises and resources. Make it beginner-friendly yet comprehensive.",
    topicCategory: "Video",
    category: "Education"
  },
  {
    name: "Brand Story Video",
    whatItIs: "Emotional brand narrative framework",
    whatItsFor: "Creating compelling brand story videos that connect with audiences",
    desiredOutcome: "Authentic brand videos that build emotional connection and trust",
    prompt: "Write a brand story video for [COMPANY]. Include: 1) Founder's journey and motivation, 2) Problem the company solves, 3) Mission and values demonstration, 4) Customer impact stories, 5) Future vision and call to join. Use storytelling techniques and emotional hooks throughout.",
    topicCategory: "Video",
    category: "Brand Marketing"
  },
  {
    name: "Social Media Video Content",
    whatItIs: "Platform-optimized short-form video framework",
    whatItsFor: "Creating engaging short videos for social media platforms",
    desiredOutcome: "Viral-ready content that drives engagement and brand awareness",
    prompt: "Create short-form video content for [PLATFORM] about [TOPIC]. Include: 1) Attention-grabbing first 3 seconds, 2) Clear value proposition, 3) Platform-specific format and timing, 4) Trending audio/music suggestions, 5) Engagement-driving elements. Optimize for mobile viewing and shareability.",
    topicCategory: "Video",
    category: "Social Media"
  },
  {
    name: "Customer Testimonial Video",
    whatItIs: "Social proof video content framework",
    whatItsFor: "Creating authentic customer success story videos",
    desiredOutcome: "Compelling testimonials that build trust and drive conversions",
    prompt: "Plan customer testimonial videos for [PRODUCT/SERVICE]. Include: 1) Customer selection criteria, 2) Interview question framework, 3) Story structure (challenge, solution, results), 4) B-roll footage requirements, 5) Call-to-action integration. Focus on specific results and emotional transformation.",
    topicCategory: "Video",
    category: "Social Proof"
  },
  {
    name: "Live Stream Planning",
    whatItIs: "Interactive live video content framework",
    whatItsFor: "Planning and executing engaging live streaming content",
    desiredOutcome: "Interactive live content that builds community and drives real-time engagement",
    prompt: "Plan a live stream for [TOPIC/PURPOSE]. Include: 1) Content outline with timing, 2) Audience engagement tactics, 3) Technical setup requirements, 4) Interactive elements (Q&A, polls, etc.), 5) Follow-up strategy. Create talking points and backup content for smooth delivery.",
    topicCategory: "Video",
    category: "Live Content"
  },

  // Audio Prompts
  {
    name: "Podcast Episode Planning",
    whatItIs: "Professional podcast content structure framework",
    whatItsFor: "Creating engaging, well-structured podcast episodes",
    desiredOutcome: "Compelling audio content that retains listeners and builds audience",
    prompt: "Plan a podcast episode about [TOPIC]. Include: 1) Episode title and description, 2) Detailed outline with segments, 3) Guest interview questions, 4) Transition scripts, 5) Key takeaways and CTA. Structure for 30-45 minute episode with clear value delivery throughout.",
    topicCategory: "Audio",
    category: "Podcasting"
  },
  {
    name: "Voiceover Script Writer",
    whatItIs: "Professional voiceover content framework",
    whatItsFor: "Creating effective voiceover scripts for various media",
    desiredOutcome: "Clear, engaging audio scripts optimized for voice delivery",
    prompt: "Write a voiceover script for [PROJECT TYPE]. Include: 1) Natural, conversational tone, 2) Clear pronunciation guides for complex terms, 3) Appropriate pacing and pauses, 4) Emotional cues and emphasis, 5) Call-to-action delivery. Optimize for [DURATION] and target [AUDIENCE].",
    topicCategory: "Audio",
    category: "Voice Content"
  },
  {
    name: "Audio Branding Strategy",
    whatItIs: "Comprehensive audio identity framework",
    whatItsFor: "Creating consistent audio branding across all touchpoints",
    desiredOutcome: "Cohesive audio identity that reinforces brand recognition",
    prompt: "Develop audio branding strategy for [BRAND]. Include: 1) Brand voice characteristics and tone, 2) Musical style and mood guidelines, 3) Sound effects library, 4) Voiceover talent specifications, 5) Application across platforms (ads, videos, podcasts). Ensure consistency with visual brand identity.",
    topicCategory: "Audio",
    category: "Brand Audio"
  },
  {
    name: "Audiobook Narration Guide",
    whatItIs: "Professional audiobook production framework",
    whatItsFor: "Creating engaging audiobook content and narration",
    desiredOutcome: "Professional audiobook that engages listeners and conveys content effectively",
    prompt: "Create audiobook narration guide for [BOOK/CONTENT]. Include: 1) Character voice distinctions, 2) Pacing and rhythm guidelines, 3) Chapter transition techniques, 4) Emphasis and emotional delivery, 5) Technical recording requirements. Focus on listener engagement and comprehension.",
    topicCategory: "Audio",
    category: "Audiobook Production"
  },
  {
    name: "Music for Content Creation",
    whatItIs: "Background music selection and creation framework",
    whatItsFor: "Choosing or creating appropriate music for various content types",
    desiredOutcome: "Perfect audio accompaniment that enhances content without distraction",
    prompt: "Select/create background music for [CONTENT TYPE]. Consider: 1) Mood and emotional tone needed, 2) Target audience preferences, 3) Content pacing and energy, 4) Licensing requirements, 5) Brand alignment. Provide specific genre, tempo, and instrumentation recommendations.",
    topicCategory: "Audio",
    category: "Music Creation"
  },
  {
    name: "Radio Ad Creative",
    whatItIs: "Compelling radio advertisement framework",
    whatItsFor: "Creating effective radio ads that drive action",
    desiredOutcome: "Memorable radio spots that generate leads and brand awareness",
    prompt: "Write a radio ad for [PRODUCT/SERVICE]. Create 30-second and 60-second versions including: 1) Attention-grabbing opening, 2) Clear value proposition, 3) Memorable tagline or jingle, 4) Strong call-to-action with contact info, 5) Local relevance if applicable. Optimize for audio-only medium.",
    topicCategory: "Audio",
    category: "Radio Advertising"
  },

  // Web/App Dev Prompts
  {
    name: "User Experience Audit",
    whatItIs: "Comprehensive UX evaluation framework",
    whatItsFor: "Identifying and fixing user experience issues in digital products",
    desiredOutcome: "Improved user satisfaction, conversion rates, and product usability",
    prompt: "Conduct UX audit for [WEBSITE/APP]. Analyze: 1) User journey and pain points, 2) Interface usability issues, 3) Conversion funnel optimization, 4) Accessibility compliance, 5) Mobile responsiveness, 6) Performance recommendations. Provide actionable improvement priorities.",
    topicCategory: "Web/App Dev",
    category: "User Experience"
  },
  {
    name: "Landing Page Optimizer",
    whatItIs: "Conversion-focused landing page framework",
    whatItsFor: "Creating high-converting landing pages for marketing campaigns",
    desiredOutcome: "Landing pages that maximize conversion rates and campaign ROI",
    prompt: "Optimize landing page for [CAMPAIGN/PRODUCT]. Include: 1) Compelling headline and value proposition, 2) Clear CTA above the fold, 3) Social proof and testimonials, 4) Benefit-focused copy, 5) Mobile optimization, 6) A/B testing recommendations. Focus on conversion psychology principles.",
    topicCategory: "Web/App Dev",
    category: "Conversion Optimization"
  },
  {
    name: "App Feature Planning",
    whatItIs: "Strategic feature development framework",
    whatItsFor: "Planning and prioritizing app features for maximum user value",
    desiredOutcome: "Well-prioritized feature roadmap that drives user engagement and business goals",
    prompt: "Plan app features for [APP TYPE]. Include: 1) User story mapping, 2) Feature prioritization matrix, 3) MVP vs future release planning, 4) Technical requirements, 5) Success metrics for each feature. Consider user needs, business goals, and technical feasibility.",
    topicCategory: "Web/App Dev",
    category: "Product Planning"
  },
  {
    name: "Website Performance Analysis",
    whatItIs: "Technical performance optimization framework",
    whatItsFor: "Analyzing and improving website speed and performance",
    desiredOutcome: "Faster loading websites that improve user experience and SEO rankings",
    prompt: "Analyze website performance for [WEBSITE]. Evaluate: 1) Page load speeds and Core Web Vitals, 2) Image optimization opportunities, 3) Code minification and compression, 4) Caching strategies, 5) CDN implementation, 6) Mobile performance. Provide specific optimization recommendations.",
    topicCategory: "Web/App Dev",
    category: "Performance"
  },
  {
    name: "API Documentation Writer",
    whatItIs: "Clear technical documentation framework",
    whatItsFor: "Creating comprehensive API documentation for developers",
    desiredOutcome: "Clear, usable documentation that accelerates developer adoption",
    prompt: "Write API documentation for [API/SERVICE]. Include: 1) Getting started guide, 2) Authentication methods, 3) Endpoint descriptions with examples, 4) Request/response formats, 5) Error handling, 6) SDK/library information. Make it developer-friendly with code samples.",
    topicCategory: "Web/App Dev",
    category: "Technical Writing"
  },
  {
    name: "Database Design Planning",
    whatItIs: "Efficient database architecture framework",
    whatItsFor: "Designing scalable database structures for applications",
    desiredOutcome: "Well-structured databases that support application needs and scale efficiently",
    prompt: "Design database schema for [APPLICATION]. Include: 1) Entity relationship diagram, 2) Table structures with data types, 3) Indexing strategy, 4) Relationship definitions, 5) Data validation rules, 6) Scalability considerations. Optimize for performance and maintainability.",
    topicCategory: "Web/App Dev",
    category: "Database Design"
  },

  // Workflow/AI Agents Prompts
  {
    name: "Business Process Automation",
    whatItIs: "Workflow automation planning framework",
    whatItsFor: "Identifying and automating repetitive business processes",
    desiredOutcome: "Streamlined operations with reduced manual work and improved efficiency",
    prompt: "Design automation workflow for [BUSINESS PROCESS]. Include: 1) Current process mapping, 2) Automation opportunities identification, 3) Tool/platform recommendations, 4) Implementation steps, 5) Success metrics, 6) Training requirements. Focus on ROI and ease of implementation.",
    topicCategory: "Workflow/AI Agents",
    category: "Process Automation"
  },
  {
    name: "Customer Service Chatbot",
    whatItIs: "AI-powered customer support framework",
    whatItsFor: "Creating intelligent chatbots that handle customer inquiries",
    desiredOutcome: "Effective automated customer support that improves satisfaction and reduces costs",
    prompt: "Design customer service chatbot for [BUSINESS/INDUSTRY]. Include: 1) Common customer questions and responses, 2) Conversation flow and decision trees, 3) Escalation triggers to human agents, 4) Personality and tone guidelines, 5) Integration requirements, 6) Performance metrics. Ensure helpful and human-like interactions.",
    topicCategory: "Workflow/AI Agents",
    category: "Customer Service"
  },
  {
    name: "Lead Generation Automation",
    whatItIs: "Automated lead capture and nurturing framework",
    whatItsFor: "Creating systems that automatically generate and qualify leads",
    desiredOutcome: "Consistent lead flow with automated qualification and nurturing",
    prompt: "Create lead generation automation for [BUSINESS]. Include: 1) Lead capture mechanisms, 2) Qualification criteria and scoring, 3) Automated follow-up sequences, 4) CRM integration, 5) Nurturing campaign workflows, 6) Analytics and reporting. Focus on quality over quantity.",
    topicCategory: "Workflow/AI Agents",
    category: "Sales Automation"
  },
  {
    name: "Social Media Management",
    whatItIs: "Automated social media workflow framework",
    whatItsFor: "Streamlining social media content creation and posting",
    desiredOutcome: "Consistent social media presence with minimal manual effort",
    prompt: "Design social media automation for [BRAND]. Include: 1) Content calendar automation, 2) Cross-platform posting schedules, 3) Engagement monitoring and response, 4) Hashtag research and optimization, 5) Performance tracking, 6) Crisis management protocols. Maintain authentic brand voice throughout.",
    topicCategory: "Workflow/AI Agents",
    category: "Social Media"
  },
  {
    name: "Data Analysis Pipeline",
    whatItIs: "Automated data processing and insights framework",
    whatItsFor: "Creating systems that automatically analyze business data",
    desiredOutcome: "Regular business insights with minimal manual data processing",
    prompt: "Build data analysis pipeline for [BUSINESS METRICS]. Include: 1) Data source integration, 2) Automated data cleaning and processing, 3) Key metrics calculation, 4) Alert systems for anomalies, 5) Automated reporting, 6) Visualization dashboards. Focus on actionable insights delivery.",
    topicCategory: "Workflow/AI Agents",
    category: "Data Analytics"
  },
  {
    name: "Project Management Automation",
    whatItIs: "Intelligent project workflow framework",
    whatItsFor: "Automating project management tasks and communications",
    desiredOutcome: "Streamlined project delivery with improved team coordination",
    prompt: "Create project management automation for [PROJECT TYPE]. Include: 1) Task assignment and tracking, 2) Progress reporting automation, 3) Deadline and milestone alerts, 4) Resource allocation optimization, 5) Team communication triggers, 6) Performance analytics. Integrate with existing project management tools.",
    topicCategory: "Workflow/AI Agents",
    category: "Project Management"
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
  {
    name: "Blog Writing Process",
    whatItIs: "Step-by-step methodology for creating SEO-optimized blog content",
    whatItsFor: "Writers and marketers creating search-engine friendly blog posts",
    desiredOutcome: "High-ranking blog posts that drive organic traffic and conversions",
    steps: [
      "Conduct keyword research and identify target terms",
      "Analyze competitor content and identify content gaps",
      "Create comprehensive content outline with H2/H3 structure",
      "Write engaging introduction with hook and value proposition",
      "Develop body content with actionable insights and examples",
      "Optimize for on-page SEO including meta descriptions and alt tags",
      "Proofread, fact-check, and publish with internal linking strategy"
    ],
    topicCategory: "Text",
    category: "SEO Content"
  },
  {
    name: "Email Marketing Campaign",
    whatItIs: "Comprehensive workflow for creating effective email marketing campaigns",
    whatItsFor: "Marketers building nurture sequences and promotional campaigns",
    desiredOutcome: "High-converting email campaigns that drive engagement and sales",
    steps: [
      "Define campaign objectives and success metrics",
      "Segment audience based on behavior and demographics",
      "Create compelling subject lines and preview text",
      "Design email template with clear call-to-action",
      "Write persuasive copy that addresses customer pain points",
      "Set up automation triggers and follow-up sequences",
      "Test, analyze performance, and optimize based on results"
    ],
    topicCategory: "Text",
    category: "Email Marketing"
  },
  {
    name: "Technical Documentation Process",
    whatItIs: "Structured approach to creating clear and comprehensive technical documentation",
    whatItsFor: "Technical writers and developers documenting software and processes",
    desiredOutcome: "User-friendly documentation that reduces support tickets and improves adoption",
    steps: [
      "Analyze user personas and documentation needs",
      "Create information architecture and navigation structure",
      "Write step-by-step procedures with screenshots",
      "Include code examples and troubleshooting guides",
      "Review with subject matter experts and end users",
      "Implement feedback and maintain documentation currency",
      "Track usage analytics and continuously improve content"
    ],
    topicCategory: "Text",
    category: "Technical Writing"
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
  {
    name: "Social Media Visual Content Creation",
    whatItIs: "Systematic approach to creating engaging visual content for social platforms",
    whatItsFor: "Social media managers and content creators building online presence",
    desiredOutcome: "Consistent, platform-optimized visuals that increase engagement and reach",
    steps: [
      "Research platform-specific visual requirements and trends",
      "Create content calendar with visual themes and campaigns",
      "Design templates for different content types and formats",
      "Create original graphics, photos, or source stock images",
      "Optimize images for each platform's specifications",
      "Add brand elements, text overlays, and call-to-actions",
      "Schedule posts and monitor engagement metrics for optimization"
    ],
    topicCategory: "Image",
    category: "Social Media"
  },
  {
    name: "Product Photography Workflow",
    whatItIs: "Professional process for capturing high-quality product images for e-commerce",
    whatItsFor: "E-commerce businesses and photographers showcasing products effectively",
    desiredOutcome: "Professional product images that increase conversion rates and sales",
    steps: [
      "Set up professional lighting and backdrop environment",
      "Clean and prepare products for optimal presentation",
      "Capture multiple angles including detail and lifestyle shots",
      "Edit images for color correction and background removal",
      "Optimize file sizes for web performance",
      "Create consistent naming convention and organize asset library",
      "Upload to e-commerce platform with SEO-friendly alt text"
    ],
    topicCategory: "Image",
    category: "E-commerce"
  },
  {
    name: "Infographic Design Process",
    whatItIs: "Step-by-step method for creating informative and visually appealing infographics",
    whatItsFor: "Marketers and designers communicating complex information visually",
    desiredOutcome: "Engaging infographics that simplify complex data and drive sharing",
    steps: [
      "Research topic and gather accurate data and statistics",
      "Define target audience and key message to communicate",
      "Create wireframe layout organizing information hierarchy",
      "Design visual elements including icons, charts, and illustrations",
      "Choose color scheme and typography that supports readability",
      "Add final touches and ensure visual flow tells a story",
      "Export in multiple formats and promote across relevant channels"
    ],
    topicCategory: "Image",
    category: "Data Visualization"
  },
  {
    name: "Logo Design Development",
    whatItIs: "Comprehensive process for creating memorable and effective brand logos",
    whatItsFor: "Designers and businesses developing new brand identities",
    desiredOutcome: "Distinctive logo that effectively represents brand values and appeals to target audience",
    steps: [
      "Conduct brand discovery and competitive analysis",
      "Develop multiple concept sketches and directions",
      "Create digital versions of strongest concepts",
      "Test logo across different applications and sizes",
      "Refine chosen concept based on feedback",
      "Finalize logo with complete brand guidelines",
      "Deliver logo files in all necessary formats and variations"
    ],
    topicCategory: "Image",
    category: "Brand Design"
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
  {
    name: "YouTube Channel Optimization",
    whatItIs: "Strategic workflow for growing and optimizing YouTube channel performance",
    whatItsFor: "Content creators and businesses building YouTube presence",
    desiredOutcome: "Increased subscribers, views, and engagement leading to monetization opportunities",
    steps: [
      "Research target audience and competitor channels for insights",
      "Optimize channel art, description, and playlist organization",
      "Develop content strategy with consistent upload schedule",
      "Create compelling thumbnails and titles for each video",
      "Optimize video descriptions with keywords and timestamps",
      "Engage with community through comments and collaborations",
      "Analyze YouTube Analytics to refine strategy and content"
    ],
    topicCategory: "Video",
    category: "YouTube Strategy"
  },
  {
    name: "Educational Video Series Creation",
    whatItIs: "Structured approach to creating comprehensive educational video content",
    whatItsFor: "Educators and businesses creating training or instructional content",
    desiredOutcome: "Engaging educational videos that effectively teach concepts and skills",
    steps: [
      "Define learning objectives and target skill level",
      "Break down complex topics into digestible lesson segments",
      "Create detailed curriculum outline with progression structure",
      "Script each video with clear explanations and examples",
      "Record content using appropriate visual aids and demonstrations",
      "Edit for clarity and add captions for accessibility",
      "Test with sample audience and gather feedback for improvements"
    ],
    topicCategory: "Video",
    category: "Education"
  },
  {
    name: "Live Streaming Setup and Management",
    whatItIs: "Complete workflow for professional live streaming across platforms",
    whatItsFor: "Content creators and businesses engaging audiences through live content",
    desiredOutcome: "Professional live streams that engage viewers and build community",
    steps: [
      "Set up streaming software and test technical equipment",
      "Plan content structure with engaging segments and interactions",
      "Promote upcoming stream across social media and email",
      "Conduct pre-stream technical check and backup preparations",
      "Go live with engaging introduction and clear agenda",
      "Monitor chat and engage with audience throughout stream",
      "Save recording for repurposing and analyze stream metrics"
    ],
    topicCategory: "Video",
    category: "Live Streaming"
  },
  {
    name: "Corporate Video Production",
    whatItIs: "Professional workflow for creating business and corporate video content",
    whatItsFor: "Companies producing internal training, marketing, or communication videos",
    desiredOutcome: "Polished corporate videos that effectively communicate business messages",
    steps: [
      "Meet with stakeholders to define project scope and messaging",
      "Develop creative brief and obtain necessary approvals",
      "Coordinate filming logistics including locations and talent",
      "Conduct professional filming with appropriate equipment",
      "Edit video with corporate branding and professional graphics",
      "Review with stakeholders and incorporate feedback",
      "Deliver final video in required formats for distribution"
    ],
    topicCategory: "Video",
    category: "Corporate Communications"
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
  {
    name: "Audiobook Production Process",
    whatItIs: "Professional workflow for creating and publishing audiobooks",
    whatItsFor: "Authors and publishers expanding into audiobook market",
    desiredOutcome: "High-quality audiobook that meets industry standards and engages listeners",
    steps: [
      "Prepare manuscript with pronunciation guides and notes",
      "Set up professional recording environment with quality equipment",
      "Record chapters with consistent pacing and tone",
      "Edit audio for clarity, removing errors and long pauses",
      "Master audio to meet audiobook platform specifications",
      "Create chapter markers and metadata for easy navigation",
      "Submit to audiobook platforms with compelling cover and description"
    ],
    topicCategory: "Audio",
    category: "Publishing"
  },
  {
    name: "Music Production Workflow",
    whatItIs: "Step-by-step process for creating original music from concept to final master",
    whatItsFor: "Musicians and producers creating professional music recordings",
    desiredOutcome: "Professional-quality music ready for distribution and streaming platforms",
    steps: [
      "Develop musical concept and create basic song structure",
      "Record foundational tracks including drums, bass, and rhythm elements",
      "Layer additional instruments and melodic elements",
      "Record and edit vocal tracks with proper timing and pitch",
      "Mix all elements together balancing levels and effects",
      "Master final track for optimal playback across all systems",
      "Distribute to streaming platforms and promote to target audience"
    ],
    topicCategory: "Audio",
    category: "Music Production"
  },
  {
    name: "Voice-Over Recording Process",
    whatItIs: "Professional workflow for creating high-quality voice-over recordings",
    whatItsFor: "Voice actors and businesses creating audio content and advertisements",
    desiredOutcome: "Clear, professional voice recordings that effectively deliver the intended message",
    steps: [
      "Review script and practice delivery with proper emphasis",
      "Set up recording environment minimizing background noise",
      "Warm up voice and conduct test recordings for optimal levels",
      "Record multiple takes focusing on clarity and emotion",
      "Edit recordings removing mistakes and optimizing timing",
      "Apply audio processing for consistency and professional sound",
      "Deliver final audio in client-specified formats and quality"
    ],
    topicCategory: "Audio",
    category: "Voice Acting"
  },
  {
    name: "Audio Branding Development",
    whatItIs: "Comprehensive process for creating cohesive audio brand identity",
    whatItsFor: "Brands developing consistent audio elements across all touchpoints",
    desiredOutcome: "Distinctive audio identity that reinforces brand recognition and emotional connection",
    steps: [
      "Analyze brand personality and translate into audio characteristics",
      "Develop audio logo and signature sound elements",
      "Create music library reflecting brand mood and values",
      "Design sound effects and notification sounds for digital products",
      "Establish voice guidelines including tone, pace, and style",
      "Create audio brand guidelines for consistent implementation",
      "Test audio elements across different contexts and refine as needed"
    ],
    topicCategory: "Audio",
    category: "Brand Development"
  },

  // Web/App Dev Workflows
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
    topicCategory: "Web/App Dev",
    category: "Product Development"
  },
  {
    name: "Website Development Process",
    whatItIs: "Complete workflow for building professional websites from concept to launch",
    whatItsFor: "Developers and agencies creating custom websites for clients",
    desiredOutcome: "High-performing website that meets business objectives and user needs",
    steps: [
      "Conduct discovery session to understand business goals and requirements",
      "Create sitemap and wireframes for user experience planning",
      "Design visual mockups and get client approval on aesthetics",
      "Develop responsive website with modern coding standards",
      "Implement SEO best practices and performance optimizations",
      "Test functionality across devices and browsers",
      "Launch website and set up analytics and monitoring tools"
    ],
    topicCategory: "Web/App Dev",
    category: "Web Development"
  },
  {
    name: "E-commerce Platform Setup",
    whatItIs: "Systematic approach to launching online stores with full functionality",
    whatItsFor: "Businesses transitioning to online sales or expanding e-commerce presence",
    desiredOutcome: "Fully functional online store that drives sales and provides excellent customer experience",
    steps: [
      "Research and select appropriate e-commerce platform",
      "Set up product catalog with descriptions, images, and pricing",
      "Configure payment processing and shipping options",
      "Customize store design to match brand identity",
      "Set up inventory management and order fulfillment systems",
      "Test checkout process and payment security",
      "Launch store with marketing campaign and customer support systems"
    ],
    topicCategory: "Web/App Dev",
    category: "E-commerce"
  },
  {
    name: "API Development and Integration",
    whatItIs: "Professional workflow for creating and integrating application programming interfaces",
    whatItsFor: "Developers building connected applications and third-party integrations",
    desiredOutcome: "Robust API that enables seamless data exchange and system integration",
    steps: [
      "Define API requirements and data structure specifications",
      "Design RESTful endpoints with proper HTTP methods and status codes",
      "Implement authentication and authorization security measures",
      "Develop API with proper error handling and validation",
      "Create comprehensive documentation with code examples",
      "Test API functionality and performance under load",
      "Deploy to production with monitoring and version management"
    ],
    topicCategory: "Web/App Dev",
    category: "Backend Development"
  },
  {
    name: "Progressive Web App Development",
    whatItIs: "Modern workflow for creating app-like web experiences with offline capabilities",
    whatItsFor: "Developers creating fast, reliable web applications that work offline",
    desiredOutcome: "High-performance web app that provides native app experience across devices",
    steps: [
      "Set up service worker for offline functionality and caching",
      "Implement responsive design for optimal mobile experience",
      "Add web app manifest for home screen installation",
      "Optimize performance with code splitting and lazy loading",
      "Implement push notifications for user engagement",
      "Test PWA features across different devices and browsers",
      "Deploy with HTTPS and monitor performance metrics"
    ],
    topicCategory: "Web/App Dev",
    category: "Progressive Web Apps"
  },
  {
    name: "Database Design and Optimization",
    whatItIs: "Comprehensive approach to designing efficient and scalable database systems",
    whatItsFor: "Database administrators and developers building data-driven applications",
    desiredOutcome: "Optimized database that supports application requirements with excellent performance",
    steps: [
      "Analyze data requirements and relationships between entities",
      "Create normalized database schema with proper indexing strategy",
      "Implement data validation rules and constraints",
      "Set up backup and recovery procedures for data protection",
      "Optimize queries and database performance tuning",
      "Establish security measures and access controls",
      "Monitor database performance and plan for scalability"
    ],
    topicCategory: "Web/App Dev",
    category: "Database Management"
  },

  // Workflow/AI Agents Workflows
  {
    name: "Business Process Automation Setup",
    whatItIs: "Systematic approach to identifying and automating repetitive business processes",
    whatItsFor: "Businesses looking to increase efficiency and reduce manual work",
    desiredOutcome: "Automated workflows that save time and reduce human error in business operations",
    steps: [
      "Map current business processes and identify automation opportunities",
      "Select appropriate automation tools based on requirements and budget",
      "Design automated workflows with proper trigger conditions",
      "Set up integrations between different business applications",
      "Test automation workflows with real data scenarios",
      "Train team members on new automated processes",
      "Monitor automation performance and optimize based on results"
    ],
    topicCategory: "Workflow/AI Agents",
    category: "Process Automation"
  },
  {
    name: "AI Chatbot Development",
    whatItIs: "Complete workflow for creating intelligent chatbots for customer service and engagement",
    whatItsFor: "Businesses wanting to automate customer interactions and provide 24/7 support",
    desiredOutcome: "Intelligent chatbot that effectively handles customer queries and improves satisfaction",
    steps: [
      "Define chatbot objectives and identify common customer queries",
      "Choose AI platform and design conversation flow architecture",
      "Train chatbot with relevant data and response scenarios",
      "Integrate chatbot with existing customer service systems",
      "Test chatbot responses and refine natural language understanding",
      "Deploy chatbot across chosen communication channels",
      "Monitor chatbot performance and continuously improve responses"
    ],
    topicCategory: "Workflow/AI Agents",
    category: "AI Customer Service"
  },
  {
    name: "CRM Automation Workflow",
    whatItIs: "Strategic approach to automating customer relationship management processes",
    whatItsFor: "Sales teams and businesses looking to streamline customer management",
    desiredOutcome: "Automated CRM system that nurtures leads and improves sales conversion rates",
    steps: [
      "Audit current CRM processes and identify automation opportunities",
      "Set up lead scoring and qualification automation rules",
      "Create automated email sequences for different customer segments",
      "Configure task assignments and follow-up reminders",
      "Integrate CRM with marketing automation and sales tools",
      "Set up reporting dashboards for sales performance tracking",
      "Train sales team on automated workflows and optimize based on feedback"
    ],
    topicCategory: "Workflow/AI Agents",
    category: "Sales Automation"
  },
  {
    name: "Social Media Management Automation",
    whatItIs: "Comprehensive workflow for automating social media posting and engagement",
    whatItsFor: "Marketing teams managing multiple social media accounts efficiently",
    desiredOutcome: "Consistent social media presence with automated posting and engagement tracking",
    steps: [
      "Develop content calendar and categorize content by platform and audience",
      "Set up social media scheduling tools with automated posting",
      "Create engagement monitoring and response automation rules",
      "Implement social listening for brand mentions and sentiment tracking",
      "Automate cross-platform content distribution and formatting",
      "Set up performance analytics and reporting dashboards",
      "Monitor automation effectiveness and adjust strategy based on engagement data"
    ],
    topicCategory: "Workflow/AI Agents",
    category: "Social Media Automation"
  },
  {
    name: "Email Marketing Automation Funnel",
    whatItIs: "Strategic workflow for creating automated email marketing campaigns and sequences",
    whatItsFor: "Marketers building scalable email campaigns that nurture leads automatically",
    desiredOutcome: "High-converting email automation that moves prospects through sales funnel",
    steps: [
      "Segment email list based on customer behavior and preferences",
      "Design email sequence with compelling subject lines and content",
      "Set up trigger-based automation rules for different customer actions",
      "Create personalized email templates for different audience segments",
      "Configure A/B testing for subject lines and email content",
      "Implement lead scoring and automated follow-up sequences",
      "Analyze email performance metrics and optimize campaigns continuously"
    ],
    topicCategory: "Workflow/AI Agents",
    category: "Email Automation"
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
    topicCategory: "Web/App Dev",
    category: "Product Launch"
  },
  {
    name: "Email Marketing Automation Blueprint",
    whatItIs: "Complete framework for building automated email marketing campaigns",
    whatItsFor: "Scaling email marketing with personalized automation sequences",
    desiredOutcome: "High-converting email campaigns that nurture leads automatically",
    template: `# Email Marketing Automation Blueprint

## Campaign Overview
### Campaign Objective: [Primary goal]
### Target Audience: [Segment details]
### Expected Duration: [Timeline]

## Email Sequences
### Welcome Series
- Email 1 (Day 0): [Subject and content outline]
- Email 2 (Day 2): [Subject and content outline]
- Email 3 (Day 5): [Subject and content outline]

### Nurture Sequence
- Email 4 (Week 2): [Educational content]
- Email 5 (Week 3): [Case study or social proof]
- Email 6 (Week 4): [Product benefits and features]

### Conversion Sequence
- Email 7 (Week 5): [Special offer or demo invitation]
- Email 8 (Week 6): [Urgency and final CTA]

## Segmentation Strategy
### Behavioral Triggers
- Email opens: [Follow-up actions]
- Link clicks: [Interest-based segmentation]
- No engagement: [Re-engagement sequence]

### Demographic Segments
- [Segment 1]: [Customized messaging]
- [Segment 2]: [Customized messaging]

## Personalization Elements
- Dynamic content: [Name, company, industry]
- Behavioral triggers: [Based on user actions]
- A/B testing: [Subject lines, CTAs, send times]

## Success Metrics
- Open rate target: [Percentage]
- Click-through rate: [Percentage]
- Conversion rate: [Percentage]
- Unsubscribe rate: [Acceptable threshold]`,
    topicCategory: "Text",
    category: "Email Marketing"
  },
  {
    name: "Social Media Content Calendar",
    whatItIs: "Organized template for planning and scheduling social media content",
    whatItsFor: "Maintaining consistent, strategic social media presence",
    desiredOutcome: "Engaging social content that drives audience growth and engagement",
    template: `# Social Media Content Calendar Blueprint

## Monthly Theme
### Month: [Month name]
### Theme: [Overarching content theme]
### Goals: [Monthly objectives]

## Platform Strategy
### Platform 1: [Instagram/Facebook]
- Posting frequency: [Posts per week]
- Best posting times: [Optimal schedule]
- Content mix: [80% value, 20% promotional]

### Platform 2: [LinkedIn]
- Posting frequency: [Posts per week]
- Best posting times: [Optimal schedule]
- Content mix: [Professional insights and thought leadership]

### Platform 3: [Twitter/X]
- Posting frequency: [Posts per day]
- Best posting times: [Optimal schedule]
- Content mix: [News, insights, engagement]

## Content Pillars
### Pillar 1: Educational Content (40%)
- Tips and tutorials
- Industry insights
- How-to guides

### Pillar 2: Entertainment (30%)
- Behind-the-scenes content
- User-generated content
- Trending topics

### Pillar 3: Engagement (20%)
- Questions and polls
- Contests and giveaways
- Community features

### Pillar 4: Promotional (10%)
- Product launches
- Special offers
- Events and webinars

## Weekly Content Grid
### Monday: [Content type and theme]
### Tuesday: [Content type and theme]
### Wednesday: [Content type and theme]
### Thursday: [Content type and theme]
### Friday: [Content type and theme]

## Content Repository
- Stock photos: [Source and usage]
- Templates: [Canva, Adobe]
- Hashtag library: [Categorized by topic]
- Caption templates: [Pre-written copy]

## Performance Tracking
- Weekly metrics review: [Engagement rates]
- Monthly analysis: [Growth and reach]
- Quarterly strategy adjustment: [Based on data]`,
    topicCategory: "Text",
    category: "Social Media"
  },
  {
    name: "Social Media Asset Package",
    whatItIs: "Complete set of branded social media graphics and templates",
    whatItsFor: "Maintaining visual consistency across all social platforms",
    desiredOutcome: "Professional, on-brand social content that stands out",
    template: `# Social Media Asset Package Blueprint

## Platform Specifications
### Instagram
- Feed posts: 1080x1080px
- Stories: 1080x1920px
- Reels: 1080x1920px
- Carousel: 1080x1080px per slide

### Facebook
- Feed posts: 1200x630px
- Stories: 1080x1920px
- Cover photo: 820x312px

### LinkedIn
- Feed posts: 1200x627px
- Company cover: 1128x191px
- Personal cover: 1584x396px

### Twitter/X
- Posts: 1200x675px
- Header: 1500x500px

## Template Types
### Announcement Templates
- Product launches
- Event promotions
- Company news

### Educational Templates
- Tips and tricks
- Statistics and data
- Step-by-step guides

### Engagement Templates
- Questions and polls
- Quote graphics
- User testimonials

## Design Elements
### Brand Colors
- Primary: [Hex codes]
- Secondary: [Hex codes]
- Accent: [Hex codes]

### Typography
- Headlines: [Font and size]
- Body text: [Font and size]
- CTAs: [Font and size]

### Visual Style
- Photography: [Style guidelines]
- Icons: [Source and usage]
- Filters: [Consistent look]

## Usage Guidelines
- Logo placement: [Position and size]
- Text hierarchy: [Readability rules]
- White space: [Breathing room]
- Call-to-action: [Placement and visibility]

## Asset Organization
- Folder structure: [By platform and type]
- Naming convention: [Consistent format]
- Version control: [Update tracking]`,
    topicCategory: "Image",
    category: "Social Media"
  },
  {
    name: "E-commerce Product Photography Guide",
    whatItIs: "Comprehensive template for creating compelling product images",
    whatItsFor: "Showcasing products effectively to drive online sales",
    desiredOutcome: "Professional product imagery that increases conversion rates",
    template: `# E-commerce Product Photography Blueprint

## Photography Setup
### Equipment Needed
- Camera: [Specifications]
- Lighting: [3-point lighting setup]
- Backdrop: [White seamless or contextual]
- Props: [Complementary items]

### Camera Settings
- Aperture: [f/8-f/16 for product detail]
- ISO: [100-400 for low noise]
- Shutter speed: [Based on lighting]
- White balance: [Manual for consistency]

## Shot List Template
### Essential Shots
1. **Hero Shot**: Main product angle with best features
2. **Detail Shots**: Close-ups of textures, materials, quality
3. **Scale Shots**: Product in context or with size reference
4. **Lifestyle Shots**: Product in use or real environment
5. **360° Views**: Multiple angles for comprehensive view

### Per Product Checklist
- [ ] Clean product thoroughly
- [ ] Check for defects or damage
- [ ] Capture all color variations
- [ ] Include packaging shots
- [ ] Show product from all sides
- [ ] Highlight unique features

## Post-Processing Workflow
### Basic Edits
- Color correction: [Match real product]
- Background removal: [Clean white or transparent]
- Shadow and highlight adjustment
- Sharpening: [Enhance detail without artifacts]

### Advanced Techniques
- Clipping path: [For precise cutouts]
- Retouching: [Remove imperfections]
- Color grading: [Consistent look across products]
- File optimization: [Balance quality and file size]

## Platform Requirements
### Amazon
- Main image: White background, 1000x1000px minimum
- Additional images: Lifestyle and detail shots
- Image requirements: JPEG or TIFF, RGB color mode

### Shopify/Website
- Product thumbnails: 800x800px
- Full-size images: 2048x2048px
- Mobile optimization: [Responsive sizing]

### Social Media
- Instagram shop: Square 1080x1080px
- Pinterest pins: Vertical 1000x1500px
- Facebook shop: 1200x1200px

## Quality Control
### Image Checklist
- [ ] Sharp and in focus
- [ ] Accurate colors
- [ ] Proper exposure
- [ ] Clean background
- [ ] Consistent style across products
- [ ] Optimized file size
- [ ] Proper naming and tagging`,
    topicCategory: "Image",
    category: "E-commerce"
  },
  {
    name: "YouTube Channel Growth Blueprint",
    whatItIs: "Strategic framework for building and monetizing a YouTube channel",
    whatItsFor: "Content creators looking to grow audience and revenue on YouTube",
    desiredOutcome: "Monetized YouTube channel with engaged subscriber base",
    template: `# YouTube Channel Growth Blueprint

## Channel Foundation
### Channel Identity
- Channel name: [Memorable and searchable]
- Niche: [Specific target audience]
- Value proposition: [What viewers gain]
- Upload schedule: [Consistency is key]

### Channel Branding
- Channel art: 2560x1440px banner
- Profile picture: 800x800px logo or face
- Channel description: [SEO-optimized with keywords]
- Links: [Website, social media, email]

## Content Strategy
### Video Types
1. **Pillar Content** (Weekly)
   - Main topic videos
   - 10-15 minutes ideal length
   - High production value

2. **Shorts** (3-5x per week)
   - Under 60 seconds
   - Trending topics and hooks
   - Drive channel discovery

3. **Live Streams** (Biweekly)
   - Community engagement
   - Q&A sessions
   - Behind-the-scenes

### Content Calendar
- Week 1: [Main topic + 3 Shorts]
- Week 2: [Main topic + 3 Shorts + Live]
- Week 3: [Main topic + 3 Shorts]
- Week 4: [Main topic + 3 Shorts + Live]

## SEO Optimization
### Video Optimization
- Title: [Keyword-rich, under 60 characters]
- Description: [Detailed with timestamps and links]
- Tags: [15-20 relevant tags]
- Thumbnail: 1280x720px, high contrast, readable text
- Cards and end screens: [Drive watch time]

### Keyword Research
- Main keywords: [High volume, relevant]
- Long-tail keywords: [Specific, less competitive]
- Competitor analysis: [Gap opportunities]

## Growth Tactics
### First 48 Hours Strategy
- Share on all social platforms
- Email list notification
- Community post on YouTube
- Engage with early comments
- Pin top comment with CTA

### Community Building
- Reply to comments within 24 hours
- Create community posts weekly
- Host live Q&A sessions
- Collaborate with similar creators
- Create exclusive content for members

## Monetization Strategy
### Revenue Streams
1. **YouTube Partner Program**
   - Requirements: 1,000 subs + 4,000 watch hours
   - Ad revenue: [Estimated CPM]

2. **Sponsorships**
   - Brand deals: [Rate per video]
   - Affiliate marketing: [Commission structure]

3. **Channel Memberships**
   - Exclusive perks: [Member-only content]
   - Pricing tiers: [$4.99, $9.99, $24.99]

4. **Digital Products**
   - Courses or ebooks
   - Templates or presets
   - Merchandise

## Analytics & Optimization
### Key Metrics
- Watch time: [Goal: Increase monthly]
- Average view duration: [Target: >50%]
- Click-through rate: [Target: >5%]
- Subscriber growth: [Target: X per month]

### Monthly Review
- Top-performing videos: [Analyze why]
- Audience demographics: [Adjust content]
- Traffic sources: [Optimize discovery]
- Engagement patterns: [Best practices]

## Growth Milestones
- 0-1K subscribers: [Focus on consistency]
- 1K-10K: [Optimize for algorithm]
- 10K-100K: [Scale and monetize]
- 100K+: [Diversify revenue streams]`,
    topicCategory: "Video",
    category: "Content Strategy"
  },
  {
    name: "Video Ad Campaign Framework",
    whatItIs: "Template for creating high-converting video advertising campaigns",
    whatItsFor: "Businesses running paid video ads across platforms",
    desiredOutcome: "Effective video ads that drive conversions and ROI",
    template: `# Video Ad Campaign Blueprint

## Campaign Setup
### Objectives
- Primary goal: [Brand awareness, leads, sales]
- Target audience: [Demographics and interests]
- Budget: [Daily/lifetime spend]
- Duration: [Campaign timeline]

## Video Ad Specs by Platform
### Meta (Facebook/Instagram)
- Feed video: 1080x1080px, 15-60 seconds
- Stories: 1080x1920px, up to 15 seconds
- Reels: 1080x1920px, 15-90 seconds

### YouTube
- Skippable in-stream: 12 seconds to 6 minutes
- Non-skippable: 15-20 seconds
- Bumper ads: 6 seconds
- Discovery ads: Thumbnail + text

### TikTok
- In-feed ads: 9:16 aspect ratio, 5-60 seconds
- Top View: Full screen, 5-60 seconds
- Branded effects: Custom filters and stickers

### LinkedIn
- Sponsored content: 1920x1080px, 3 seconds to 30 minutes
- Message ads: Video in conversation ads

## Video Structure
### Hook (First 3 Seconds)
- Pattern interrupt: [Unexpected visual or statement]
- Clear value proposition: [What's in it for viewer]
- Brand visibility: [Logo or product early]

### Body (Middle Section)
- Problem agitation: [Pain points]
- Solution presentation: [Your product/service]
- Social proof: [Testimonials or results]
- Benefits over features: [Transform outcomes]

### Call-to-Action (Final Seconds)
- Clear directive: [What to do next]
- Urgency or incentive: [Limited time offer]
- Easy next step: [Simple action]

## Creative Testing
### A/B Test Variables
- Hook variations: [3 different openers]
- Length: [15s vs 30s vs 60s]
- CTA: [Different offers or wording]
- Thumbnails: [For discovery ads]

### Creative Refresh
- Weekly: [New hooks on existing footage]
- Monthly: [New creative concepts]
- Quarterly: [Complete campaign refresh]

## Targeting Strategy
### Audience Segments
1. **Cold Audience**
   - Interest-based targeting
   - Lookalike audiences
   - Competitor audiences

2. **Warm Audience**
   - Website visitors
   - Engaged social users
   - Email list subscribers

3. **Hot Audience**
   - Cart abandoners
   - Previous customers
   - High-intent behaviors

## Campaign Optimization
### Week 1: Learning Phase
- Monitor daily performance
- Let algorithm optimize
- No major changes

### Week 2-4: Optimization
- Pause low performers
- Scale winning ads
- Test new audiences
- Adjust bidding strategy

### Success Metrics
- Cost per view (CPV): [Target]
- View-through rate: [Target %]
- Click-through rate: [Target %]
- Cost per acquisition: [Target]
- Return on ad spend: [Target X:1]

## Budget Allocation
- Testing budget: 20% [New creatives and audiences]
- Scaling budget: 80% [Proven winners]
- Platform split: [Based on performance data]`,
    topicCategory: "Video",
    category: "Advertising"
  },
  {
    name: "Voice-Over Style Guide",
    whatItIs: "Comprehensive framework for maintaining consistent voice branding",
    whatItsFor: "Ensuring consistent audio branding across all voice content",
    desiredOutcome: "Professional, recognizable voice presence that reinforces brand identity",
    template: `# Voice-Over Style Guide Blueprint

## Brand Voice Characteristics
### Personality Traits
- Primary trait: [Professional, friendly, authoritative, etc.]
- Secondary traits: [Helpful, innovative, trustworthy]
- Brand archetype: [Hero, sage, creator, etc.]

### Voice Description
- Tone: [Warm, energetic, calm, commanding]
- Pace: [Fast-paced, moderate, slow and deliberate]
- Pitch: [High, medium, low]
- Energy level: [High energy, moderate, subdued]

## Technical Specifications
### Voice Talent Requirements
- Age range: [20s, 30s, 40s+]
- Gender: [Male, female, non-binary, or any]
- Accent: [Neutral American, British, regional]
- Special qualities: [Raspy, smooth, animated]

### Recording Standards
- Sample rate: 48kHz
- Bit depth: 24-bit
- Format: WAV (uncompressed)
- Room tone: Capture 30 seconds for editing

## Content-Specific Guidelines
### Commercials (15-60 seconds)
- Delivery: [Energetic and engaging]
- Emphasis: [Key product benefits]
- Pacing: [Brisk but clear]
- Call-to-action: [Strong and motivating]

### Explainer Videos (2-5 minutes)
- Delivery: [Conversational and educational]
- Emphasis: [Key concepts and benefits]
- Pacing: [Moderate with strategic pauses]
- Tone: [Helpful and approachable]

### E-learning Content (10+ minutes)
- Delivery: [Clear and authoritative]
- Emphasis: [Important information and instructions]
- Pacing: [Moderate with defined sections]
- Tone: [Professional and engaging]

### Audiobooks (Long-form)
- Delivery: [Consistent character voices]
- Emphasis: [Emotional beats and dialogue]
- Pacing: [Natural reading speed]
- Tone: [Appropriate to content and genre]

## Pronunciation Guide
### Brand Terminology
- Company name: [Phonetic spelling]
- Product names: [Phonetic spelling]
- Technical terms: [Phonetic spelling]
- Industry jargon: [Phonetic spelling]

### Common Mistakes to Avoid
- [Word/phrase]: [Incorrect] → [Correct]
- [Word/phrase]: [Incorrect] → [Correct]

## Emotional Range
### Appropriate Emotions by Content Type
- Excitement: [Product launches, promotions]
- Empathy: [Problem-solution narratives]
- Authority: [Industry expertise, tutorials]
- Enthusiasm: [Brand storytelling, testimonials]

### Emotions to Avoid
- [Emotion]: [Why it doesn't fit brand]
- [Emotion]: [Why it doesn't fit brand]

## Quality Control Checklist
### Before Recording
- [ ] Script reviewed and approved
- [ ] Pronunciation guide consulted
- [ ] Technical specs confirmed
- [ ] Quiet recording environment prepared

### During Recording
- [ ] Consistent delivery matching style guide
- [ ] Multiple takes of key sections
- [ ] Room tone captured
- [ ] No mouth clicks or plosives

### Post-Recording Review
- [ ] Consistent tone throughout
- [ ] Clear pronunciation
- [ ] Appropriate pacing
- [ ] Brand personality conveyed
- [ ] Technical quality meets standards

## Usage Examples
### Do's
- Match energy to content purpose
- Use natural pauses for emphasis
- Maintain consistent character throughout
- Convey genuine enthusiasm

### Don'ts
- Don't rush through important information
- Don't sound robotic or over-scripted
- Don't deviate from brand personality
- Don't use vocal fry or uptalk

## Revision Protocol
- Voice talent: [How to request changes]
- Approval process: [Who signs off]
- Turnaround time: [Expected timeline]`,
    topicCategory: "Audio",
    category: "Brand Audio"
  },
  {
    name: "Podcast Monetization Strategy",
    whatItIs: "Framework for generating revenue from podcast content",
    whatItsFor: "Podcast creators looking to monetize their audience",
    desiredOutcome: "Sustainable podcast revenue through multiple income streams",
    template: `# Podcast Monetization Blueprint

## Audience Requirements
### Minimum Thresholds
- Episodes published: 10+ episodes
- Downloads per episode: 100+ consistently
- Email subscribers: 500+ engaged listeners
- Social media: Active community

### Audience Quality
- Engagement rate: [Comment, share, review]
- Demographics: [Valuable to advertisers]
- Loyalty: [Return listener rate]
- Growth rate: [Month-over-month increase]

## Revenue Streams
### 1. Sponsorships & Advertising
**CPM Rates by Tier**
- Pre-roll (15s): $15-25 CPM
- Mid-roll (60s): $25-40 CPM
- Post-roll (30s): $10-20 CPM

**Sponsor Acquisition**
- Join ad networks: [Megaphone, Podcorn]
- Direct outreach: [Relevant brands]
- Media kit: [Audience stats and testimonials]

**Ad Integration**
- Host-read ads: [Authentic and conversational]
- Dynamic insertion: [Automated ad placement]
- Evergreen vs dated: [Content considerations]

### 2. Premium Content
**Membership Tiers**
- Tier 1 ($5/month): [Ad-free episodes, early access]
- Tier 2 ($10/month): [Bonus episodes, Q&A sessions]
- Tier 3 ($25/month): [1-on-1 consultations, masterclasses]

**Platform Options**
- Patreon: [Established platform with tools]
- Supercast: [Podcast-specific hosting]
- Apple Podcasts Subscriptions: [Built-in audience]

### 3. Affiliate Marketing
**Product Recommendations**
- Relevant tools and software
- Books and courses
- Services and platforms
- Physical products

**Promotion Strategy**
- Genuine use and endorsement
- Trackable affiliate links
- Discount codes for listeners
- Regular but not excessive mentions

### 4. Digital Products
**Course Creation**
- Topic: [Expertise area from podcast]
- Format: [Video lessons, workbooks, templates]
- Price: [$99-$999 based on depth]
- Launch: [Special podcast audience pricing]

**Ebook or Guide**
- Compilation: [Best episodes and insights]
- Exclusive content: [Deeper dives and frameworks]
- Price: [$9-$49]
- Formats: [PDF, ePub, Kindle]

### 5. Live Events
**Virtual Events**
- Live recordings: [Ticket sales $10-50]
- Workshops: [In-depth training $99-499]
- Networking sessions: [Community building]

**In-Person Events**
- Live show tours: [Ticket sales $20-100]
- Conferences: [Multiple revenue streams]
- VIP experiences: [Premium pricing $200+]

### 6. Consulting & Services
**Leveraging Authority**
- Consulting packages: [Hourly or project-based]
- Speaking engagements: [Keynote fees]
- Workshops and training: [Corporate or public]
- Coaching programs: [1-on-1 or group]

## Monetization Timeline
### 0-6 Months: Foundation
- Focus on content quality and consistency
- Build audience and engagement
- Start email list
- Create media kit

### 6-12 Months: Initial Monetization
- Launch first sponsor or ad network
- Create affiliate partnerships
- Develop free lead magnet
- Test premium content

### 12-18 Months: Diversification
- Multiple sponsor relationships
- Membership program launch
- First digital product
- Virtual event series

### 18+ Months: Optimization
- Premium pricing for sponsors
- Expanded product line
- In-person events
- Consulting and speaking

## Financial Projections
### Revenue Goals by Stage
**Stage 1** (1,000 downloads/ep)
- Sponsorships: $200-500/episode
- Affiliates: $100-300/month
- Total: $1,000-2,500/month

**Stage 2** (5,000 downloads/ep)
- Sponsorships: $1,000-2,000/episode
- Memberships: $500-1,500/month
- Affiliates: $500-1,000/month
- Total: $5,000-10,000/month

**Stage 3** (10,000+ downloads/ep)
- Sponsorships: $2,500-5,000/episode
- Memberships: $2,000-5,000/month
- Products: $2,000-10,000/month
- Events: $1,000-5,000/month
- Total: $15,000-50,000+/month

## Metrics to Track
### Audience Growth
- Total downloads
- Subscriber count
- Email list growth
- Social media following

### Engagement
- Reviews and ratings
- Social media engagement
- Email open rates
- Community participation

### Revenue
- Revenue per episode
- Revenue per download
- Listener lifetime value
- Profit margins by stream`,
    topicCategory: "Audio",
    category: "Monetization"
  },
  {
    name: "Web Application Architecture Blueprint",
    whatItIs: "Comprehensive template for planning scalable web application structure",
    whatItsFor: "Developers designing robust, maintainable web applications",
    desiredOutcome: "Well-architected application that scales efficiently and maintains code quality",
    template: `# Web Application Architecture Blueprint

## Application Overview
### Project Details
- Application name: [Project name]
- Purpose: [Primary function and goals]
- Target users: [User personas]
- Expected scale: [Users, traffic, data volume]

### Technology Stack
**Frontend**
- Framework: [React, Vue, Angular, Next.js]
- State management: [Redux, Context API, Zustand]
- Styling: [Tailwind, CSS Modules, Styled Components]
- Build tool: [Vite, Webpack, Turbopack]

**Backend**
- Runtime: [Node.js, Python, Go, Rust]
- Framework: [Express, FastAPI, Gin, Actix]
- API type: [REST, GraphQL, tRPC]
- Authentication: [JWT, OAuth, Supabase Auth]

**Database**
- Primary: [PostgreSQL, MySQL, MongoDB]
- Cache: [Redis, Memcached]
- Search: [Elasticsearch, Algolia, Typesense]
- Vector DB: [Pinecone, Weaviate, Qdrant]

**Infrastructure**
- Hosting: [Vercel, Netlify, AWS, Google Cloud]
- CDN: [Cloudflare, AWS CloudFront]
- Storage: [S3, Google Cloud Storage]
- Email: [SendGrid, Postmark, Resend]

## System Architecture
### Application Layers
1. **Presentation Layer**
   - UI components
   - Routing and navigation
   - Client-side state management
   - Form handling and validation

2. **Business Logic Layer**
   - API endpoints and controllers
   - Service layer (business rules)
   - Data validation and transformation
   - Integration with third-party services

3. **Data Access Layer**
   - Database models and schemas
   - Query builders and ORMs
   - Data repositories
   - Caching strategies

4. **Infrastructure Layer**
   - Authentication and authorization
   - Logging and monitoring
   - Error handling
   - Background jobs and queues

## Database Schema Design
### Core Entities
**Users Table**
- id (UUID/Primary Key)
- email (Unique, indexed)
- password_hash
- created_at, updated_at
- Relationships: [One-to-many with other tables]

**[Entity 1] Table**
- Schema definition
- Indexes for performance
- Foreign key relationships

**[Entity 2] Table**
- Schema definition
- Indexes for performance
- Foreign key relationships

### Data Relationships
- One-to-many: [Description]
- Many-to-many: [Description with join table]
- One-to-one: [Description]

## API Design
### RESTful Endpoints
**Authentication**
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh

**Resources**
- GET /api/[resource] - List all
- GET /api/[resource]/:id - Get one
- POST /api/[resource] - Create
- PUT /api/[resource]/:id - Update
- DELETE /api/[resource]/:id - Delete

### API Response Format
\`\`\`json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
\`\`\`

## Security Implementation
### Authentication
- Password requirements: [Minimum length, complexity]
- Password hashing: [bcrypt, argon2]
- Session management: [JWT, cookies]
- Two-factor authentication: [Optional, required for admin]

### Authorization
- Role-based access control (RBAC)
- Resource-level permissions
- API rate limiting
- CORS configuration

### Data Protection
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection
- CSRF tokens
- Encrypted sensitive data at rest

## Performance Optimization
### Caching Strategy
- Browser caching: [Static assets]
- CDN caching: [Global distribution]
- Application caching: [Frequently accessed data]
- Database query caching: [Expensive queries]

### Database Optimization
- Proper indexing strategy
- Query optimization
- Connection pooling
- Read replicas for scaling reads

### Frontend Optimization
- Code splitting and lazy loading
- Image optimization (WebP, lazy loading)
- Tree shaking and minification
- Service workers for offline capability

## Monitoring & Observability
### Application Monitoring
- Error tracking: [Sentry, Rollbar]
- Performance monitoring: [New Relic, DataDog]
- Uptime monitoring: [Pingdom, UptimeRobot]
- User analytics: [Google Analytics, PostHog]

### Logging Strategy
- Structured logging format
- Log levels (DEBUG, INFO, WARN, ERROR)
- Centralized log aggregation
- Log retention policy

## Deployment Strategy
### CI/CD Pipeline
1. **Development**
   - Local development environment
   - Feature branch workflow
   - Automated testing on commit

2. **Staging**
   - Automatic deployment from main branch
   - Integration testing
   - QA and user acceptance testing

3. **Production**
   - Tagged release deployment
   - Blue-green or canary deployment
   - Automatic rollback on failures

### Environment Configuration
- Development: [Local, Docker Compose]
- Staging: [Cloud environment matching production]
- Production: [Scalable cloud infrastructure]

## Scalability Plan
### Horizontal Scaling
- Load balancer configuration
- Stateless application design
- Session storage in Redis
- Database read replicas

### Vertical Scaling
- Server resource monitoring
- Upgrade thresholds
- Performance benchmarks

### Database Scaling
- Sharding strategy (if needed)
- Partitioning large tables
- Archive old data
- NoSQL for specific use cases

## Backup & Disaster Recovery
### Backup Strategy
- Database: [Daily automated backups, 30-day retention]
- File storage: [Versioning, replication]
- Configuration: [Version controlled]

### Recovery Procedures
- Recovery time objective (RTO): [Target]
- Recovery point objective (RPO): [Target]
- Disaster recovery plan documentation
- Regular recovery drills

## Development Workflow
### Code Standards
- Linting: [ESLint, Prettier]
- Type safety: [TypeScript strict mode]
- Code review requirements
- Documentation standards

### Testing Strategy
- Unit tests: [Jest, Vitest]
- Integration tests: [Supertest, Playwright]
- E2E tests: [Cypress, Playwright]
- Performance tests: [k6, Artillery]
- Test coverage target: [80%+]`,
    topicCategory: "Web/App Dev",
    category: "Software Architecture"
  },
  {
    name: "AI Agent Workflow Builder",
    whatItIs: "Framework for designing and implementing AI-powered automation agents",
    whatItsFor: "Creating intelligent automation systems that handle complex workflows",
    desiredOutcome: "Autonomous AI agents that execute multi-step workflows efficiently",
    template: `# AI Agent Workflow Blueprint

## Agent Overview
### Agent Identity
- Agent name: [Descriptive name]
- Primary purpose: [Main objective]
- Scope: [What the agent does and doesn't do]
- Autonomy level: [Fully autonomous, semi-autonomous, supervised]

### Agent Capabilities
- Natural language understanding
- Task planning and execution
- Tool usage and integration
- Memory and context retention
- Error handling and recovery

## Workflow Architecture
### Input Processing
**Trigger Types**
- User request: [Chat, form, API call]
- Scheduled: [Cron job, time-based]
- Event-driven: [Webhook, database change]
- Conditional: [Business rule triggered]

**Input Validation**
- Required parameters: [List and format]
- Optional parameters: [Defaults]
- Error handling: [Invalid input responses]

### Task Planning
**Goal Decomposition**
1. Parse user intent
2. Break down into subtasks
3. Identify required tools/APIs
4. Create execution plan
5. Validate plan feasibility

**Decision Logic**
- IF/THEN conditions
- Priority rules
- Fallback options
- Human escalation criteria

### Execution Flow
**Step 1: [Task Name]**
- Action: [What the agent does]
- Tools used: [APIs, databases, services]
- Success criteria: [How to verify completion]
- Error handling: [What to do if it fails]
- Next step: [Conditional or sequential]

**Step 2: [Task Name]**
- [Same structure as Step 1]

**Step 3: [Task Name]**
- [Same structure as Step 1]

### Memory Management
**Short-term Memory**
- Current conversation context
- Temporary variables
- Intermediate results
- Session data

**Long-term Memory**
- User preferences
- Historical interactions
- Learned patterns
- Knowledge base

## Tool Integration
### Available Tools
**Tool 1: [Name]**
- Purpose: [What it does]
- API endpoint: [URL or service]
- Authentication: [Method]
- Rate limits: [Constraints]
- Example usage: [Sample call]

**Tool 2: [Name]**
- [Same structure]

**Tool 3: [Name]**
- [Same structure]

### Tool Selection Logic
- Match tool to task requirements
- Consider cost and latency
- Handle tool unavailability
- Parallel vs sequential execution

## AI Model Configuration
### LLM Selection
**Primary Model**
- Model: [GPT-5, Claude, Gemini]
- Purpose: [Complex reasoning, planning]
- Context window: [Token limit]
- Temperature: [0.0-1.0 for creativity]

**Secondary Model**
- Model: [GPT-5-mini, fast model]
- Purpose: [Simple tasks, classification]
- Cost optimization: [When to use]

### Prompt Engineering
**System Prompt**
\`\`\`
You are an AI agent specialized in [domain].
Your responsibilities include:
1. [Responsibility 1]
2. [Responsibility 2]
3. [Responsibility 3]

Guidelines:
- Always verify information before acting
- Ask for clarification when uncertain
- Provide explanations for your actions
- Escalate to humans when appropriate
\`\`\`

**Task-Specific Prompts**
- [Task 1 prompt template]
- [Task 2 prompt template]
- [Task 3 prompt template]

## Error Handling & Recovery
### Error Types
**System Errors**
- API failures: [Retry with exponential backoff]
- Timeout: [Increase timeout or split task]
- Rate limits: [Queue and retry later]

**Logical Errors**
- Unclear input: [Ask clarifying questions]
- Impossible task: [Explain limitations]
- Conflicting instructions: [Seek resolution]

### Recovery Strategies
1. Retry failed steps (up to 3 times)
2. Use alternative tools/approaches
3. Request human intervention
4. Gracefully fail with explanation

## Safety & Guardrails
### Content Safety
- Filter harmful content
- Detect and reject malicious requests
- Protect sensitive information
- Comply with regulations

### Operational Safety
- Spending limits per action
- Require confirmation for critical actions
- Human-in-the-loop for high-risk tasks
- Audit trail of all actions

## Performance Monitoring
### Key Metrics
- Task completion rate: [Target: 95%+]
- Average completion time: [Target: X seconds]
- Error rate: [Target: <5%]
- User satisfaction: [Feedback scores]
- Cost per task: [Budget constraint]

### Optimization Opportunities
- Identify bottlenecks
- Improve prompt efficiency
- Cache common results
- Optimize tool selection

## Testing & Validation
### Test Scenarios
**Happy Path**
- Standard use case
- Expected inputs
- Successful completion

**Edge Cases**
- Unusual inputs
- Extreme values
- Boundary conditions

**Error Scenarios**
- Invalid inputs
- Tool failures
- Timeout situations

### Validation Checklist
- [ ] Agent completes intended task
- [ ] Handles errors gracefully
- [ ] Provides clear explanations
- [ ] Respects safety guardrails
- [ ] Stays within budget
- [ ] Meets performance targets

## Implementation Guide
### Development Setup
1. Choose agent framework: [LangChain, AutoGPT, CrewAI]
2. Set up development environment
3. Configure API keys and credentials
4. Implement core workflow logic
5. Add tool integrations
6. Build testing suite

### Deployment
1. Environment variables: [Secrets management]
2. Hosting: [Serverless, containers, VMs]
3. Monitoring: [Logging and alerts]
4. Rate limiting: [Protect against abuse]
5. Documentation: [User guide and API docs]

## Continuous Improvement
### Feedback Loop
- Collect user feedback
- Analyze failure cases
- Track performance metrics
- Update prompts and logic
- Expand capabilities based on demand

### Version Control
- Document changes
- A/B test improvements
- Maintain backwards compatibility
- Gradual rollout of updates`,
    topicCategory: "Workflow/AI Agents",
    category: "AI Automation"
  },
  {
    name: "Marketing Automation Hub",
    whatItIs: "Central framework for orchestrating all marketing automation workflows",
    whatItsFor: "Businesses looking to create seamless, integrated marketing automation",
    desiredOutcome: "Unified marketing automation that drives leads through the entire customer journey",
    template: `# Marketing Automation Hub Blueprint

## Hub Overview
### Business Context
- Company name: [Your company]
- Industry: [Your industry]
- Target audience: [Primary customer profile]
- Marketing goals: [Revenue, leads, brand awareness]

### Automation Scope
- Lead generation
- Lead nurturing
- Customer onboarding
- Retention and upselling
- Re-engagement campaigns

## Platform Architecture
### Core Systems
**Marketing Automation Platform**
- Primary tool: [HubSpot, Marketo, ActiveCampaign]
- Purpose: [Email automation, lead scoring]
- Integration: [CRM sync, API connections]

**CRM System**
- Tool: [Salesforce, Pipedrive, Close]
- Purpose: [Sales pipeline management]
- Data flow: [Bi-directional sync with MA platform]

**Analytics & Attribution**
- Tool: [Google Analytics, Mixpanel, Amplitude]
- Purpose: [Track customer journey and ROI]
- Custom dashboards: [Key marketing metrics]

### Integration Map
\`\`\`
Website Forms → Marketing Automation → CRM
Social Media → Marketing Automation → CRM
Chatbot → Marketing Automation → CRM
Webinar Platform → Marketing Automation → Email Sequences
E-commerce → Marketing Automation → Customer Journey Workflows
\`\`\`

## Lead Generation Workflows
### Website Lead Capture
**Form Submission Flow**
1. Visitor fills form on website
2. Lead created in CRM with source attribution
3. Thank you email sent immediately
4. Lead assigned to appropriate sales rep based on criteria
5. Internal notification to sales team
6. Lead enters relevant nurture sequence

**Chatbot Qualification**
1. Visitor engages with website chatbot
2. Chatbot asks qualifying questions
3. High-intent leads immediately connected to sales
4. Other leads enter automated nurture sequence
5. Data synced to CRM with chat transcript

### Content Marketing
**Lead Magnet Workflow**
1. Visitor downloads ebook/guide/template
2. Lead created or updated in database
3. Delivery email with download link
4. Follow-up email series (5-7 emails over 2 weeks)
5. Content personalized based on download topic
6. Sales notification for high-value leads

## Lead Nurturing Workflows
### Segmentation Strategy
**By Lifecycle Stage**
- Subscriber: [Awareness content]
- Lead: [Consideration content]
- Marketing Qualified Lead (MQL): [Decision content]
- Sales Qualified Lead (SQL): [Sales enablement]
- Customer: [Onboarding and success]
- Evangelist: [Referral programs]

**By Behavior**
- Engagement level: [Active, moderate, cold]
- Content interests: [Topic-based segmentation]
- Product interest: [Which solution they explored]
- Industry/company size: [Vertical-specific messaging]

### Email Nurture Sequences
**General Nurture (10 emails over 8 weeks)**
- Email 1 (Day 0): Welcome and set expectations
- Email 2 (Day 3): Educational content - Problem awareness
- Email 3 (Day 7): Case study - Social proof
- Email 4 (Day 11): Product introduction - Solution awareness
- Email 5 (Day 15): Comparison guide - Competitive advantages
- Email 6 (Day 21): Customer testimonial - Build trust
- Email 7 (Day 28): Demo/trial invitation - Soft CTA
- Email 8 (Day 35): ROI calculator or assessment - Value demonstration
- Email 9 (Day 42): Limited-time offer - Create urgency
- Email 10 (Day 56): Direct sales outreach - Human touch

**Product-Specific Nurture**
- Triggered by: [Product page visit, feature interest]
- Duration: [5 emails over 3 weeks]
- Focus: [Specific product benefits and use cases]
- Conversion goal: [Demo request or trial signup]

## Lead Scoring Framework
### Demographic Scoring
- Job title (decision-maker): +20 points
- Company size (ideal range): +15 points
- Industry (target vertical): +10 points
- Geographic location (target region): +5 points

### Behavioral Scoring
- Email opens: +1 point
- Email clicks: +3 points
- Website visits: +2 points per visit
- Pricing page view: +10 points
- Case study download: +5 points
- Demo request: +50 points
- Free trial signup: +75 points

### Engagement Decay
- Inactive 30 days: -10 points
- Inactive 60 days: -20 points
- Inactive 90 days: -30 points
- Email unsubscribe: -100 points

### Threshold Actions
- 50+ points: Tag as Marketing Qualified Lead (MQL)
- 75+ points: Notify sales team
- 100+ points: Create task for immediate sales follow-up

## Customer Onboarding Automation
### New Customer Welcome
**Day 1: Welcome Email**
- Celebrate the decision
- Set expectations for onboarding
- Provide immediate resources
- Assign customer success manager

**Day 2-3: Getting Started Guide**
- Step-by-step setup instructions
- Video tutorials
- Knowledge base links
- Book onboarding call

**Week 1: Feature Highlights**
- Daily emails highlighting key features
- Use case examples
- Quick-win templates

**Week 2-4: Deeper Engagement**
- Advanced features education
- Integration guides
- Community invitations
- Feedback surveys

### Adoption Tracking
- Login frequency monitoring
- Feature usage tracking
- Milestone achievements
- Engagement scoring

## Retention & Expansion Workflows
### Usage-Based Triggers
**Low Usage Alert**
- Trigger: Less than 2 logins in 30 days
- Action: Re-engagement email sequence
- Offer: Personalized training or consultation

**Feature Adoption**
- Trigger: Using core features regularly
- Action: Introduce complementary features
- Goal: Increase product stickiness

**Upgrade Opportunities**
- Trigger: Approaching plan limits
- Action: Upgrade invitation with ROI case
- Offer: Limited-time upgrade incentive

### Customer Success Automation
**Health Score Monitoring**
- Calculate based on usage, support tickets, NPS
- Low health score: Proactive outreach
- High health score: Upsell and referral requests

**Renewal Management**
- 90 days before renewal: Value recap
- 60 days: Success story and ROI report
- 30 days: Renewal offer with incentive
- 7 days: Final reminder

## Re-engagement Campaigns
### Lapsed Lead Reactivation
**Trigger**: No engagement in 90+ days

**3-Email Sequence**
- Email 1: "We miss you" - Soft touch
- Email 2: New features/content - Value update
- Email 3: Last chance offer - Urgency

**Segmentation**
- Re-engaged: Back to appropriate nurture
- Still inactive: Remove from active campaigns

### Win-back Campaign (Churned Customers)
**Trigger**: Canceled subscription

**Immediate Actions**
- Exit survey to understand reason
- Offer to pause instead of cancel
- Provide special win-back offer

**Follow-up Sequence (3-6 months later)**
- Email about product improvements
- Case studies of successful customers
- Limited-time return offer

## Performance Tracking
### Key Metrics Dashboard
**Lead Generation**
- Lead volume by source
- Cost per lead by channel
- Lead quality (conversion rate to customer)

**Engagement**
- Email open rates: [Target: 25%+]
- Click-through rates: [Target: 3%+]
- Website engagement: [Page views, time on site]

**Conversion**
- MQL to SQL conversion: [Target: 30%+]
- SQL to customer conversion: [Target: 20%+]
- Marketing-influenced revenue

**Retention**
- Customer churn rate: [Target: <5%]
- Net revenue retention: [Target: 110%+]
- Customer lifetime value

### Optimization Process
**Weekly Reviews**
- Monitor workflow performance
- Identify drop-off points
- A/B test improvements

**Monthly Analysis**
- Comprehensive metric review
- Attribution modeling
- Budget reallocation based on ROI

**Quarterly Strategy**
- Workflow audits and updates
- New automation opportunities
- Technology stack evaluation

## Compliance & Best Practices
### Data Privacy
- GDPR compliance: [Consent tracking]
- CCPA compliance: [Opt-out mechanisms]
- Data retention policies
- Privacy policy updates

### Email Deliverability
- List hygiene: [Remove bounces, inactive]
- Authentication: [SPF, DKIM, DMARC]
- Engagement-based sending
- Avoid spam triggers

### Personalization Ethics
- Transparent data usage
- Value-driven messaging
- Respect preferences
- Easy opt-out options`,
    topicCategory: "Workflow/AI Agents",
    category: "Marketing Automation"
  },
  {
    name: "No-Code Automation Workflow",
    whatItIs: "Step-by-step framework for building automation without coding",
    whatItsFor: "Non-technical users creating powerful business automations",
    desiredOutcome: "Functional automations that save time and reduce manual work",
    template: `# No-Code Automation Workflow Blueprint

## Automation Planning
### Use Case Definition
- **What process needs automation?**
  [Describe the current manual process]

- **Why automate it?**
  - Time savings: [Hours saved per week]
  - Error reduction: [Fewer mistakes]
  - Consistency: [Standardized process]
  - Scalability: [Handle increased volume]

- **Success criteria:**
  - [Specific, measurable outcomes]
  - [Timeline for implementation]
  - [ROI expectations]

### Process Mapping
**Current State (Manual)**
1. [Step 1 of current process]
2. [Step 2 of current process]
3. [Step 3 of current process]
4. [etc.]

**Pain Points**
- [Bottleneck 1]
- [Error-prone step]
- [Time-consuming task]

**Future State (Automated)**
1. [Automated step 1]
2. [Automated step 2]
3. [Automated step 3]
4. [etc.]

## Platform Selection
### No-Code Tools Comparison
**Zapier**
- Best for: Simple integrations between apps
- Pros: Largest app library, easy to use
- Cons: Can get expensive, limited logic
- Pricing: [Current tier and limits]

**Make (formerly Integromat)**
- Best for: Complex workflows with logic
- Pros: Visual workflow builder, powerful
- Cons: Steeper learning curve
- Pricing: [Current tier and limits]

**n8n**
- Best for: Self-hosted, cost-effective at scale
- Pros: Full control, unlimited executions
- Cons: Requires technical setup
- Pricing: [Open-source or cloud]

### Platform Features Needed
- [ ] Triggers: [What starts the automation]
- [ ] Actions: [What the automation does]
- [ ] Integrations: [Apps that need to connect]
- [ ] Logic: [Conditional branching, filters]
- [ ] Data transformation: [Format changes]
- [ ] Error handling: [Retry, notifications]

## Workflow Design
### Trigger Setup
**Trigger Type**: [Schedule, Webhook, New Item, etc.]
- Platform: [Which app triggers the workflow]
- Trigger event: [Specific action that starts it]
- Trigger frequency: [How often it checks]
- Filter conditions: [Only trigger when...]

### Data Flow
**Step 1: Trigger Event**
- App: [Source application]
- Event: [What happens]
- Data captured: [Fields/variables available]

**Step 2: Data Transformation**
- Parse/extract: [Get specific data points]
- Format: [Change date format, capitalize, etc.]
- Validate: [Check if data meets requirements]

**Step 3: Conditional Logic**
\`\`\`
IF [condition 1]
  THEN [action A]
ELSE IF [condition 2]
  THEN [action B]
ELSE
  THEN [action C]
\`\`\`

**Step 4: Primary Action**
- App: [Destination application]
- Action: [What to do]
- Data mapping: [Source field → Destination field]

**Step 5: Follow-up Actions**
- Notifications: [Who to notify and how]
- Logging: [Record the automation ran]
- Secondary updates: [Update other systems]

### Error Handling
**Common Errors**
- Missing data: [How to handle]
- API failures: [Retry strategy]
- Invalid format: [Validation and fallback]

**Error Notifications**
- Email alert: [To whom]
- Slack message: [Channel]
- Log entry: [For troubleshooting]

## Integration Setup
### App Connections
**App 1: [Name]**
- Authentication method: [OAuth, API key, etc.]
- Permissions needed: [Read, write, admin]
- Rate limits: [Requests per hour/day]
- Setup instructions: [Step-by-step connection]

**App 2: [Name]**
- [Same structure as App 1]

**App 3: [Name]**
- [Same structure as App 1]

### Data Mapping
**Field Mapping Table**
| Source App | Source Field | → | Destination App | Destination Field | Transformation |
|------------|--------------|---|-----------------|-------------------|----------------|
| [App name] | [Field 1]    | → | [App name]      | [Field A]         | [None/Format]  |
| [App name] | [Field 2]    | → | [App name]      | [Field B]         | [None/Format]  |

## Testing & Deployment
### Test Scenarios
**Scenario 1: Happy Path**
- Input: [Normal, expected data]
- Expected outcome: [Successful automation]
- Verification: [Check destination system]

**Scenario 2: Edge Cases**
- Input: [Unusual but valid data]
- Expected outcome: [Handles gracefully]
- Verification: [Appropriate action taken]

**Scenario 3: Error Cases**
- Input: [Invalid or missing data]
- Expected outcome: [Error handling kicks in]
- Verification: [Notification sent, logged]

### Testing Checklist
- [ ] Test with sample data
- [ ] Verify all integrations work
- [ ] Check data accuracy in destination
- [ ] Test error handling
- [ ] Verify notifications work
- [ ] Check timing/scheduling
- [ ] Confirm no data loss

### Deployment
**Pre-Launch**
1. Document the workflow: [What it does]
2. Inform stakeholders: [Who needs to know]
3. Set up monitoring: [How to track]
4. Create rollback plan: [How to undo]

**Launch**
1. Enable automation: [Turn it on]
2. Monitor first runs: [Watch closely]
3. Gather feedback: [User experience]
4. Make adjustments: [Iterate and improve]

## Monitoring & Maintenance
### Success Metrics
- Execution count: [How many times it runs]
- Success rate: [Percentage that complete]
- Time saved: [Estimated hours per week]
- Errors: [Number and types]
- Cost: [Platform usage and pricing]

### Regular Maintenance
**Daily**
- Check for failed executions
- Review error notifications
- Quick fixes for common issues

**Weekly**
- Review execution logs
- Analyze success rate trends
- Optimize slow steps

**Monthly**
- Performance review
- Cost analysis
- Feature updates and improvements
- Documentation updates

### Troubleshooting Guide
**Automation not triggering?**
- Check trigger setup and conditions
- Verify source app connection
- Confirm trigger is enabled
- Review automation logs

**Data not appearing correctly?**
- Check field mapping
- Verify data transformation logic
- Test with sample data
- Review API changes in integrated apps

**Automation timing out?**
- Reduce data processing volume
- Split into multiple workflows
- Optimize API calls
- Increase timeout settings

## Scaling & Optimization
### Performance Optimization
- Batch processing: [Process multiple items at once]
- Caching: [Store frequently used data]
- Scheduling: [Run during off-peak hours]
- Parallel execution: [Run steps simultaneously]

### Cost Optimization
- Monitor task usage
- Consolidate similar automations
- Use filters early to reduce executions
- Choose right pricing tier

### Expansion Opportunities
- Identify related processes to automate
- Add more complex logic as needed
- Integrate additional apps
- Create automation templates for reuse

## Best Practices
### Design Principles
- Keep it simple: [Start small, add complexity later]
- Document everything: [Comments, descriptions]
- Test thoroughly: [Before going live]
- Plan for errors: [Always have fallbacks]

### Security
- Use secure authentication methods
- Minimize data exposure
- Encrypt sensitive data
- Regular access reviews
- Follow data protection regulations

### Collaboration
- Share automation documentation
- Train team on how it works
- Establish ownership
- Create feedback channels
- Version control for major changes`,
    topicCategory: "Workflow/AI Agents",
    category: "Automation"
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
    topicCategory: "Web/App Dev",
    category: "Growth Strategy"
  },
  {
    name: "User Experience Optimization",
    whatItIs: "Systematic approach to improving user experience for increased conversions and retention",
    whatItsFor: "Digital products looking to improve user satisfaction and business metrics",
    desiredOutcome: "Higher user engagement, improved conversion rates, and reduced churn",
    approach: "Conduct user research, identify friction points in user journey, implement A/B testing framework, make data-driven improvements, and continuously monitor and optimize based on user behavior and feedback",
    topicCategory: "Web/App Dev",
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
    case 'Web/App Dev': return Globe;
    case 'Workflow/AI Agents': return Zap;
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
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  // Show all content if user has any paid subscription (Starter, Pro, or Growth)
  const showAllContent = subscription?.subscribed && subscription.subscription_tier !== null;

  const UpgradeSection = ({ message }: { message: string }) => (
    <div className="glass rounded-2xl border border-white/10 p-6 text-center mt-6 shadow-modern">
      <Lock className="h-6 w-6 text-primary mb-3 mx-auto" />
      <p className="text-base font-medium mb-2">{message}</p>
      <p className="text-sm text-muted-foreground mb-4">Upgrade to any our paid subscription plan to unlock all premium resources</p>
      <Button 
        onClick={() => {
          if (!isAuthenticated) {
            window.location.href = '/auth?next=' + encodeURIComponent(window.location.pathname);
          } else {
            window.location.href = '/pricing';
          }
        }}
        size="sm"
        className="text-xs"
      >
        {!isAuthenticated ? 'Login to Subscribe' : 'Upgrade'}
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
      
      if (type === 'blueprint' && 'template' in item) {
        setSelectedBlueprint(item as Blueprint);
        setIsBlueprintModalOpen(true);
      } else if (type === 'tool' && 'url' in item) {
        window.open((item as Tool).url, '_blank');
      }
      // Prompt cards are view-only (no modal needed)
    };

    const getCardIcon = () => {
      switch (type) {
        case 'tool': return <Zap className="h-5 w-5 text-primary" />;
        case 'prompt': return <FileText className="h-5 w-5 text-primary" />;
        case 'workflow': return <GitBranch className="h-5 w-5 text-primary" />;
        case 'blueprint': return <Layers className="h-5 w-5 text-primary" />;
        case 'strategy': return <Target className="h-5 w-5 text-primary" />;
        default: return <Star className="h-5 w-5 text-primary" />;
      }
    };

    const getGradientClass = () => {
      return 'from-primary/5 via-background to-primary/10 border-primary/10 dark:border-primary/20 shadow-lg shadow-primary/5';
    };

    return (
      <Card 
        className={`glass rounded-xl border-white/10 group relative overflow-hidden h-full cursor-pointer shadow-modern hover:shadow-modern-lg transition-all duration-300 hover:scale-[1.02] ${isBlurred ? 'filter blur-[2px] pointer-events-none opacity-60' : ''}`}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {getCardIcon()}
              <CardTitle className="text-base font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {item.name}
              </CardTitle>
            </div>
            <Badge variant="secondary" className="shrink-0 bg-primary/10 text-primary border-primary/20 text-xs">
              {item.category}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pb-6">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm text-primary/80 mb-1.5 flex items-center gap-1">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                What it is
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{item.whatItIs}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-primary/80 mb-1.5 flex items-center gap-1">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                What it's for
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{item.whatItsFor}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-primary/80 mb-1.5 flex items-center gap-1">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                Desired outcome
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{item.desiredOutcome}</p>
            </div>
          </div>

          {type === 'tool' && 'url' in item && (
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  window.open((item as Tool).url, '_blank');
                }}
                className="group/btn hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              >
                <ExternalLink className="h-3 w-3 mr-1.5 group-hover/btn:rotate-12 transition-transform" />
                Visit Tool
              </Button>
              <div className="text-xs text-muted-foreground">Click to explore</div>
            </div>
          )}

          {type === 'prompt' && 'prompt' in item && (
            <div className="pt-3 border-t border-border/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm text-primary/80">Template Preview</h4>
                <div className="text-xs text-muted-foreground">Click for full prompt</div>
              </div>
              <div className="bg-muted/30 border border-primary/20 rounded-lg p-3">
                <p className="text-xs text-foreground/80 font-mono line-clamp-3 leading-relaxed font-medium">
                  {(item as PromptTemplate).prompt}
                </p>
              </div>
            </div>
          )}

          {(type === 'workflow' || type === 'blueprint' || type === 'strategy') && (
            <div className="pt-3 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {type === 'workflow' && 'Click to view workflow steps'}
                  {type === 'blueprint' && 'Click to view template'}
                  {type === 'strategy' && 'Click to view strategy details'}
                </div>
                <div className="text-primary/60">
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
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
      
      <div className="min-h-screen scroll-snap-container bg-gradient-to-br from-background/95 via-background to-primary/5 dark:bg-gradient-to-br dark:from-black dark:via-gray-950/90 dark:to-gray-900/60 relative overflow-hidden">
        {/* Premium floating background elements with liquid glass effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Main gradient orbs with enhanced blur and liquid animation */}
          <div className="absolute -top-40 -right-40 w-[28rem] h-[28rem] bg-gradient-to-br from-primary/25 via-primary/15 to-primary/5 rounded-full blur-3xl animate-pulse opacity-60"></div>
          <div className="absolute -bottom-40 -left-40 w-[32rem] h-[32rem] bg-gradient-to-tr from-secondary/20 via-accent/10 to-secondary/5 rounded-full blur-3xl animate-pulse opacity-50" style={{animationDelay: '2s'}}></div>
          
          {/* Liquid glass floating elements */}
          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-gradient-conic from-primary/15 via-accent/10 to-secondary/15 rounded-full blur-2xl animate-pulse opacity-40" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-radial from-accent/20 via-primary/10 to-transparent rounded-full blur-xl animate-pulse opacity-30" style={{animationDelay: '3s'}}></div>
          
          {/* Subtle mesh gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/3 to-transparent opacity-40"></div>
        </div>
        
      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-12">
          {/* Header - Mobile Optimized */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-20 animate-fade-in-up px-2">
            <div className="space-y-4 sm:space-y-6">
              <div className="relative mb-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-bold mb-2 bg-gradient-to-r from-foreground via-primary/90 to-foreground bg-clip-text text-transparent leading-tight tracking-tight">
                  AI Resources
                </h1>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full"></div>
              </div>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground/90 mb-6 sm:mb-8 lg:mb-12 max-w-4xl mx-auto leading-relaxed font-light">
                Your complete toolkit for AI-powered productivity. Discover curated tools, proven prompts, and strategic frameworks across all creative and business domains.
              </p>
            </div>
          </div>

          {/* Resource type tabs - Mobile Optimized */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap justify-center w-full mb-4 sm:mb-6 glass border-white/10 shadow-modern h-auto p-1.5 sm:p-2 gap-1.5 sm:gap-2">
              <TabsTrigger value="tools" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 flex-shrink-0">
                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Tools</span>
              </TabsTrigger>
              <TabsTrigger value="prompts" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 flex-shrink-0">
                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Prompts</span>
              </TabsTrigger>
              <TabsTrigger value="workflows" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 flex-shrink-0">
                <GitBranch className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Workflows</span>
              </TabsTrigger>
              <TabsTrigger value="blueprints" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 flex-shrink-0">
                <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Blueprints</span>
              </TabsTrigger>
              <TabsTrigger value="strategies" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 flex-shrink-0">
                <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Strategies</span>
              </TabsTrigger>
            </TabsList>

            {/* Second row: Topic category tabs (shown after first selection) */}
            <div className="mb-6">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Choose a topic category for {activeTab}:
                </p>
              </div>
              
              <Tabs value={activeTopicTab} onValueChange={setActiveTopicTab as (value: string) => void} className="w-full">
                <TabsList className="flex flex-wrap justify-center w-full glass border-white/10 shadow-modern h-auto p-1 gap-1">
                  <TabsTrigger value="Text" className="flex items-center gap-2 text-sm flex-shrink-0">
                    <Type className="h-3 w-3" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="Image" className="flex items-center gap-2 text-sm flex-shrink-0">
                    <Image className="h-3 w-3" />
                    Image
                  </TabsTrigger>
                  <TabsTrigger value="Video" className="flex items-center gap-2 text-sm flex-shrink-0">
                    <Video className="h-3 w-3" />
                    Video
                  </TabsTrigger>
                  <TabsTrigger value="Audio" className="flex items-center gap-2 text-sm flex-shrink-0">
                    <Headphones className="h-3 w-3" />
                    Audio
                  </TabsTrigger>
                  <TabsTrigger value="Web/App Dev" className="flex items-center gap-2 text-sm flex-shrink-0">
                    <Globe className="h-3 w-3" />
                    Web/App Dev
                  </TabsTrigger>
                  <TabsTrigger value="Workflow/AI Agents" className="flex items-center gap-2 text-sm flex-shrink-0">
                    <Zap className="h-3 w-3" />
                    Workflow/AI Agents
                  </TabsTrigger>
                </TabsList>

                {/* Content based on selected resource type and topic */}
                <div className="mt-8">
                  {activeTab === 'tools' && (
                    <TabsContent value={activeTopicTab} className="mt-0">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          {(() => {
                            const IconComponent = getTopicIcon(activeTopicTab);
                            return <IconComponent className="h-6 w-6 text-primary" />;
                          })()}
                          <h2 className="text-2xl font-semibold">{activeTopicTab} Tools</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filterByTopicCategory(tools, activeTopicTab).map((tool, index) => (
                            <ResourceCard 
                              key={index} 
                              item={tool} 
                              type="tool"
                            />
                          ))}
                        </div>
                        
                        {filterByTopicCategory(tools, activeTopicTab).length === 0 && (
                          <div className="text-center py-12">
                            <p className="text-muted-foreground">No {activeTopicTab.toLowerCase()} tools available yet. Check back soon!</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  )}

                  {activeTab === 'prompts' && (
                    <TabsContent value={activeTopicTab} className="mt-0">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          {(() => {
                            const IconComponent = getTopicIcon(activeTopicTab);
                            return <IconComponent className="h-6 w-6 text-primary" />;
                          })()}
                          <h2 className="text-2xl font-semibold">{activeTopicTab} Prompts</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filterByTopicCategory(promptTemplates, activeTopicTab).slice(0, showAllContent ? undefined : 6).map((prompt, index) => (
                            <ResourceCard 
                              key={index} 
                              item={prompt} 
                              type="prompt"
                              isBlurred={!showAllContent && index >= 4}
                            />
                          ))}
                        </div>
                        
                        {filterByTopicCategory(promptTemplates, activeTopicTab).length === 0 && (
                          <div className="text-center py-12">
                            <p className="text-muted-foreground">No {activeTopicTab.toLowerCase()} prompts available yet. Check back soon!</p>
                          </div>
                        )}
                        
                        {!showAllContent && filterByTopicCategory(promptTemplates, activeTopicTab).length > 4 && (
                          <UpgradeSection message={`Unlock all ${activeTopicTab} prompts`} />
                        )}
                      </div>
                    </TabsContent>
                  )}

                  {activeTab === 'workflows' && (
                    <TabsContent value={activeTopicTab} className="mt-0">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          {(() => {
                            const IconComponent = getTopicIcon(activeTopicTab);
                            return <IconComponent className="h-6 w-6 text-primary" />;
                          })()}
                          <h2 className="text-2xl font-semibold">{activeTopicTab} Workflows</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filterByTopicCategory(workflows, activeTopicTab).slice(0, showAllContent ? undefined : 4).map((workflow, index) => (
                            <ResourceCard 
                              key={index} 
                              item={workflow} 
                              type="workflow"
                              isBlurred={!showAllContent && index >= 2}
                            />
                          ))}
                        </div>
                        
                        {filterByTopicCategory(workflows, activeTopicTab).length === 0 && (
                          <div className="text-center py-12">
                            <p className="text-muted-foreground">No {activeTopicTab.toLowerCase()} workflows available yet. Check back soon!</p>
                          </div>
                        )}
                        
                        {!showAllContent && filterByTopicCategory(workflows, activeTopicTab).length > 2 && (
                          <UpgradeSection message={`Unlock all ${activeTopicTab} workflows`} />
                        )}
                      </div>
                    </TabsContent>
                  )}

                  {activeTab === 'blueprints' && (
                    <TabsContent value={activeTopicTab} className="mt-0">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          {(() => {
                            const IconComponent = getTopicIcon(activeTopicTab);
                            return <IconComponent className="h-6 w-6 text-primary" />;
                          })()}
                          <h2 className="text-2xl font-semibold">{activeTopicTab} Blueprints</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filterByTopicCategory(blueprints, activeTopicTab).slice(0, showAllContent ? undefined : 4).map((blueprint, index) => (
                            <ResourceCard 
                              key={index} 
                              item={blueprint} 
                              type="blueprint"
                              isBlurred={!showAllContent && index >= 2}
                            />
                          ))}
                        </div>
                        
                        {filterByTopicCategory(blueprints, activeTopicTab).length === 0 && (
                          <div className="text-center py-12">
                            <p className="text-muted-foreground">No {activeTopicTab.toLowerCase()} blueprints available yet. Check back soon!</p>
                          </div>
                        )}
                        
                        {!showAllContent && filterByTopicCategory(blueprints, activeTopicTab).length > 2 && (
                          <UpgradeSection message={`Unlock all ${activeTopicTab} blueprints`} />
                        )}
                      </div>
                    </TabsContent>
                  )}

                  {activeTab === 'strategies' && (
                    <TabsContent value={activeTopicTab} className="mt-0">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          {(() => {
                            const IconComponent = getTopicIcon(activeTopicTab);
                            return <IconComponent className="h-6 w-6 text-primary" />;
                          })()}
                          <h2 className="text-2xl font-semibold">{activeTopicTab} Strategies</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filterByTopicCategory(strategies, activeTopicTab).slice(0, showAllContent ? undefined : 4).map((strategy, index) => (
                            <ResourceCard 
                              key={index} 
                              item={strategy} 
                              type="strategy"
                              isBlurred={!showAllContent && index >= 2}
                            />
                          ))}
                        </div>
                        
                        {filterByTopicCategory(strategies, activeTopicTab).length === 0 && (
                          <div className="text-center py-12">
                            <p className="text-muted-foreground">No {activeTopicTab.toLowerCase()} strategies available yet. Check back soon!</p>
                          </div>
                        )}
                        
                        {!showAllContent && filterByTopicCategory(strategies, activeTopicTab).length > 2 && (
                          <UpgradeSection message={`Unlock all ${activeTopicTab} strategies`} />
                        )}
                      </div>
                    </TabsContent>
                  )}
                </div>
              </Tabs>
            </div>
          </Tabs>
        </div>
      </main>
      </div>

      <Footer />

      {/* Modals */}
      <ResourceBlueprintModal
        blueprint={selectedBlueprint}
        isOpen={isBlueprintModalOpen}
        onClose={() => {
          setIsBlueprintModalOpen(false);
          setSelectedBlueprint(null);
        }}
      />
    </>
  );
}