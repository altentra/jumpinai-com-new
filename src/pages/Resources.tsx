import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import React from "react";

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
];

export default function Resources() {
  const { user, isAuthenticated } = useAuth();
  const showAllContent = false; // For now, show premium content only to subscribed users

  // Component for premium overlay
  const PremiumOverlay = () => (
    <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
      <Lock className="h-8 w-8 text-muted-foreground mb-3" />
      <p className="text-sm text-muted-foreground text-center mb-4 px-4">
        Upgrade to Pro to gain access
      </p>
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

  // Prompt Card Component (always visible)
  const PromptCard = ({ prompt }: { prompt: PromptTemplate }) => (
    <Card className="h-full">
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
    <div className="relative">
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
      {isBlurred && <PremiumOverlay />}
    </div>
  );

  // Blueprint Card Component (first 4 visible, rest blurred)
  const BlueprintCard = ({ blueprint, isBlurred }: { blueprint: Blueprint; isBlurred: boolean }) => (
    <div className="relative">
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
      {isBlurred && <PremiumOverlay />}
    </div>
  );

  // Strategy Card Component (first 4 visible, rest blurred)
  const StrategyCard = ({ strategy, isBlurred }: { strategy: Strategy; isBlurred: boolean }) => (
    <div className="relative">
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
      {isBlurred && <PremiumOverlay />}
    </div>
  );

  return (
    <HelmetProvider>
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

          <Tabs defaultValue="tools" className="w-full">
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
                {promptTemplates.map((prompt, index) => (
                  <PromptCard key={index} prompt={prompt} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="workflows" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">AI Workflows</h2>
                <p className="text-muted-foreground">Step-by-step processes for consistent AI results</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workflows.map((workflow, index) => (
                  <WorkflowCard 
                    key={index} 
                    workflow={workflow} 
                    isBlurred={!showAllContent && index >= 4}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="blueprints" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">AI Blueprints</h2>
                <p className="text-muted-foreground">Proven templates and frameworks for AI implementation</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blueprints.map((blueprint, index) => (
                  <BlueprintCard 
                    key={index} 
                    blueprint={blueprint} 
                    isBlurred={!showAllContent && index >= 4}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="strategies" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">AI Strategies</h2>
                <p className="text-muted-foreground">Strategic approaches to AI adoption and implementation</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {strategies.map((strategy, index) => (
                  <StrategyCard 
                    key={index} 
                    strategy={strategy} 
                    isBlurred={!showAllContent && index >= 4}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>

        <Footer />
      </div>
    </HelmetProvider>
  );
}