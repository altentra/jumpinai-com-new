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

// Data model
type Tool = {
  name: string;
  url: string;
  description: string;
  promptExample: string;
  workflowSteps: string[];
};

type Category = {
  id: string;
  title: string;
  tools: Tool[];
};

const categories: Category[] = [
  {
    id: "text",
    title: "AI Text Generation",
    tools: [
      {
        name: "OpenAI ChatGPT (GPT-5)",
        url: "https://openai.com/",
        description: "General-purpose assistant for writing, reasoning, and multimodal tasks.",
        promptExample:
          "Act as a senior product marketer. Create a 500‑word launch brief for a B2B SaaS feature. Include: 1) narrative, 2) ICP pain, 3) 3 key benefits, 4) messaging pillars, 5) CTA. Tone: confident, concise.",
        workflowSteps: [
          "Define role, audience, constraints, and deliverable length.",
          "Ask for a structured outline first; iterate on sections.",
          "Request variations and finalize with style and brand guardrails.",
        ],
      },
      {
        name: "Anthropic Claude",
        url: "https://claude.ai/",
        description: "Strong writing and analysis with long context and reliable reasoning.",
        promptExample:
          "You are an operations analyst. Summarize this policy PDF into an SOP with steps, owners, and SLAs. Flag ambiguities and propose fixes.",
        workflowSteps: [
          "Upload/reference source docs; ask for structured SOP.",
          "Iterate to add owners/SLAs; request ambiguity list.",
          "Export final SOP with version and change log.",
        ],
      },
      {
        name: "Google Gemini 2.5 Pro",
        url: "https://gemini.google.com/",
        description: "Long‑context multimodal model integrated with Google ecosystem.",
        promptExample:
          "As a data storyteller, explain these metrics (paste table) to an executive in 5 bullets. Add a final risk/opportunity section.",
        workflowSteps: [
          "Provide table/context; request bullet executive summary.",
          "Probe on anomalies; ask for 3 hypotheses with tests.",
          "Finalize with risks, opportunities, and next steps.",
        ],
      },
      {
        name: "xAI Grok 4",
        url: "https://x.ai/",
        description: "Fast, up‑to‑date reasoning with strong web awareness; Grok 4 Imagine excels at image tasks.",
        promptExample:
          "Act as a trend analyst. Using fresh web sources, outline the 5 biggest AI regulation changes in 2025 with citations and implications for SaaS founders.",
        workflowSteps: [
          "Ask for current, cited sources; set timeframe.",
          "Request a pros/cons table and action checklist.",
          "Deliver an executive brief plus 3 tweet‑length summaries.",
        ],
      },
      {
        name: "Perplexity",
        url: "https://www.perplexity.ai/",
        description: "Answer engine combining live search with model reasoning and citations.",
        promptExample:
          "Research brief: What are the top 5 trends in AI video generation in 2025? Provide citations, dates, and consensus vs. debate.",
        workflowSteps: [
          "Ask for a scoped brief with citations and dates.",
          "Request a consensus/debate table and key sources.",
          "Export to doc and validate key claims from links.",
        ],
      },
      {
        name: "Cohere Command R+",
        url: "https://cohere.com/",
        description: "Enterprise‑grade text with RAG and safety controls for teams.",
        promptExample:
          "Given this policy corpus (RAG), answer employee questions in 6th‑grade reading level and cite sources by filename and section.",
        workflowSteps: [
          "Connect knowledge base; define retrieval format.",
          "Constrain reading level and citation format.",
          "Test edge cases; add refusal/deflection rules.",
        ],
      },
      {
        name: "Writer",
        url: "https://writer.com/",
        description: "Brand‑safe AI with governance and style guides across teams.",
        promptExample:
          "Rewrite this email to match our brand voice (confident, concise, friendly). Keep to 120 words and include CTA to demo.",
        workflowSteps: [
          "Import brand guidelines and examples.",
          "Calibrate with few‑shot samples; lock style checks.",
          "Deploy templates and measure reply rates.",
        ],
      },
      {
        name: "Notion AI",
        url: "https://www.notion.so/product/ai",
        description: "AI inside your docs and wiki for summarizing, drafting, and cleanup.",
        promptExample:
          "Clean up these meeting notes into action items by owner and due date. Add a one‑paragraph recap for stakeholders.",
        workflowSteps: [
          "Paste raw notes; ask for action list by owner/date.",
          "Request concise recap; auto‑link to related pages.",
          "Share and @mention owners for accountability.",
        ],
      },
      {
        name: "Meta Llama",
        url: "https://ai.meta.com/llama/",
        description: "Open-weight family for local and hosted use; great for customized assistants.",
        promptExample:
          "As a customer support copilot, draft empathetic replies using the following knowledge base (paste). Keep under 120 words and include links.",
        workflowSteps: [
          "Select Llama family suited to constraints (context, size).",
          "Add RAG with policies/FAQ; few-shot to set tone.",
          "Evaluate on real tickets; refine prompts and guardrails.",
        ],
      },
      {
        name: "Mistral Large",
        url: "https://mistral.ai/",
        description: "Efficient, high-quality reasoning; solid for multilingual and tooling.",
        promptExample:
          "Translate this technical blog to French with accurate terminology and keep markdown structure intact.",
        workflowSteps: [
          "Provide glossary and tone examples.",
          "Constrain output to preserve code blocks and links.",
          "QA with bilingual reviewer and run lints.",
        ],
      },
    ],
  },
  {
    id: "image",
    title: "AI Image Generation",
    tools: [
      {
        name: "Midjourney",
        url: "https://www.midjourney.com/",
        description: "High‑fidelity, stylized image generation with strong aesthetics.",
        promptExample:
          "ultra‑detailed product hero shot, matte black earbuds on reflective slate, soft rim lighting, 85mm lens, f1.8, 16:9, studio grade",
        workflowSteps: [
          "Set subject, camera, lens, lighting, and aspect ratio.",
          "Iterate on seeds and composition; upscale best.",
          "Add brand colors; export in required ratios.",
        ],
      },
      {
        name: "Adobe Firefly",
        url: "https://www.adobe.com/sensei/generative-ai/firefly.html",
        description: "Integrated with Photoshop/Illustrator for editable, brand‑safe imagery.",
        promptExample:
          "Extend canvas and generate realistic background matching the original photo's perspective and lighting.",
        workflowSteps: [
          "Open in Photoshop; use Generative Expand with prompt.",
          "Mask/product isolate; generate alt backgrounds.",
          "Export layered PSD for marketing variants.",
        ],
      },
      {
        name: "Grok 4 Imagine",
        url: "https://x.ai/",
        description: "Image generation by xAI with strong composition and text rendering.",
        promptExample:
          "brand key visual: geometric shapes forming a letter 'A', crisp vector style, accurate text 'ALPHA', high contrast, 3:2",
        workflowSteps: [
          "Define layout constraints and typography.",
          "Generate alternates; refine text rendering.",
          "Export SVG/PNG with color tokens.",
        ],
      },
      {
        name: "Ideogram",
        url: "https://ideogram.ai/",
        description: "Text‑accurate logo/poster designs and typography inside images.",
        promptExample:
          "minimal tech conference poster with accurate text: 'AI NEXT 2025' in neo‑grotesk, grid layout, high contrast, CMYK",
        workflowSteps: [
          "Define layout, font family, color constraints.",
          "Generate multiple typographic compositions.",
          "Export vector‑friendly output for print.",
        ],
      },
      {
        name: "Stable Diffusion 3",
        url: "https://stability.ai/",
        description: "Latest open family for high‑quality, controllable image pipelines (local or cloud).",
        promptExample:
          "photoreal architectural exterior, golden hour, 24mm, soft shadows, PBR detail, 4k, --ar 16:9",
        workflowSteps: [
          "Select SD3 base/refiner models and control‑nets as needed.",
          "Use image‑to‑image for consistent angles.",
          "Batch render and sort via metadata.",
        ],
      },
      {
        name: "Leonardo AI",
        url: "https://leonardo.ai/",
        description: "Production toolkit with fine‑tuning and asset pipelines.",
        promptExample:
          "isometric app illustrations, vibrant gradients, clean vector shapes, product walkthrough scenes, 1:1",
        workflowSteps: [
          "Choose style; fine‑tune on brand assets.",
          "Generate packs; enforce color palettes.",
          "Export SVG/PNG sets to design system.",
        ],
      },
      {
        name: "Playground AI",
        url: "https://playgroundai.com/",
        description: "Fast web UI for SDXL with inpainting/outpainting.",
        promptExample:
          "fashion editorial portrait, soft diffused light, kodak portra 400 look, shallow depth of field, 3:4",
        workflowSteps: [
          "Prompt with camera/film specs; generate set.",
          "Use inpaint to fix hands/eyes; upscale best.",
          "Export with color‑safe profile.",
        ],
      },
      {
        name: "OpenAI DALL·E",
        url: "https://openai.com/dall-e-3",
        description: "Natural language to detailed, coherent images with strong compositing.",
        promptExample:
          "flat lay of startup desk, warm natural light, macbook, notebook, coffee, brand palette accents, 16:9",
        workflowSteps: [
          "Describe scene ingredients and lighting.",
          "Iterate on composition and color accents.",
          "Select best and resize for channels.",
        ],
      },
      {
        name: "Canva Magic Media",
        url: "https://www.canva.com/magic-media/",
        description: "Beginner‑friendly generation inside Canva with templates.",
        promptExample:
          "generate a clean LinkedIn banner with geometric shapes in brand colors, subtle gradient, space for headline",
        workflowSteps: [
          "Pick template; generate base artwork.",
          "Adjust layout/brand colors; add text.",
          "Export to platform‑specific sizes.",
        ],
      },
      {
        name: "Google Imagen 3",
        url: "https://cloud.google.com/vertex-ai/generative-ai/docs/image/overview",
        description: "Photoreal and design‑grade image generation available via Vertex AI.",
        promptExample:
          "lifestyle product photo of stainless steel water bottle on granite countertop, soft window light, 3:2, brand color accents",
        workflowSteps: [
          "Define product, lighting, and aspect ratio.",
          "Generate variations; select most on‑brand.",
          "Upscale and export with color‑safe profile.",
        ],
      },
    ],
  },
  {
    id: "video",
    title: "AI Video Generation",
    tools: [
      {
        name: "Runway Gen-2",
        url: "https://runwayml.com/gen-2",
        description: "Text-to-video generation with editing and inpainting capabilities.",
        promptExample:
          "Create a 10-second video of a futuristic cityscape at sunset with flying cars and neon lights.",
        workflowSteps: [
          "Input detailed text prompt describing the scene.",
          "Generate initial video clip.",
          "Use inpainting to refine specific frames or objects.",
          "Export final video in desired format.",
        ],
      },
      {
        name: "Synthesia",
        url: "https://www.synthesia.io/",
        description: "AI video creation platform with customizable avatars and voiceovers.",
        promptExample:
          "Create a product demo video with a professional avatar explaining features in English.",
        workflowSteps: [
          "Select avatar and language.",
          "Input script or text.",
          "Customize background and branding.",
          "Generate and review video.",
        ],
      },
      {
        name: "Pictory",
        url: "https://pictory.ai/",
        description: "Automatically create short branded videos from long content.",
        promptExample:
          "Summarize a 10-minute webinar into a 2-minute highlight video with captions.",
        workflowSteps: [
          "Upload long-form video or text.",
          "Select key highlights or auto-generate.",
          "Customize captions and branding.",
          "Export short video clips.",
        ],
      },
    ],
  },
  {
    id: "music",
    title: "AI Music Generation",
    tools: [
      {
        name: "AIVA",
        url: "https://www.aiva.ai/",
        description: "AI composer for creating soundtracks and music pieces.",
        promptExample:
          "Compose a calm, piano-based soundtrack for a meditation app lasting 3 minutes.",
        workflowSteps: [
          "Select music style and instruments.",
          "Input mood and length.",
          "Generate composition.",
          "Edit and export audio file.",
        ],
      },
      {
        name: "Amper Music",
        url: "https://www.ampermusic.com/",
        description: "Create custom music tracks with AI for videos and podcasts.",
        promptExample:
          "Generate an upbeat background track for a tech product launch video.",
        workflowSteps: [
          "Choose genre and mood.",
          "Set tempo and length.",
          "Generate and preview tracks.",
          "Download final version.",
        ],
      },
      {
        name: "Soundraw",
        url: "https://soundraw.io/",
        description: "AI music generator with customization options.",
        promptExample:
          "Create a suspenseful soundtrack with rising tension for a thriller scene.",
        workflowSteps: [
          "Select scene type and mood.",
          "Customize instruments and structure.",
          "Generate music.",
          "Edit and export.",
        ],
      },
    ],
  },
];

export default function Resources() {
  const { user, isAuthenticated } = useAuth();
  const showAllContent = false; // For now, show only first 4 items to everyone

  // Flatten all tools from all categories
  const allTools = categories.flatMap(category =>
    category.tools.map(tool => ({ ...tool, category: category.title }))
  );

  // Component for premium overlay
  const PremiumOverlay = () => (
    <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
      <Lock className="h-8 w-8 text-muted-foreground mb-3" />
      <p className="text-sm text-muted-foreground text-center mb-4 px-4">
        Access all workflows and blueprints
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

  // Component for blurred tool card
  const BlurredToolCard = ({ tool }: { tool: Tool & { category: string } }) => (
    <div className="relative">
      <Card className="h-full filter blur-[2px] pointer-events-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{tool.name}</CardTitle>
            <Badge variant="secondary">{tool.category}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{tool.description}</p>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold mb-2">Example Prompt:</h4>
              <p className="text-sm bg-muted p-3 rounded italic">
                {tool.promptExample}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Workflow Steps:</h4>
              <ol className="text-sm space-y-1">
                {tool.workflowSteps.map((step, index) => (
                  <li key={index} className="flex">
                    <span className="font-medium mr-2">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
      <PremiumOverlay />
    </div>
  );

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>AI Resources - Workflows & Blueprints | Jumpin AI</title>
          <meta 
            name="description" 
            content="Access our comprehensive collection of AI workflows and blueprints for text generation, image creation, video production, and more. Professional prompts and step-by-step guides for AI tools."
          />
          <meta name="keywords" content="AI workflows, AI blueprints, prompts, ChatGPT, Midjourney, AI tools, automation" />
          <link rel="canonical" href="https://www.jumpinai.com/resources" />
        </Helmet>
        
        <Navigation />
        
        <main className="container mx-auto px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                AI Workflows & Blueprints
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Master AI tools with our comprehensive collection of proven workflows, 
                expert prompts, and step-by-step blueprints for every creative and business need.
              </p>
            </div>

            <Tabs defaultValue="workflows" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="workflows">AI Workflows</TabsTrigger>
                <TabsTrigger value="blueprints">AI Blueprints</TabsTrigger>
              </TabsList>
              
              <TabsContent value="workflows" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold mb-3">
                    Step-by-Step AI Workflows
                  </h2>
                  <p className="text-muted-foreground">
                    Complete workflows with prompts and processes for specific outcomes
                  </p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {allTools.map((tool, index) => {
                    const isVisible = showAllContent || index < 4;
                    
                    if (isVisible) {
                      return (
                        <Card key={`${tool.name}-${index}`} className="h-full">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{tool.name}</CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{tool.category}</Badge>
                                <Button variant="outline" size="sm" asChild>
                                  <a 
                                    href={tool.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    Visit
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground mb-4">{tool.description}</p>
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-semibold mb-2">Example Prompt:</h4>
                                <p className="text-sm bg-muted p-3 rounded italic">
                                  {tool.promptExample}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Workflow Steps:</h4>
                                <ol className="text-sm space-y-1">
                                  {tool.workflowSteps.map((step, stepIndex) => (
                                    <li key={stepIndex} className="flex">
                                      <span className="font-medium mr-2">{stepIndex + 1}.</span>
                                      <span>{step}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    } else {
                      return <BlurredToolCard key={`${tool.name}-${index}`} tool={tool} />;
                    }
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="blueprints" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold mb-3">
                    Ready-to-Use AI Blueprints
                  </h2>
                  <p className="text-muted-foreground">
                    Copy-paste templates and frameworks for immediate results
                  </p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {allTools.map((tool, index) => {
                    const isVisible = showAllContent || index < 4;
                    
                    if (isVisible) {
                      return (
                        <Card key={`${tool.name}-${index}`} className="h-full">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{tool.name}</CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{tool.category}</Badge>
                                <Button variant="outline" size="sm" asChild>
                                  <a 
                                    href={tool.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    Visit
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground mb-4">{tool.description}</p>
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-semibold mb-2">Blueprint Template:</h4>
                                <p className="text-sm bg-muted p-3 rounded font-mono">
                                  {tool.promptExample}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Implementation:</h4>
                                <ol className="text-sm space-y-1">
                                  {tool.workflowSteps.map((step, stepIndex) => (
                                    <li key={stepIndex} className="flex">
                                      <span className="font-medium mr-2">{stepIndex + 1}.</span>
                                      <span>{step}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    } else {
                      return <BlurredToolCard key={`${tool.name}-${index}`} tool={tool} />;
                    }
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <Footer />
      </div>
    </HelmetProvider>
  );
}
