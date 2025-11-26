import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Lightbulb, Compass, Target, MapPin, Clock, TrendingUp, Sparkles, MessageSquare, Copy, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Real Jump #9 data from database
const demoJumpData = {
  overview: {
    executiveSummary: "This Jump is designed to transform you from a hesitant beginner overwhelmed by overthinking into a confident, AI-empowered online content creator. By systematically implementing AI tools like Claude, ChatGPT, Perplexity, Midjourney, NotebookLM, Runway, Gemini, Make.com, Synthesia, Descript, and Zapier across three progressive phases, you will break through creative paralysis, establish sustainable content workflows, and build a validated portfolio. The plan directly addresses your core challenges—uncertainty about where to start, tool overwhelm, and fear of commitment—by providing structured, beginner-friendly steps with clear outputs: AI-generated content blueprints (Phase 1), prototyped videos and automated drafts (Phase 2), and a scalable, optimized content system (Phase 3). Success hinges on embracing experimentation over perfection, maintaining small daily actions, and treating AI as a collaborative co-creator. With an investment of 100-150 hours and $50-$200 over 6-12 months, following this roadmap will equip you to consistently create engaging content, grow an audience, and turn your creative interests into tangible online presence.",
    situationAnalysis: {
      currentState: "You are at the starting line of your online content creation journey with a genuine interest in creative storytelling and daily life tips, but currently stalled by overthinking and uncertainty about how to begin. Your creative ideas remain abstract, lacking concrete form, and you face decision paralysis when confronted with tool choices, content formats, and initial steps. While you possess creative interests and motivation, you lack a structured system to translate ideas into published content. Your beginner status means minimal experience with AI tools, video editing, or content strategy, creating both a blank slate for learning and a need for highly accessible, step-by-step guidance. The gap between your desire to create and actual output is primarily mental and tactical rather than resource-based.",
      challenges: [
        "**Overthinking and Decision Paralysis:** Tendency to overanalyze choices about tools, formats, and ideas, leading to inaction and prolonged planning without execution.",
        "**Tool Overwhelm:** Vast landscape of AI and content creation tools creates confusion about which to adopt and how to learn them efficiently.",
        "**Fear of Starting:** Uncertainty about 'the right first step' and perfectionism causing hesitation to publish initial content, delaying valuable feedback loops.",
        "**Lack of Structured System:** Absence of a repeatable workflow for ideation, creation, and publishing, making each content piece feel like starting from scratch.",
        "**Beginner Knowledge Gap:** Limited familiarity with content strategy, audience engagement principles, and AI prompting techniques necessary for effective tool use."
      ],
      opportunities: [
        "**AI as Brainstorming Partner:** Tools like Claude and ChatGPT can externalize and structure your creative ideas, breaking overthinking cycles by providing instant feedback.",
        "**Low-Barrier Entry Points:** Many AI tools offer free tiers and beginner-friendly interfaces, reducing financial and technical barriers to experimentation.",
        "**Growing Creator Economy:** High demand for authentic, relatable content in storytelling and daily life niches, with platforms favoring consistent creators.",
        "**Automation for Consistency:** AI-powered workflows (via Make.com, Zapier) can automate repetitive tasks, freeing mental energy for creative decisions.",
        "**Rapid Iteration Capability:** AI enables fast testing of content ideas and formats, accelerating learning through iteration rather than prolonged planning."
      ]
    },
    strategicVision: "Transform from a hesitant beginner into a confident, AI-powered content creator who consistently produces engaging videos and posts that resonate with an audience interested in creative storytelling and daily life tips. By mastering strategic AI implementation, you will establish a sustainable, scalable content system that turns overthinking into decisive action, uncertainty into structured workflows, and creative ideas into published content with measurable audience growth. Your end state is a validated portfolio of 20+ pieces, a repeatable creation process requiring 5-10 hours weekly, and clear metrics showing engagement trends, positioning you to expand content types, monetize, or pursue collaborative opportunities—all grounded in the unique voice and perspective you bring to the creator economy.",
    roadmap: {
      immediate: "**0-30 Days (Foundation Phase):** Sign up for Claude, ChatGPT, Perplexity (free tiers), and use them to generate 5-10 structured content ideas using provided prompts. Create 2-3 script templates with ChatGPT and research 3 trending topics with Perplexity. Register for Midjourney (basic $10/month) and generate 5 thumbnail concepts. Set up NotebookLM to organize all AI outputs into a searchable content library. Expected outputs: AI-generated content blueprints ready for prototyping, eliminating 'where to start' uncertainty."
    }
  },
  plan: {
    phases: [
      {
        phase_number: 1,
        title: "Foundation Phase: Building AI Ideation Foundations",
        duration: "**Early Stage** — Begin when ready",
        description: "In this initial phase, you'll implement core AI tools like **Claude**, **ChatGPT**, and **Perplexity** to break through overthinking and generate your first content ideas, providing structured starting points for videos and posts. This matters because AI instantly simulates creative brainstorming, turning paralysis into actionable outlines and trend insights, allowing quick experimentation without endless deliberation. By the end, you'll have **AI-generated content blueprints** ready to prototype.",
        steps: [
          {
            step_number: 1,
            title: "**Use Claude for Overthinking-Busting Brainstorming Sessions**",
            description: "Leverage **Claude** to overcome overthinking by inputting your interests, such as 'creative storytelling' or 'daily life tips,' and prompting it to generate 5-10 specific video or post ideas with structured outlines, including key hooks and calls-to-action. Experiment with follow-up prompts like 'Refine this idea for a 60-second video format' to iterate rapidly and build decision confidence. This AI implementation matters because **Claude** provides instant, focused creativity frameworks, replacing vague ideation with clear starting points in minutes. → Use **Tool #1**",
            estimated_time: "3-8 hours (varies by pace)"
          },
          {
            step_number: 2,
            title: "**Implement ChatGPT for Step-by-Step Content Templates**",
            description: "Use **ChatGPT** to create starter templates by prompting it with a brainstormed idea from Claude, such as 'Generate a script template for a beginner's guide video on [topic], including intro, body, and outro sections.' Customize by asking for variations like 'Make it engaging for social media' to practice iterative refinement. This step centers AI to deliver ready-to-fill blueprints, eliminating uncertainty about structure and enabling your first draft within an hour. → Use **Tool #2**",
            estimated_time: "4-10 hours (adjust to your schedule)"
          }
        ]
      }
    ]
  },
  toolPrompts: [
    {
      id: "1",
      title: "Overcoming Overthinking with AI Brainstorming for Content Ideas",
      description: "This combo uses Claude to generate structured content ideas based on your interests, directly busting overthinking by providing instant, focused outlines for videos or posts, turning uncertainty into actionable starting points.",
      tool_name: "Claude",
      tool_url: "https://claude.ai",
      category: "AI Ideation and Brainstorming",
      difficulty_level: "Beginner",
      setup_time: "5 minutes (sign up and start chatting)",
      cost_estimate: "Free tier sufficient; Pro at $20/month for advanced features if needed",
      prompt_text: "You are an expert content strategist specializing in helping beginners overcome creative paralysis through structured ideation. My goal is to create engaging online videos and posts, but I struggle with overthinking and not knowing where to start. My interests include creative storytelling and daily life tips.\n\nGenerate 5-10 specific, beginner-friendly content ideas tailored to short-form videos (under 60 seconds) or social media posts. For each idea, provide a structured outline including:\n\n1) A compelling hook to grab attention in the first 5 seconds;\n2) Main body with 3-4 key points or steps, keeping it simple and relatable;\n3) A strong call-to-action to encourage engagement like comments or shares;\n4) Estimated format (e.g., TikTok-style video or Instagram carousel).\n\nEnsure ideas are original, aligned with 2025 trends like authentic personal narratives and quick value delivery, and varied across my interests to spark inspiration without overwhelming choices. Prioritize ideas that build confidence for rapid prototyping. After the list, suggest 2 follow-up refinement prompts I can use, such as adapting one idea for a specific platform.\n\nOutput in a clear, numbered format with bold headings for easy scanning. Success criteria: Ideas must be immediately actionable, reducing decision fatigue, and feel personally tailored to foster my unique voice.",
      prompt_instructions: "Copy-paste this prompt directly into Claude's interface. Start with your interests (e.g., replace 'creative storytelling and daily life tips' with yours if different). After generating, use Claude's chat to refine by asking follow-ups like 'Refine idea #3 for a 60-second video format with more humor.' Experiment with 2-3 sessions to build prompting intuition, spending 30-60 minutes per session to avoid overthinking."
    },
    {
      id: "2",
      title: "Building Reusable Content Structures with AI Templates",
      description: "This combo uses ChatGPT to transform raw ideas into fillable script templates, eliminating the 'blank page' fear by providing structured frameworks for intros, bodies, and outros that you customize, speeding up content creation and building repeatable workflows.",
      tool_name: "ChatGPT",
      tool_url: "https://chatgpt.com",
      category: "Content Structuring and Scripting",
      difficulty_level: "Beginner",
      setup_time: "5 minutes (sign up and start prompting)",
      cost_estimate: "Free tier works; ChatGPT Plus at $20/month for faster responses and GPT-4 access",
      prompt_text: "You are a professional scriptwriter and content strategist helping beginners create structured, engaging content. I have a content idea: [Insert your specific idea from Claude here, e.g., 'A 60-second video on 3 daily habits that boost creativity for busy people'].\n\nGenerate a detailed script template tailored to this idea for a short-form video (under 90 seconds) or social media post. Structure the template with clear sections:\n\n1) **Hook (First 5-7 seconds):** Write 2 attention-grabbing opening lines that create curiosity or relatability, optimized for stopping scrollers.\n\n2) **Introduction (7-15 seconds):** Provide a brief context-setting statement that positions the value (e.g., 'If you're stuck in a creativity rut, these 3 simple habits changed everything for me').\n\n3) **Main Body (40-60 seconds):** Break the core content into 3-4 digestible points or steps, each with:\n   - A subheading (bold)\n   - 2-3 sentences of explanation\n   - A relatable example or quick tip\n   - Visual cue suggestion (e.g., 'Show a timer counting down' or 'Display text overlay: Habit #1')\n\n4) **Conclusion/Call-to-Action (10-15 seconds):** Write a closing statement that reinforces the takeaway and prompts engagement (e.g., 'Try habit #2 today and let me know how it goes in the comments!').\n\n5) **Platform Adaptations:** Suggest 2 variations of this script—one for TikTok (ultra-concise, trend-driven) and one for Instagram Reels (slightly more polished narrative).\n\nOutput the template with placeholders [like this] where I can insert my personal examples or details. Ensure the tone is conversational, authentic, and beginner-friendly, avoiding jargon. Success criteria: The template should feel like a guided framework I can fill in within 20-30 minutes, reducing decision fatigue while maintaining my voice.",
      prompt_instructions: "Copy this prompt template and replace the bracketed [content idea] section with your actual idea from Claude. Paste into ChatGPT. After receiving the template, save it to a document. Customize the placeholders with your own examples. For subsequent content, reuse this template structure to speed up creation."
    }
  ]
};

export const InteractiveJumpDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="glass rounded-2xl border border-primary/20 overflow-hidden backdrop-blur-xl shadow-xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Navigation - Same styling as ViewJumpDisplay */}
          <div className="border-b border-border/50 bg-gradient-to-r from-background/95 via-background/90 to-background/95 backdrop-blur-xl">
            <TabsList className="w-full grid grid-cols-3 gap-1.5 p-2 bg-transparent h-auto">
              <TabsTrigger 
                value="overview" 
                className="relative flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5
                  data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                  data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                  data-[state=active]:border data-[state=active]:border-primary/30
                  text-muted-foreground hover:text-foreground hover:bg-accent/50
                  transition-all duration-300 rounded-lg hover:scale-[1.02] group"
              >
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
                <span className="tracking-wide">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="plan" 
                className="relative flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5
                  data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                  data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                  data-[state=active]:border data-[state=active]:border-primary/30
                  text-muted-foreground hover:text-foreground hover:bg-accent/50
                  transition-all duration-300 rounded-lg hover:scale-[1.02] group"
              >
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
                <span className="tracking-wide">Plan</span>
              </TabsTrigger>
              <TabsTrigger 
                value="toolPrompts" 
                className="relative flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5
                  data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                  data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                  data-[state=active]:border data-[state=active]:border-primary/30
                  text-muted-foreground hover:text-foreground hover:bg-accent/50
                  transition-all duration-300 rounded-lg hover:scale-[1.02] group"
              >
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
                <span className="tracking-wide">Tools & Prompts</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content - Limited height with scroll and fade at bottom */}
          <div className="relative h-[380px] overflow-hidden">
            <div className="h-full overflow-y-auto custom-scrollbar">
              {/* Overview Tab */}
              <TabsContent value="overview" className="p-6 space-y-6 mt-0">
                {/* Executive Summary */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <Card className="relative glass backdrop-blur-lg bg-card/80 border border-border hover:border-primary/40 transition-all duration-300 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        Executive Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none break-words overflow-wrap-anywhere text-xs sm:text-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {demoJumpData.overview.executiveSummary}
                        </ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Situation Analysis */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <Card className="relative glass backdrop-blur-lg bg-card/80 border border-border hover:border-primary/40 transition-all duration-300 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        Situation Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm mb-2">Current State</h4>
                        <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {demoJumpData.overview.situationAnalysis.currentState}
                          </ReactMarkdown>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
                            Key Challenges
                          </h4>
                          <ul className="space-y-2">
                            {demoJumpData.overview.situationAnalysis.challenges.map((challenge, idx) => (
                              <li key={idx} className="text-[11px] sm:text-xs pl-4 border-l-2 border-destructive/30">
                                <div className="prose prose-2xs dark:prose-invert max-w-none text-[11px] sm:text-xs">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{challenge}</ReactMarkdown>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                            Opportunities
                          </h4>
                          <ul className="space-y-2">
                            {demoJumpData.overview.situationAnalysis.opportunities.map((opp, idx) => (
                              <li key={idx} className="text-[11px] sm:text-xs pl-4 border-l-2 border-primary/30">
                                <div className="prose prose-2xs dark:prose-invert max-w-none text-[11px] sm:text-xs">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{opp}</ReactMarkdown>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Strategic Vision */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <Card className="relative glass backdrop-blur-lg bg-card/80 border border-border hover:border-primary/40 transition-all duration-300 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        Strategic Vision
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {demoJumpData.overview.strategicVision}
                        </ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Roadmap - Only Immediate with fade */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <Card className="relative glass backdrop-blur-lg bg-card/80 border border-border hover:border-primary/40 transition-all duration-300 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        Roadmap
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Immediate (0-30 days) */}
                      <div className="p-3 sm:p-4 rounded-xl border border-primary/30 bg-primary/5">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-xs sm:text-sm text-primary flex items-center gap-2">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            Immediate Actions
                          </h4>
                          <Badge variant="outline" className="text-[10px] sm:text-xs bg-primary/10 text-primary border-primary/30">0-30 days</Badge>
                        </div>
                        <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {demoJumpData.overview.roadmap.immediate}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

              </TabsContent>

              {/* Plan Tab */}
              <TabsContent value="plan" className="p-6 space-y-6 mt-0">
                {demoJumpData.plan.phases.map((phase) => (
                  <div key={phase.phase_number} className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                    <Card className="relative glass backdrop-blur-lg bg-card/80 border border-border hover:border-primary/40 transition-all duration-300 rounded-2xl">
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20 text-primary font-bold text-base flex-shrink-0">
                            {phase.phase_number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base sm:text-lg mb-2 break-words">{phase.title}</CardTitle>
                            <Badge variant="outline" className="text-xs mb-2">{phase.duration}</Badge>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{phase.description}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-2">
                        {/* Show only first 2 steps */}
                        {phase.steps.map((step, stepIdx) => (
                          <div key={stepIdx} className="relative pl-6 pb-4 border-l-2 border-primary/30 ml-5">
                            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-primary">{step.step_number}</span>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-foreground leading-snug pr-2">{step.title}</h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                              <Badge variant="secondary" className="text-[10px]">{step.estimated_time}</Badge>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </TabsContent>

              {/* Tools & Prompts Tab */}
              <TabsContent value="toolPrompts" className="p-6 space-y-6 mt-0">
                {/* Show only first 2 combos */}
                {demoJumpData.toolPrompts.map((combo, index) => (
                  <div key={combo.id} className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                    <Card className="relative glass backdrop-blur-lg bg-card/80 border border-border hover:border-primary/40 transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col gap-2 mb-2">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="font-semibold break-words">{index + 1}. {combo.title}</span>
                          </CardTitle>
                          <Badge variant="outline" className="w-fit text-xs self-end">{combo.category}</Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-foreground leading-relaxed">{combo.description}</p>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Tool Information */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-foreground/90 whitespace-nowrap">Tool:</span>
                          <a
                            href={combo.tool_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative group/tool"
                          >
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover/tool:opacity-60 transition duration-500"></div>
                            <div className="relative flex items-center gap-3 px-5 py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover/tool:border-primary/50 transition-all duration-300 overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover/tool:translate-x-full transition-transform duration-1000"></div>
                              <span className="relative text-sm sm:text-base font-bold text-foreground group-hover/tool:text-primary transition-colors duration-300 whitespace-nowrap">
                                {combo.tool_name}
                              </span>
                              <div className="relative flex items-center justify-center w-6 h-6 rounded-xl bg-primary/20 group-hover/tool:bg-primary/30 transition-all duration-300">
                                <ExternalLink className="w-4 h-4 text-primary group-hover/tool:translate-x-0.5 group-hover/tool:-translate-y-0.5 transition-transform duration-300" />
                              </div>
                            </div>
                          </a>
                        </div>

                        {/* Metadata Badges */}
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-[10px] sm:text-xs">{combo.difficulty_level}</Badge>
                          <Badge variant="outline" className="text-[10px] sm:text-xs">{combo.setup_time}</Badge>
                          <Badge variant="outline" className="text-[10px] sm:text-xs">{combo.cost_estimate}</Badge>
                        </div>

                        {/* Prompt Display */}
                        <div className="space-y-3">
                          <span className="text-sm font-medium flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            Ready-to-Use Prompt
                          </span>
                          <div className="bg-muted/30 border border-border rounded-lg p-3">
                            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed break-words overflow-wrap-anywhere">
                              {combo.prompt_text}
                            </pre>
                          </div>
                          
                          {/* Copy Button */}
                          <button className="relative group/copy">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover/copy:opacity-60 transition duration-500"></div>
                            <div className="relative flex items-center gap-3 px-5 py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover/copy:border-primary/50 transition-all duration-300 overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover/copy:translate-x-full transition-transform duration-1000"></div>
                              <span className="relative text-sm font-bold text-foreground group-hover/copy:text-primary transition-colors duration-300 whitespace-nowrap">
                                Copy Prompt
                              </span>
                              <div className="relative flex items-center justify-center w-6 h-6 rounded-xl bg-primary/20 group-hover/copy:bg-primary/30 transition-all duration-300">
                                <Copy className="w-4 h-4 text-primary group-hover/copy:scale-110 transition-transform duration-300" />
                              </div>
                            </div>
                          </button>
                        </div>

                        {/* How to Use */}
                        {combo.prompt_instructions && (
                          <div className="relative group/section">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-2xl blur opacity-30 group-hover/section:opacity-50 transition duration-300"></div>
                            <div className="relative p-3 bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-amber-500/10 backdrop-blur-sm border border-yellow-500/20 rounded-2xl hover:border-yellow-500/30 transition-all duration-300">
                              <div className="flex items-start gap-2">
                                <Sparkles className="w-4 h-4 text-yellow-700 dark:text-yellow-400 mt-0.5 shrink-0" />
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400 mb-1">How to Use</p>
                                  <div className="text-xs sm:text-sm text-foreground leading-relaxed space-y-1">
                                    {combo.prompt_instructions.split('\n').filter(step => step.trim()).map((step, idx) => (
                                      <div key={idx}>{step.trim()}</div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </TabsContent>
            </div>

            {/* Bottom Fade Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none"></div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
