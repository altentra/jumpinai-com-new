import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Lightbulb, Compass, Target, MapPin, Clock, TrendingUp, Sparkles, MessageSquare, Copy, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Sample data from actual Jump #9 for demonstration purposes
const demoJumpData = {
  overview: {
    executiveSummary: "You're paralyzed by overthinking when brainstorming content for videos or posts, stuck in endless 'what-ifs' without clear starting points or structured plans. AI steps in to **simulate instant creative brainstorming**, **generate structured frameworks**, and **reduce decision fatigue**, turning vague ideas into actionable content blueprints. By implementing 9 specific AI tools over a clear, two-phase roadmap, you'll break through your mental blocks and produce publishable content faster than you ever could alone. **This isn't just about automation—it's about AI as your creative thinking partner, designed to unlock your potential.**",
    situationAnalysis: {
      currentState: "You're facing a classic creator's paradox: endless tools and inspiration sources, yet you're stuck in the brainstorming phase, unable to commit to a single direction. Your overthinking manifests as endless research, hesitation over 'perfect' ideas, and difficulty structuring concepts into executable steps.",
      challenges: [
        "**Analysis Paralysis**: Endless 'what if' loops prevent starting",
        "**Lack of Structure**: No clear framework to organize scattered ideas",
        "**Comparison Trap**: Constantly comparing your ideas to others' polished work"
      ],
      opportunities: [
        "**AI as Brainstorming Partner**: Tools like Claude and ChatGPT can instantly generate structured starting points",
        "**Trend Validation**: Perplexity provides real-time insights to validate ideas",
        "**Rapid Prototyping**: Runway allows visual testing without full production"
      ]
    },
    strategicVision: "Transform from an idea-paralyzed creator to a confident content producer by systematically integrating AI tools that replace overthinking with structured, actionable outputs. You'll begin with foundational tools (Claude, ChatGPT, Perplexity) to generate ideas and templates, then scale to production-ready prototypes with advanced tools (Runway, Gemini, Make.com).",
    roadmap: {
      immediate: "Start with **Claude** for brainstorming 5-10 content ideas, then use **ChatGPT** to transform your best idea into a structured template. Set up accounts and complete your first AI-generated draft outline within the first week."
    },
    keyObjectives: [
      "Replace overthinking with AI-generated starting points and structured brainstorming frameworks",
      "Build a personal AI content toolkit spanning ideation, scripting, visualization, and automation",
      "Achieve a repeatable workflow that produces publishable drafts within hours, not days"
    ],
    successMetrics: [
      "First AI-generated content idea published within 1 week",
      "3+ polished video or post drafts created using AI tools within 2 weeks",
      "Daily content creation time reduced by 50% through AI automation"
    ]
  },
  plan: {
    phases: [
      {
        phase_number: 1,
        title: "Foundation Phase: Building AI Ideation Foundations",
        duration: "Early Stage — Begin when ready",
        description: "In this initial phase, you'll implement core AI tools like Claude, ChatGPT, and Perplexity to break through overthinking and generate your first content ideas.",
        steps: [
          {
            step_number: 1,
            title: "Use Claude for Overthinking-Busting Brainstorming Sessions",
            description: "Leverage Claude to overcome overthinking by inputting your interests and prompting it to generate 5-10 specific video or post ideas with structured outlines.",
            estimated_time: "3-8 hours"
          },
          {
            step_number: 2,
            title: "Implement ChatGPT for Step-by-Step Content Templates",
            description: "Use ChatGPT to create starter templates by prompting it with a brainstormed idea from Claude, generating script templates with intro, body, and outro sections.",
            estimated_time: "4-10 hours"
          }
        ]
      }
    ]
  },
  toolPrompts: [
    {
      id: "demo-1",
      title: "Overcoming Overthinking with AI Brainstorming for Content Ideas",
      description: "Break through creative paralysis by using Claude to generate structured content ideas instantly",
      tool_name: "Claude (by Anthropic)",
      tool_url: "https://claude.ai",
      category: "Ideation & Brainstorming",
      difficulty_level: "Beginner",
      setup_time: "5-10 minutes",
      cost_estimate: "Free tier available; $20/month for Pro",
      prompt_text: "I want to create content for [videos/posts] in the [specific niche/topic area] space. I'm interested in [list 2-3 core interests or themes]. Generate 5-10 specific content ideas with: 1) A catchy title/hook, 2) A 3-sentence outline (intro, body, conclusion), 3) Suggested call-to-action. Focus on beginner-friendly, engaging topics that can be executed in under 60 seconds.",
      prompt_instructions: "1. Log into Claude at claude.ai\n2. Copy the prompt above and replace bracketed placeholders with your specifics\n3. Paste into Claude and press Enter\n4. Review the generated ideas and pick 2-3 that resonate\n5. Ask Claude to refine your chosen ideas with follow-up prompts"
    },
    {
      id: "demo-2",
      title: "Creating Step-by-Step Content Templates to Eliminate Starting Uncertainty",
      description: "Transform brainstormed ideas into ready-to-fill content templates using ChatGPT",
      tool_name: "ChatGPT (by OpenAI)",
      tool_url: "https://chat.openai.com",
      category: "Content Structuring",
      difficulty_level: "Beginner",
      setup_time: "5 minutes",
      cost_estimate: "Free tier available; $20/month for Plus",
      prompt_text: "Based on this content idea: [paste idea from Claude], generate a detailed script template for a [video/post] that includes: 1) Opening hook (first 3 seconds), 2) Main body with 3 key points, 3) Transition phrases between sections, 4) Closing call-to-action. Format it as a fill-in-the-blank template I can customize. Make it engaging for social media and optimized for [platform: TikTok/Instagram/YouTube Shorts].",
      prompt_instructions: "1. Sign in to ChatGPT at chat.openai.com\n2. Paste your Claude-generated idea into the prompt\n3. Specify your target platform (TikTok, Instagram, etc.)\n4. Copy the generated template and customize it\n5. Save your template for future use"
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

                {/* Key Objectives & Success Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="glass backdrop-blur-xl border border-border/40 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        Key Objectives
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {demoJumpData.overview.keyObjectives.map((obj, idx) => (
                          <li key={idx} className="text-xs sm:text-sm flex items-center gap-2">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] sm:text-xs font-semibold text-primary">{idx + 1}</span>
                            </div>
                            <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none flex-1 text-xs sm:text-sm">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{obj}</ReactMarkdown>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="glass backdrop-blur-xl border border-border/40 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        Success Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {demoJumpData.overview.successMetrics.map((metric, idx) => (
                          <li key={idx} className="text-xs sm:text-sm flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                            <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none flex-1 text-xs sm:text-sm">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{metric}</ReactMarkdown>
                            </div>
                          </li>
                        ))}
                      </ul>
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
