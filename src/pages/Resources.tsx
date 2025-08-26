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
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

// Data models
type Tool = {
  name: string;
  url: string;
  description: string;
  category: string;
};

type PromptTemplate = {
  name: string;
  description: string;
  prompt: string;
  category: string;
};

type Workflow = {
  name: string;
  description: string;
  steps: string[];
  category: string;
};

type Blueprint = {
  name: string;
  description: string;
  template: string;
  category: string;
};

type Strategy = {
  name: string;
  description: string;
  approach: string;
  category: string;
};

// Tools data
const tools: Tool[] = [
  { name: "OpenAI ChatGPT (GPT-5)", url: "https://openai.com/", description: "General-purpose assistant for writing, reasoning, and multimodal tasks.", category: "Text Generation" },
  { name: "Anthropic Claude", url: "https://claude.ai/", description: "Strong writing and analysis with long context and reliable reasoning.", category: "Text Generation" },
  { name: "Google Gemini 2.5 Pro", url: "https://gemini.google.com/", description: "Long‑context multimodal model integrated with Google ecosystem.", category: "Text Generation" },
  { name: "xAI Grok 4", url: "https://x.ai/", description: "Fast, up‑to‑date reasoning with strong web awareness.", category: "Text Generation" },
  { name: "Perplexity", url: "https://www.perplexity.ai/", description: "Answer engine combining live search with model reasoning and citations.", category: "Research" },
  { name: "Midjourney", url: "https://www.midjourney.com/", description: "High‑fidelity, stylized image generation with strong aesthetics.", category: "Image Generation" },
  { name: "Adobe Firefly", url: "https://www.adobe.com/sensei/generative-ai/firefly.html", description: "Integrated with Photoshop/Illustrator for editable, brand‑safe imagery.", category: "Image Generation" },
  { name: "Runway Gen-2", url: "https://runwayml.com/gen-2", description: "Text-to-video generation with editing and inpainting capabilities.", category: "Video Generation" },
  { name: "Synthesia", url: "https://www.synthesia.io/", description: "AI video creation platform with customizable avatars and voiceovers.", category: "Video Generation" },
  { name: "AIVA", url: "https://www.aiva.ai/", description: "AI composer for creating soundtracks and music pieces.", category: "Music Generation" },
];

// Prompts data
const promptTemplates: PromptTemplate[] = [
  { name: "Product Marketing Brief", description: "Create comprehensive product launch briefs", prompt: "Act as a senior product marketer. Create a 500‑word launch brief for a B2B SaaS feature. Include: 1) narrative, 2) ICP pain, 3) 3 key benefits, 4) messaging pillars, 5) CTA. Tone: confident, concise.", category: "Marketing" },
  { name: "Policy Analysis", description: "Analyze and summarize policy documents", prompt: "You are an operations analyst. Summarize this policy PDF into an SOP with steps, owners, and SLAs. Flag ambiguities and propose fixes.", category: "Analysis" },
  { name: "Executive Summary", description: "Create executive summaries from data", prompt: "As a data storyteller, explain these metrics (paste table) to an executive in 5 bullets. Add a final risk/opportunity section.", category: "Business Intelligence" },
  { name: "Trend Analysis", description: "Analyze current trends with citations", prompt: "Act as a trend analyst. Using fresh web sources, outline the 5 biggest AI regulation changes in 2025 with citations and implications for SaaS founders.", category: "Research" },
  { name: "Brand Voice Rewrite", description: "Rewrite content to match brand voice", prompt: "Rewrite this email to match our brand voice (confident, concise, friendly). Keep to 120 words and include CTA to demo.", category: "Content Creation" },
  { name: "Meeting Notes Cleanup", description: "Transform meeting notes into actionable items", prompt: "Clean up these meeting notes into action items by owner and due date. Add a one‑paragraph recap for stakeholders.", category: "Productivity" },
  
  // PRO CONTENT - Professional Templates
  { name: "Strategic Planning Framework", description: "Comprehensive business strategy development", prompt: "Act as a McKinsey consultant. Develop a 3-year strategic plan for [COMPANY]. Include: 1) Market analysis, 2) Competitive positioning, 3) Growth opportunities, 4) Resource allocation strategy, 5) KPIs and milestones, 6) Risk mitigation. Format as executive presentation.", category: "Strategy" },
  { name: "Investment Pitch Deck", description: "Professional investor presentation", prompt: "Create a Series A pitch deck for [STARTUP]. Structure: Problem (market pain), Solution (unique value prop), Market (TAM/SAM), Traction (metrics/proof), Business Model (revenue streams), Competition (differentiation), Team (expertise), Financials (projections), Ask (funding/use). Keep slides concise, data-driven.", category: "Fundraising" },
  { name: "Customer Success Playbook", description: "Retention and expansion strategies", prompt: "Design a customer success framework for B2B SaaS. Include: 1) Onboarding workflow, 2) Health score metrics, 3) Expansion triggers, 4) Churn prevention tactics, 5) Success milestones, 6) Escalation protocols. Focus on revenue retention and growth.", category: "Customer Success" },
  { name: "Competitive Intelligence Report", description: "Deep market and competitor analysis", prompt: "Analyze [COMPETITOR] as a strategic intelligence expert. Cover: 1) Business model breakdown, 2) Pricing strategy, 3) Product positioning, 4) Marketing channels, 5) Strengths/weaknesses, 6) Strategic recommendations. Use public data sources.", category: "Intelligence" },
  { name: "Financial Model Builder", description: "Comprehensive business financial planning", prompt: "Build a 5-year financial model for [BUSINESS TYPE]. Include: Revenue projections (multiple streams), Cost structure (fixed/variable), Cash flow analysis, Break-even analysis, Scenario planning (best/base/worst), Key ratios, Funding requirements. Make it investor-ready.", category: "Finance" },
  { name: "Legal Document Analyzer", description: "Contract and agreement review", prompt: "Review this [CONTRACT TYPE] as a corporate lawyer. Identify: 1) Key terms and obligations, 2) Risk factors, 3) Negotiation points, 4) Compliance requirements, 5) Red flags, 6) Recommended changes. Provide business-friendly summary.", category: "Legal" },
  { name: "HR Policy Framework", description: "Employee handbook and policies", prompt: "Create comprehensive HR policies for [COMPANY SIZE] company. Include: Employee handbook, Performance review process, Compensation framework, Remote work policy, DEI initiatives, Compliance requirements. Ensure legal compliance and cultural alignment.", category: "Human Resources" },
  { name: "Crisis Communication Plan", description: "Strategic communications during crises", prompt: "Develop crisis communication strategy for [SITUATION]. Include: Stakeholder mapping, Message frameworks, Communication channels, Timeline/escalation, Media response templates, Internal communications, Recovery plan. Tone: transparent, accountable, action-oriented.", category: "Communications" },
  { name: "Product Roadmap Strategy", description: "Strategic product development planning", prompt: "Create 18-month product roadmap for [PRODUCT]. Include: User research insights, Feature prioritization matrix, Technical debt allocation, Resource requirements, Success metrics, Go-to-market alignment, Competitive considerations. Use RICE or similar framework.", category: "Product Management" },
  { name: "Sales Enablement Kit", description: "Complete sales team resources", prompt: "Build sales enablement package for [PRODUCT/SERVICE]. Include: 1) Battlecards (competitors), 2) Objection handling scripts, 3) Discovery questions, 4) Demo flow, 5) Proposal templates, 6) ROI calculators, 7) Case studies framework. Focus on conversion optimization.", category: "Sales" },
  { name: "Data Strategy Blueprint", description: "Enterprise data management and analytics", prompt: "Design data strategy for [ORGANIZATION]. Cover: Data architecture, Governance framework, Analytics capabilities, Privacy compliance, Technology stack, Team structure, ROI measurement, Implementation roadmap. Focus on business value creation.", category: "Data Strategy" },
  { name: "Change Management Plan", description: "Organizational transformation guidance", prompt: "Create change management strategy for [TRANSFORMATION]. Include: Stakeholder analysis, Communication plan, Training programs, Resistance mitigation, Success metrics, Timeline/milestones, Support structures. Use Kotter's 8-step model.", category: "Change Management" },
  { name: "Partnership Strategy", description: "Strategic alliance and partnership development", prompt: "Develop partnership strategy for [BUSINESS GOAL]. Include: Partner identification criteria, Value proposition mapping, Partnership models, Legal framework, Performance metrics, Risk assessment, Activation plan. Focus on mutual value creation.", category: "Partnerships" },
  { name: "Operational Excellence Framework", description: "Process optimization and efficiency", prompt: "Design operational excellence program for [DEPARTMENT/FUNCTION]. Include: Process mapping, Efficiency metrics, Automation opportunities, Quality standards, Performance dashboards, Continuous improvement protocols. Apply lean/six sigma principles.", category: "Operations" },
  { name: "Innovation Lab Setup", description: "Innovation program and culture development", prompt: "Establish innovation program for [ORGANIZATION]. Include: Innovation framework, Idea management process, Resource allocation, Success metrics, Cultural elements, External partnerships, Portfolio management, Scaling mechanisms.", category: "Innovation" },
];

// Workflows data
const workflows: Workflow[] = [
  { name: "Content Creation Workflow", description: "Systematic approach to creating high-quality content", steps: ["Define role, audience, constraints, and deliverable length.", "Ask for a structured outline first; iterate on sections.", "Request variations and finalize with style and brand guardrails."], category: "Content" },
  { name: "Document Analysis Workflow", description: "Process for analyzing and summarizing documents", steps: ["Upload/reference source docs; ask for structured SOP.", "Iterate to add owners/SLAs; request ambiguity list.", "Export final SOP with version and change log."], category: "Analysis" },
  { name: "Executive Reporting Workflow", description: "Create executive-ready reports from data", steps: ["Provide table/context; request bullet executive summary.", "Probe on anomalies; ask for 3 hypotheses with tests.", "Finalize with risks, opportunities, and next steps."], category: "Business Intelligence" },
  { name: "Research Workflow", description: "Comprehensive research with citations", steps: ["Ask for current, cited sources; set timeframe.", "Request a pros/cons table and action checklist.", "Deliver an executive brief plus 3 tweet‑length summaries."], category: "Research" },
  { name: "Brand Management Workflow", description: "Maintain consistent brand voice across content", steps: ["Import brand guidelines and examples.", "Calibrate with few‑shot samples; lock style checks.", "Deploy templates and measure reply rates."], category: "Branding" },
  { name: "Meeting Management Workflow", description: "Transform meetings into actionable outcomes", steps: ["Paste raw notes; ask for action list by owner/date.", "Request concise recap; auto‑link to related pages.", "Share and @mention owners for accountability."], category: "Productivity" },
];

// Blueprints data
const blueprints: Blueprint[] = [
  { name: "Product Launch Blueprint", description: "Complete template for product launches", template: "# Product Launch Brief\n## Narrative\n[Product story and positioning]\n## ICP Pain Points\n[Target customer problems]\n## Key Benefits\n1. [Benefit 1]\n2. [Benefit 2]\n3. [Benefit 3]\n## Messaging Pillars\n[Core messages]\n## Call-to-Action\n[Clear next steps]", category: "Marketing" },
  { name: "SOP Template", description: "Standard Operating Procedure template", template: "# Standard Operating Procedure\n## Purpose\n[Why this SOP exists]\n## Scope\n[What this covers]\n## Responsibilities\n[Who does what]\n## Procedure\n[Step-by-step process]\n## Quality Controls\n[Checks and balances]", category: "Operations" },
  { name: "Executive Dashboard Blueprint", description: "Template for executive reporting", template: "# Executive Dashboard\n## Key Metrics\n[Primary KPIs]\n## Performance Summary\n[5 bullet points]\n## Risks & Opportunities\n[Assessment]\n## Recommendations\n[Action items]\n## Next Steps\n[Timeline and owners]", category: "Business Intelligence" },
  { name: "Brand Voice Guide", description: "Template for maintaining brand consistency", template: "# Brand Voice Guide\n## Voice Characteristics\n[Personality traits]\n## Tone Guidelines\n[Situational tones]\n## Do's and Don'ts\n[Examples]\n## Templates\n[Reusable formats]\n## Quality Checks\n[Verification process]", category: "Branding" },
  { name: "Research Brief Template", description: "Structured approach to research projects", template: "# Research Brief\n## Objective\n[What we want to learn]\n## Scope\n[Boundaries and timeframe]\n## Sources\n[Where to look]\n## Deliverables\n[Expected outputs]\n## Success Criteria\n[How to measure quality]", category: "Research" },
  { name: "Meeting Action Template", description: "Transform meetings into results", template: "# Meeting Action Items\n## Meeting Summary\n[One paragraph recap]\n## Action Items\n[Owner | Task | Due Date]\n## Decisions Made\n[Key outcomes]\n## Next Meeting\n[Agenda preview]\n## Stakeholder Communication\n[Who to update]", category: "Productivity" },
];

// Strategies data
const strategies: Strategy[] = [
  { name: "AI-First Content Strategy", description: "Leverage AI throughout the content lifecycle", approach: "Integrate AI tools at every stage: ideation with GPT-4, creation with specialized tools, optimization with analytics AI, and distribution with automation platforms.", category: "Content Marketing" },
  { name: "Multimodal AI Strategy", description: "Combine text, image, and video AI tools", approach: "Create cohesive campaigns using text AI for copy, image AI for visuals, and video AI for dynamic content, ensuring consistent brand voice across all modalities.", category: "Brand Strategy" },
  { name: "AI-Powered Research Strategy", description: "Systematic approach to AI-enhanced research", approach: "Use AI for data collection, analysis, and synthesis. Combine multiple AI sources for comprehensive insights, always verify with human expertise.", category: "Research Strategy" },
  { name: "Automation-First Operations", description: "Streamline operations with AI automation", approach: "Identify repetitive tasks, implement AI solutions for automation, maintain human oversight for quality control, and continuously optimize processes.", category: "Operations Strategy" },
  { name: "AI Governance Strategy", description: "Responsible AI implementation framework", approach: "Establish clear AI usage guidelines, implement security measures, train teams on best practices, and regularly audit AI outputs for quality and compliance.", category: "Governance" },
  { name: "Performance Marketing with AI", description: "Data-driven marketing optimization", approach: "Use AI for audience analysis, content personalization, campaign optimization, and performance prediction. Combine multiple AI insights for better ROI.", category: "Marketing Strategy" },
  
  // PRO CONTENT - Professional Strategies
  { name: "Digital Transformation Strategy", description: "Comprehensive organizational digital evolution", approach: "Assess current digital maturity, define target state architecture, prioritize transformation initiatives based on business impact, implement agile transformation with continuous measurement and optimization. Focus on customer experience, operational efficiency, and competitive advantage.", category: "Digital Strategy" },
  { name: "Market Expansion Strategy", description: "Strategic geographic and demographic growth", approach: "Conduct thorough market analysis including cultural, regulatory, and competitive factors. Develop localization strategy for products, marketing, and operations. Establish partnerships and distribution channels. Implement phased expansion with performance monitoring and local adaptation.", category: "Growth Strategy" },
  { name: "Customer-Centric Transformation", description: "Organization-wide customer experience optimization", approach: "Map comprehensive customer journey across all touchpoints. Redesign processes and systems around customer needs. Implement customer feedback loops and real-time personalization. Train organization on customer-first mindset with incentive alignment.", category: "Customer Experience" },
  { name: "Innovation Ecosystem Strategy", description: "Building sustainable innovation capabilities", approach: "Create innovation framework combining internal R&D, external partnerships, and acquisition strategy. Establish innovation labs, accelerator programs, and venture partnerships. Implement idea management systems with clear evaluation and scaling processes.", category: "Innovation Strategy" },
  { name: "Sustainability & ESG Strategy", description: "Environmental, social, and governance excellence", approach: "Conduct ESG assessment and materiality analysis. Set science-based targets for environmental impact. Develop social impact programs and governance frameworks. Integrate ESG metrics into business operations and stakeholder reporting.", category: "ESG Strategy" },
  { name: "Data-Driven Culture Strategy", description: "Organization-wide analytics and insights adoption", approach: "Establish data governance and quality frameworks. Implement self-service analytics platforms and democratize data access. Develop data literacy programs across all functions. Create data-driven decision-making processes with clear success metrics.", category: "Data Strategy" },
  { name: "Agile Organization Strategy", description: "Organizational agility and responsiveness enhancement", approach: "Transform organizational structure to cross-functional teams. Implement agile methodologies across business functions. Develop rapid decision-making processes and feedback loops. Create continuous learning and adaptation culture with performance metrics.", category: "Organizational Strategy" },
  { name: "Platform Business Strategy", description: "Multi-sided platform development and scaling", approach: "Design platform architecture with network effects consideration. Develop multi-sided value propositions and monetization models. Implement platform governance and ecosystem management. Scale through strategic partnerships and platform extensions.", category: "Platform Strategy" },
  { name: "Cybersecurity Strategy", description: "Comprehensive security posture and risk management", approach: "Conduct security risk assessment and gap analysis. Implement zero-trust security architecture with multi-layered protection. Develop incident response and business continuity plans. Create security awareness culture with regular training and simulations.", category: "Security Strategy" },
  { name: "Talent Strategy & Future of Work", description: "Workforce transformation and capability building", approach: "Assess future skill requirements and capability gaps. Develop comprehensive talent acquisition, development, and retention strategies. Implement flexible work models and performance management systems. Create continuous learning and career development programs.", category: "Talent Strategy" },
  { name: "Supply Chain Resilience Strategy", description: "End-to-end supply chain optimization and risk mitigation", approach: "Map supply chain dependencies and vulnerability points. Diversify supplier base and develop alternative sourcing strategies. Implement supply chain visibility and predictive analytics. Create risk management protocols and contingency plans.", category: "Supply Chain Strategy" },
  { name: "Customer Acquisition Strategy", description: "Systematic customer acquisition and growth optimization", approach: "Develop ideal customer profile and buyer personas with detailed segmentation. Create multi-channel acquisition funnel with content marketing, paid acquisition, and partnership channels. Implement customer acquisition cost optimization and lifetime value maximization strategies.", category: "Acquisition Strategy" },
  { name: "Pricing Strategy Optimization", description: "Value-based pricing and revenue optimization", approach: "Conduct price sensitivity analysis and competitive benchmarking. Develop value-based pricing models with segmentation strategies. Implement dynamic pricing and bundling optimization. Create pricing governance and regular optimization processes.", category: "Pricing Strategy" },
  { name: "Strategic Partnership Ecosystem", description: "Alliance and partnership strategy development", approach: "Map strategic partnership opportunities across the value chain. Develop partnership framework with clear value propositions and success metrics. Implement partner enablement and joint go-to-market strategies. Create ecosystem governance and performance management systems.", category: "Partnership Strategy" },
  { name: "Crisis Management & Business Continuity", description: "Organizational resilience and crisis response capability", approach: "Develop comprehensive risk assessment and scenario planning. Create crisis management protocols with clear escalation procedures. Implement business continuity plans with alternative operations models. Establish crisis communication and stakeholder management frameworks.", category: "Risk Management" },
];

export default function Resources() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("tools");
  const [subscriptionInfo, setSubscriptionInfo] = useState<{ subscribed: boolean; subscription_tier?: string }>({ subscribed: false });

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isAuthenticated) return;
      
      try {
        const { data } = await supabase.functions.invoke("check-subscription");
        if (data) {
          setSubscriptionInfo(data);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    checkSubscription();
  }, [isAuthenticated]);

  const showAllContent = subscriptionInfo.subscribed;

  // Universal upgrade section component
  const UpgradeSection = ({ message }: { message: string }) => (
    <div className="bg-muted/50 border border-border rounded-lg p-8 text-center mt-8">
      <Lock className="h-8 w-8 text-muted-foreground mb-3 mx-auto" />
      <p className="text-lg font-medium mb-2">{message}</p>
      <p className="text-muted-foreground mb-4">Upgrade to Pro to gain access to all premium content</p>
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

  // Tool Card Component (always visible)
  const ToolCard = ({ tool }: { tool: Tool }) => (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{tool.name}</CardTitle>
          <Badge variant="secondary">{tool.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{tool.description}</p>
        <Button asChild className="w-full">
          <a href={tool.url} target="_blank" rel="noopener noreferrer">
            Visit Tool <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );

  // Prompt Card Component (first 4 visible, rest blurred)
  const PromptCard = ({ prompt, isBlurred }: { prompt: PromptTemplate; isBlurred?: boolean }) => (
    <Card className={`h-full ${isBlurred ? 'filter blur-[2px] pointer-events-none' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{prompt.name}</CardTitle>
          <Badge variant="secondary">{prompt.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{prompt.description}</p>
        <div>
          <h4 className="font-semibold mb-2">Template:</h4>
          <p className="text-sm bg-muted p-3 rounded italic">
            {prompt.prompt}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // Workflow Card Component (first 4 visible, rest blurred)
  const WorkflowCard = ({ workflow, isBlurred }: { workflow: Workflow; isBlurred: boolean }) => (
    <Card className={`h-full ${isBlurred ? 'filter blur-[2px] pointer-events-none' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{workflow.name}</CardTitle>
          <Badge variant="secondary">{workflow.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{workflow.description}</p>
        <div>
          <h4 className="font-semibold mb-2">Steps:</h4>
          <ol className="text-sm space-y-1">
            {workflow.steps.map((step, index) => (
              <li key={index} className="flex">
                <span className="font-medium mr-2">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );

  // Blueprint Card Component (first 4 visible, rest blurred)
  const BlueprintCard = ({ blueprint, isBlurred }: { blueprint: Blueprint; isBlurred: boolean }) => (
    <Card className={`h-full ${isBlurred ? 'filter blur-[2px] pointer-events-none' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{blueprint.name}</CardTitle>
          <Badge variant="secondary">{blueprint.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{blueprint.description}</p>
        <div>
          <h4 className="font-semibold mb-2">Template:</h4>
          <pre className="text-xs bg-muted p-3 rounded overflow-auto whitespace-pre-wrap">
            {blueprint.template}
          </pre>
        </div>
      </CardContent>
    </Card>
  );

  // Strategy Card Component (first 4 visible, rest blurred)
  const StrategyCard = ({ strategy, isBlurred }: { strategy: Strategy; isBlurred: boolean }) => (
    <Card className={`h-full ${isBlurred ? 'filter blur-[2px] pointer-events-none' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{strategy.name}</CardTitle>
          <Badge variant="secondary">{strategy.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{strategy.description}</p>
        <div>
          <h4 className="font-semibold mb-2">Approach:</h4>
          <p className="text-sm bg-muted p-3 rounded">
            {strategy.approach}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Resources - Tools, Prompts & Workflows | Jumps in AI</title>
        <meta
          name="description"
          content="Discover the best AI tools, prompt templates, and workflows. Access curated resources for text generation, image creation, video production, and more."
        />
        <meta name="keywords" content="AI tools, prompts, workflows, ChatGPT, Midjourney, AI resources, artificial intelligence" />
        <link rel="canonical" href="https://jumpsinai.com/resources" />
      </Helmet>

      <Navigation />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">AI Resources</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the best AI tools, prompt templates, workflows, blueprints, and strategies to supercharge your productivity.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="blueprints">Blueprints</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
          </TabsList>

            <TabsContent value="tools" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">AI Tools</h2>
                <p className="text-muted-foreground">Curated collection of the best AI tools for every use case</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool, index) => (
                  <ToolCard key={index} tool={tool} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="prompts" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">Prompt Templates</h2>
                <p className="text-muted-foreground">Ready-to-use prompt templates for maximum AI effectiveness</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(showAllContent ? promptTemplates : promptTemplates.slice(0, 12)).map((prompt, index) => (
                  <PromptCard key={index} prompt={prompt} isBlurred={!showAllContent && index >= 10} />
                ))}
              </div>
              {!showAllContent && <UpgradeSection message="View more professional prompts" />}
            </TabsContent>

            <TabsContent value="workflows" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">AI Workflows</h2>
                <p className="text-muted-foreground">Step-by-step processes for consistent AI results</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(showAllContent ? workflows : workflows.slice(0, 6)).map((workflow, index) => (
                  <WorkflowCard 
                    key={index} 
                    workflow={workflow} 
                    isBlurred={!showAllContent && index >= 4}
                  />
                ))}
              </div>
              {!showAllContent && workflows.length > 4 && <UpgradeSection message="View more professional workflows" />}
            </TabsContent>

            <TabsContent value="blueprints" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">AI Blueprints</h2>
                <p className="text-muted-foreground">Proven templates and frameworks for AI implementation</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(showAllContent ? blueprints : blueprints.slice(0, 6)).map((blueprint, index) => (
                  <BlueprintCard 
                    key={index} 
                    blueprint={blueprint} 
                    isBlurred={!showAllContent && index >= 4}
                  />
                ))}
              </div>
              {!showAllContent && blueprints.length > 4 && <UpgradeSection message="View more professional blueprints" />}
            </TabsContent>

            <TabsContent value="strategies" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">AI Strategies</h2>
                <p className="text-muted-foreground">Strategic approaches to AI adoption and implementation</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(showAllContent ? strategies : strategies.slice(0, 6)).map((strategy, index) => (
                  <StrategyCard 
                    key={index} 
                    strategy={strategy} 
                    isBlurred={!showAllContent && index >= 4}
                  />
                ))}
              </div>
              {!showAllContent && strategies.length > 4 && <UpgradeSection message="View more professional strategies" />}
            </TabsContent>
          </Tabs>
        </main>

        <Footer />
      </div>
    );
}