import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
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
          "Extend canvas and generate realistic background matching the original photo’s perspective and lighting.",
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
          "brand key visual: geometric shapes forming a letter ‘A’, crisp vector style, accurate text ‘ALPHA’, high contrast, 3:2",
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
          "minimal tech conference poster with accurate text: ‘AI NEXT 2025’ in neo‑grotesk, grid layout, high contrast, CMYK",
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
        name: "Google Veo 3",
        url: "https://deepmind.google/technologies/veo/",
        description: "High‑fidelity text‑to‑video with cinematic control and long shots.",
        promptExample:
          "8‑second aerial glide over a futuristic city at dusk, volumetric light, 24fps, subtle camera tilt, cinematic film grain",
        workflowSteps: [
          "Write 1‑shot storyboard; set duration/fps.",
          "Generate alternates; pick most stable.",
          "Add sound design and color grade.",
        ],
      },
      {
        name: "Kling AI",
        url: "https://klingai.com/",
        description: "Photoreal motion and dynamic physics; strong for action shots.",
        promptExample:
          "slow‑motion splash of water over fresh berries, macro lens, shallow DOF, 5 seconds, natural lighting",
        workflowSteps: [
          "Specify motion style and pacing.",
          "Iterate on stabilization and realism.",
          "Finalize with SFX and subtle grade.",
        ],
      },
      {
        name: "Runway Gen‑3",
        url: "https://runwayml.com/",
        description: "Text‑to‑video and image‑to‑video with cinematic control.",
        promptExample:
          "cinematic drone reveal of coastal cliffs at sunrise, volumetric light, 6‑second shot, 24fps, anamorphic bokeh",
        workflowSteps: [
          "Write 1‑shot storyboard; set duration/fps.",
          "Generate alternates; pick most stable.",
          "Add sound design and color grade.",
        ],
      },
      {
        name: "Pika",
        url: "https://pika.art/",
        description: "Fast text‑to‑video and edits with stylization controls.",
        promptExample:
          "animated explainer of fintech app UI, clean motion graphics, white background, 5 seconds, smooth transitions",
        workflowSteps: [
          "Define scene style and pacing.",
          "Generate clips; trim and stitch.",
          "Overlay VO/captions; export 1080p.",
        ],
      },
      {
        name: "Luma Dream Machine",
        url: "https://lumalabs.ai/dream-machine",
        description: "Photoreal, dynamic camera motion from text or images.",
        promptExample:
          "macro shot of mechanical watch gears moving, shallow DOF, soft glints, studio lighting, 4 seconds",
        workflowSteps: [
          "Provide style reference; set shot length.",
          "Iterate on motion and depth cues.",
          "Stabilize and add subtle SFX.",
        ],
      },
      {
        name: "Synthesia",
        url: "https://www.synthesia.io/",
        description: "Avatar‑based studio videos for training and localization.",
        promptExample:
          "Create a 60‑sec onboarding explainer with a friendly avatar, English VO, captions, and brand background.",
        workflowSteps: [
          "Pick avatar/scenes; paste script.",
          "Add captions and localized variants.",
          "Render and distribute to LMS.",
        ],
      },
      {
        name: "HeyGen",
        url: "https://www.heygen.com/",
        description: "Realistic avatars, voice cloning, and face‑to‑video.",
        promptExample:
          "Turn this blog post into a 45‑sec avatar video with dynamic subtitles and CTA end card.",
        workflowSteps: [
          "Import article; summarize to script.",
          "Select avatar/voice; add subtitles.",
          "Export vertical and landscape.",
        ],
      },
      {
        name: "Descript",
        url: "https://www.descript.com/",
        description: "AI editing, overdub, and text‑based timeline for podcasts/videos.",
        promptExample:
          "Remove filler words, balance levels, and generate clean transcript with speaker labels.",
        workflowSteps: [
          "Transcribe; run filler removal/levels.",
          "Edit by text; add music beds.",
          "Export with burned‑in captions.",
        ],
      },
      {
        name: "OpenAI Sora",
        url: "https://openai.com/sora",
        description: "Advanced text‑to‑video for cinematic, coherent scenes from short prompts.",
        promptExample:
          "10‑second wide shot of a rainy neon street at night, reflections on wet pavement, slow dolly forward, 24fps, cinematic",
        workflowSteps: [
          "Write concise shot description with camera and motion.",
          "Generate 2–3 takes; pick most coherent composition.",
          "Color grade and add ambience in post.",
        ],
      },
      {
        name: "VEED AI",
        url: "https://www.veed.io/ai",
        description: "Web editor with AI cleanup, subtitles, and repurposing.",
        promptExample:
          "Turn webinar into a 60‑sec highlight with subtitles and logo watermark.",
        workflowSteps: [
          "Import recording; detect highlights.",
          "Auto‑subtitle and brand overlay.",
          "Export 1080p and square teaser.",
        ],
      },
    ],
  },
  {
    id: "audio",
    title: "AI Music & Sound",
    tools: [
      {
        name: "Suno",
        url: "https://suno.com/",
        description: "Text‑to‑music with vocals; diverse genres and radio‑ready output.",
        promptExample:
          "modern pop track, 120bpm, female vocal, uplifting chorus, clean mix, radio edit, 60 seconds",
        workflowSteps: [
          "Specify genre, bpm, vocal, and mood.",
          "Generate alt takes; pick best chorus.",
          "Mastering polish and fade‑outs.",
        ],
      },
      {
        name: "Udio",
        url: "https://www.udio.com/",
        description: "High‑quality song generation and structure control.",
        promptExample:
          "ambient electronic, 90bpm, evolving pads, no vocals, cinematic build, 45 seconds",
        workflowSteps: [
          "Define structure and instrumentation.",
          "Iterate on sections; extend variations.",
          "Export stems if available; mix down.",
        ],
      },
      {
        name: "AIVA",
        url: "https://www.aiva.ai/",
        description: "Classical/orchestral composition for film and games.",
        promptExample:
          "heroic orchestral theme, strings/brass, 100bpm, majestic, loopable 30s",
        workflowSteps: [
          "Pick style; set tempo and mood.",
          "Generate motif; adjust instrumentation.",
          "Export MIDI for DAW editing.",
        ],
      },
      {
        name: "Soundraw",
        url: "https://soundraw.io/",
        description: "Royalty‑free background music with structure control.",
        promptExample:
          "corporate background, light upbeat, 2 minutes, no vocals, simple melody",
        workflowSteps: [
          "Choose length/energy; generate tracks.",
          "Edit sections and transitions.",
          "Download with appropriate license.",
        ],
      },
      {
        name: "Beatoven.ai",
        url: "https://www.beatoven.ai/",
        description: "AI background music tailored to video moods and cuts.",
        promptExample:
          "tech explainer soundtrack, medium energy, 60 seconds, sparse instrumentation",
        workflowSteps: [
          "Import cut timing; align sections.",
          "Adjust mood per chapter; export WAV.",
          "Loudness normalize to -14 LUFS.",
        ],
      },
      {
        name: "Mubert",
        url: "https://mubert.com/",
        description: "Procedural music generation and API for apps.",
        promptExample:
          "deep focus playlist, lo‑fi chillhop, 90bpm, 30 minutes",
        workflowSteps: [
          "Define use case; pick genre and length.",
          "Generate stream/loop; check usage rights.",
          "Integrate via API if needed.",
        ],
      },
      {
        name: "ElevenLabs",
        url: "https://elevenlabs.io/",
        description: "Premium text‑to‑speech and voice cloning for narration.",
        promptExample:
          "Convert this script to an American female voice, warm and confident, with natural pacing and slight smile.",
        workflowSteps: [
          "Pick voice or clone; set speaking style.",
          "Generate takes; adjust pacing/energy.",
          "Export WAV; mix with background music.",
        ],
      },
      {
        name: "PlayHT",
        url: "https://play.ht/",
        description: "Realistic TTS and voice studio for multilingual content.",
        promptExample:
          "Narrate this tutorial in Spanish with a neutral Latin American accent, 1.0x speed, clear articulation.",
        workflowSteps: [
          "Choose language/voice; paste script.",
          "Tweak speed/pronunciation; QA sample.",
          "Batch render and organize files.",
        ],
      },
      {
        name: "Stable Audio",
        url: "https://stability.ai/audio",
        description: "Text‑to‑music and sound effects generation by Stability AI.",
        promptExample:
          "cinematic trailer hit, low brass and percussion, 5 seconds, high impact, no melody",
        workflowSteps: [
          "Specify length, style, and instrumentation.",
          "Generate alternates; pick the tightest transients.",
          "Export WAV; layer under VO for dynamics.",
        ],
      },
      {
        name: "Meta MusicGen",
        url: "https://ai.meta.com/research/musicgen/",
        description: "Open research model for controllable music generation and remixing.",
        promptExample:
          "chill lo‑fi beat at 85bpm, warm vinyl crackle, mellow Rhodes chords, 45 seconds, no vocals",
        workflowSteps: [
          "Provide tempo and style cues; set structure.",
          "Iterate motifs; export stems/MIDI for DAW.",
          "Mix and master to platform loudness.",
        ],
      },
    ],
  },
  {
    id: "apps",
    title: "AI Websites & Apps",
    tools: [
      {
        name: "Lovable",
        url: "https://lovable.dev/",
        description: "AI editor to build and ship full web apps with React, Tailwind, and Supabase—live preview and instant changes.",
        promptExample:
          "Create a responsive marketing site with hero, features, pricing, newsletter signup, and a resources page with tabs.",
        workflowSteps: [
          "Describe pages and components; generate skeleton.",
          "Refine UI with design tokens; wire forms and toasts.",
          "Publish and connect a custom domain.",
        ],
      },
      {
        name: "Framer AI",
        url: "https://www.framer.com/ai/",
        description: "Generate and edit responsive websites visually with AI.",
        promptExample:
          "Generate a SaaS landing page: hero, social proof, features grid (6), pricing (3 tiers), FAQ, footer. Tone: modern, credible.",
        workflowSteps: [
          "Describe sections and brand tone.",
          "Iterate layout; wire up nav and forms.",
          "Publish and connect analytics.",
        ],
      },
      {
        name: "Webflow AI",
        url: "https://webflow.com/ai",
        description: "AI‑assisted component generation and content editing.",
        promptExample:
          "Create a CMS‑driven blog layout with hero, categories, and 3‑column grid. Add pagination and search.",
        workflowSteps: [
          "Define CMS schema; generate layout.",
          "Bind data; add filters and search.",
          "Optimize SEO and publish.",
        ],
      },
      {
        name: "V0 by Vercel",
        url: "https://v0.dev/",
        description: "Generate React/Tailwind components from prompts or sketches.",
        promptExample:
          "Build a responsive pricing table with monthly/annual toggle, 3 tiers, highlighted ‘Pro’, and CTA buttons.",
        workflowSteps: [
          "Describe component spec; generate code.",
          "Refine variants and accessibility.",
          "Paste into repo and ship.",
        ],
      },
      {
        name: "Replit Agent",
        url: "https://replit.com/",
        description: "AI coding agent to create and refactor apps from natural language.",
        promptExample:
          "Create a Node + React app that fetches GitHub issues and displays charts. Include tests and README.",
        workflowSteps: [
          "Specify stack and requirements.",
          "Review diffs; run and fix tests.",
          "Deploy and monitor logs.",
        ],
      },
      {
        name: "Builder.io AI (Visual Copilot)",
        url: "https://www.builder.io/ai",
        description: "Turn designs into clean code and editable content.",
        promptExample:
          "Import this Figma frame and generate a responsive React component with props for content and layout.",
        workflowSteps: [
          "Connect Figma; import components.",
          "Generate code; map to CMS fields.",
          "Preview and A/B test variants.",
        ],
      },
      {
        name: "Bubble",
        url: "https://bubble.io/",
        description: "No‑code app builder with workflows and database.",
        promptExample:
          "Prototype a marketplace MVP with user auth, listings, search, and Stripe checkout.",
        workflowSteps: [
          "Design data types; build pages.",
          "Create workflows and integrations.",
          "Launch and iterate on feedback.",
        ],
      },
      {
        name: "Softr",
        url: "https://www.softr.io/",
        description: "Build client portals and apps on top of Airtable/Notion.",
        promptExample:
          "Create a client portal from Airtable with login, role‑based views, and file uploads.",
        workflowSteps: [
          "Connect Airtable; define roles.",
          "Assemble pages and permissions.",
          "Brand and publish with custom domain.",
        ],
      },
      {
        name: "Retool AI",
        url: "https://retool.com/ai",
        description: "Internal tools with LLM blocks, RAG, and automations.",
        promptExample:
          "Build an internal ticket triage app with RAG answers and priority scoring.",
        workflowSteps: [
          "Connect DB/APIs; add LLM blocks.",
          "Wire RAG to knowledge base.",
          "Deploy with auth and audit logs.",
        ],
      },
      {
        name: "FlutterFlow",
        url: "https://flutterflow.io/",
        description: "Visual builder for Flutter apps with AI assist.",
        promptExample:
          "Generate a mobile onboarding flow with email login, progress dots, and success screen.",
        workflowSteps: [
          "Sketch screens; generate components.",
          "Bind to Firebase; test on device.",
          "Export code and publish.",
        ],
      },
    ],
  },
];

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-10">
      <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
      {subtitle && (
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Card className="h-full border-border/60 hover:border-primary/40 transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base md:text-lg">
          <span>{tool.name}</span>
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
            aria-label={`Open ${tool.name} in new tab`}
          >
            Visit
            <ExternalLink className="w-4 h-4" />
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{tool.description}</p>
      </CardContent>
    </Card>
  );
}

function PromptCard({ tool }: { tool: Tool }) {
  return (
    <Card className="h-full border-border/60">
      <CardHeader>
        <CardTitle className="text-base md:text-lg">{tool.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Example prompt</p>
        <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-3 rounded-md border border-border/50">{tool.promptExample}</pre>
      </CardContent>
    </Card>
  );
}

function WorkflowCard({ tool }: { tool: Tool }) {
  return (
    <Card className="h-full border-border/60">
      <CardHeader>
        <CardTitle className="text-base md:text-lg">{tool.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
          {tool.workflowSteps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

export default function Resources() {
  return (
    <HelmetProvider>
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>AI Resources: Tools, Prompts, Workflows | JumpinAI</title>
          <meta name="description" content="Explore the best AI tools with pro prompts and workflows. Browse text, image, video, audio, and app builders—curated by JumpinAI." />
          <link rel="canonical" href="https://jumpinai.com/resources" />
          <script type="application/ld+json">{JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'JumpinAI Resources',
            url: 'https://jumpinai.com/resources',
            hasPart: categories.map((c) => ({
              '@type': 'ItemList',
              name: c.title,
              itemListElement: c.tools.map((t, idx) => ({
                '@type': 'Thing',
                position: idx + 1,
                name: t.name,
                url: t.url,
                description: t.description,
              })),
            })),
          })}</script>
        </Helmet>

        <Navigation />

        {/* Hero */}
        <section className="px-6 mt-24">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">AI Resources</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              The best tools, the right prompts, and proven workflows—organized by what you want to build.
            </p>
          </div>
        </section>

        {/* Tabs */}
        <main className="px-6 py-10">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="tools" className="w-full">
              <div className="sticky top-16 md:top-20 z-40 -mx-6 px-6 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto flex justify-center py-3 border-b border-border/40">
                  <TabsList className="rounded-full border border-border/60 bg-muted/50 p-1 backdrop-blur supports-[backdrop-filter]:bg-muted/60">
                    <TabsTrigger value="tools" className="rounded-full px-4 md:px-6">Tools</TabsTrigger>
                    <TabsTrigger value="prompts" className="rounded-full px-4 md:px-6">Prompts</TabsTrigger>
                    <TabsTrigger value="workflows" className="rounded-full px-4 md:px-6">Workflows</TabsTrigger>
                  </TabsList>
                </div>
              </div>

              {/* Tools tab */}
              <TabsContent value="tools">
                {categories.map((cat) => (
                  <section key={cat.id} className="mb-14">
                    <SectionHeader
                      title={cat.title}
                      subtitle="Curated leaders with clear use cases."
                    />
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cat.tools.map((tool) => (
                        <ToolCard key={tool.name} tool={tool} />
                      ))}
                    </div>
                  </section>
                ))}
              </TabsContent>

              {/* Prompts tab */}
              <TabsContent value="prompts">
                {categories.map((cat) => (
                  <section key={cat.id} className="mb-14">
                    <SectionHeader
                      title={cat.title}
                      subtitle="Copy‑paste professional prompts—then tailor to your context."
                    />
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cat.tools.map((tool) => (
                        <PromptCard key={tool.name} tool={tool} />
                      ))}
                    </div>
                  </section>
                ))}
              </TabsContent>

              {/* Workflows tab */}
              <TabsContent value="workflows">
                {categories.map((cat) => (
                  <section key={cat.id} className="mb-14">
                    <SectionHeader
                      title={cat.title}
                      subtitle="Field‑tested sequences to get repeatable results."
                    />
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cat.tools.map((tool) => (
                        <WorkflowCard key={tool.name} tool={tool} />
                      ))}
                    </div>
                  </section>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <footer className="mt-10">
          <Footer />
        </footer>
      </div>
    </HelmetProvider>
  );
}
