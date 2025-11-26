import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from '@/components/ui/badge';

// Sample data from actual Jump #9 for demonstration purposes
const demoJumpData = {
  overview: {
    executiveSummary: "You're paralyzed by overthinking when brainstorming content for videos or posts, stuck in endless 'what-ifs' without clear starting points or structured plans. AI steps in to **simulate instant creative brainstorming**, **generate structured frameworks**, and **reduce decision fatigue**, turning vague ideas into actionable content blueprints. By implementing 9 specific AI tools over a clear, two-phase roadmap, you'll break through your mental blocks and produce publishable content faster than you ever could alone. **This isn't just about automation—it's about AI as your creative thinking partner, designed to unlock your potential.**",
    situationAnalysis: "You're facing a classic creator's paradox: endless tools and inspiration sources, yet you're stuck in the brainstorming phase, unable to commit to a single direction. Your overthinking manifests as endless research, hesitation over 'perfect' ideas, and difficulty structuring concepts into executable steps. Meanwhile, AI has matured into a powerful creative accelerator—models like Claude, ChatGPT, and Perplexity can instantly provide structured outlines, trend insights, and iterative refinements that would take hours manually.",
    strategicVision: "Transform from an idea-paralyzed creator to a confident content producer by systematically integrating AI tools that replace overthinking with structured, actionable outputs. You'll begin with foundational tools (Claude, ChatGPT, Perplexity) to generate ideas and templates, then scale to production-ready prototypes with advanced tools (Runway, Gemini, Make.com). The end result: a repeatable AI-powered workflow that turns your 'creative block' into a library of ready-to-publish content—faster, more confidently, and with less mental friction.",
    keyObjectives: [
      "Replace overthinking with AI-generated starting points and structured brainstorming frameworks",
      "Build a personal AI content toolkit spanning ideation, scripting, visualization, and automation",
      "Achieve a repeatable workflow that produces publishable drafts within hours, not days",
      "Develop decision confidence through rapid AI-assisted iteration and trend validation"
    ],
    successMetrics: [
      "First AI-generated content idea published within 1 week",
      "3+ polished video or post drafts created using AI tools within 2 weeks",
      "Daily content creation time reduced by 50% through AI automation",
      "Confidence in starting new projects measured by initiating 2+ ideas per week without hesitation"
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
          },
          {
            step_number: 3,
            title: "Apply Perplexity for Trend Research Without Overwhelm",
            description: "Employ Perplexity to research trending topics by querying current trends in your niche, then follow up with beginner-friendly ideas based on these trends.",
            estimated_time: "5-12 hours"
          }
        ]
      },
      {
        phase_number: 2,
        title: "Building Momentum: Scaling AI-Driven Content Creation",
        duration: "Building Momentum — Advance when ready",
        description: "Scale by implementing Runway, Gemini, and Make.com to prototype videos and optimize workflows, turning initial ideas into polished drafts efficiently.",
        steps: [
          {
            step_number: 1,
            title: "Deploy Runway for Text-to-Video Prototyping",
            description: "Use Runway to prototype videos by inputting a ChatGPT script, generating 30-second clips with dynamic visuals.",
            estimated_time: "6-15 hours"
          },
          {
            step_number: 2,
            title: "Apply Gemini to Analyze Potential Audience Reactions",
            description: "Utilize Gemini to analyze your drafted content, prompting it with sample posts or scripts to predict audience reactions and engagement potential.",
            estimated_time: "5-10 hours"
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
      category: "Ideation & Brainstorming",
      difficulty_level: "Beginner",
      setup_time: "5-10 minutes",
      cost_estimate: "Free tier available; $20/month for Pro",
      prompt_text: "I want to create content for [videos/posts] in the [specific niche/topic area] space. I'm interested in [list 2-3 core interests or themes]. Generate 5-10 specific content ideas with: 1) A catchy title/hook, 2) A 3-sentence outline (intro, body, conclusion), 3) Suggested call-to-action. Focus on beginner-friendly, engaging topics that can be executed in under 60 seconds."
    },
    {
      id: "demo-2",
      title: "Creating Step-by-Step Content Templates to Eliminate Starting Uncertainty",
      description: "Transform brainstormed ideas into ready-to-fill content templates using ChatGPT",
      tool_name: "ChatGPT (by OpenAI)",
      category: "Content Structuring",
      difficulty_level: "Beginner",
      setup_time: "5 minutes",
      cost_estimate: "Free tier available; $20/month for Plus",
      prompt_text: "Based on this content idea: [paste idea from Claude], generate a detailed script template for a [video/post] that includes: 1) Opening hook (first 3 seconds), 2) Main body with 3 key points, 3) Transition phrases between sections, 4) Closing call-to-action. Format it as a fill-in-the-blank template I can customize. Make it engaging for social media and optimized for [platform: TikTok/Instagram/YouTube Shorts]."
    },
    {
      id: "demo-3",
      title: "Streamlined Trend Research to Find Beginner-Friendly Starting Points",
      description: "Use Perplexity to discover current trending topics and validate content ideas with real-time data",
      tool_name: "Perplexity AI",
      category: "Research & Trend Analysis",
      difficulty_level: "Beginner",
      setup_time: "3-5 minutes",
      cost_estimate: "Free tier available; $20/month for Pro",
      prompt_text: "Search for current trends in [your niche] content for videos and posts in 2025. Then, based on these trends, suggest 3 beginner-friendly content ideas that: 1) Align with trending topics, 2) Can be created with minimal equipment/editing, 3) Have high engagement potential. Include brief explanations of why each trend is popular and how to approach it authentically."
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

          {/* Tab Content - Limited height with scroll */}
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6 space-y-6">
              {/* Executive Summary */}
              <div className="glass rounded-lg p-5 border border-primary/10 backdrop-blur-sm">
                <h3 className="text-base font-bold text-primary mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Executive Summary
                </h3>
                <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {demoJumpData.overview.executiveSummary}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Situation Analysis */}
              <div className="glass rounded-lg p-5 border border-primary/10 backdrop-blur-sm">
                <h3 className="text-base font-bold text-primary mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Situation Analysis
                </h3>
                <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {demoJumpData.overview.situationAnalysis}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Strategic Vision */}
              <div className="glass rounded-lg p-5 border border-primary/10 backdrop-blur-sm">
                <h3 className="text-base font-bold text-primary mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Strategic Vision
                </h3>
                <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {demoJumpData.overview.strategicVision}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Key Objectives */}
              <div className="glass rounded-lg p-5 border border-primary/10 backdrop-blur-sm">
                <h3 className="text-base font-bold text-primary mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Key Objectives
                </h3>
                <ul className="space-y-2">
                  {demoJumpData.overview.keyObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            {/* Plan Tab */}
            <TabsContent value="plan" className="p-6 space-y-6">
              {demoJumpData.plan.phases.map((phase, phaseIndex) => (
                <div key={phaseIndex} className="glass rounded-lg p-5 border border-primary/20 backdrop-blur-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm flex-shrink-0">
                      {phase.phase_number}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-foreground mb-1">
                        {phase.title}
                      </h3>
                      <Badge variant="outline" className="text-xs mb-2">
                        {phase.duration}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {phase.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    {phase.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="ml-5 pl-4 border-l-2 border-primary/30 py-2">
                        <div className="flex items-start gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex-shrink-0 mt-0.5">
                            {step.step_number}
                          </span>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-foreground mb-1">
                              {step.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mb-2">
                              {step.description}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {step.estimated_time}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Tools & Prompts Tab */}
            <TabsContent value="toolPrompts" className="p-6 space-y-4">
              {demoJumpData.toolPrompts.map((combo, index) => (
                <div key={combo.id} className="glass rounded-lg p-5 border border-primary/10 backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {combo.category}
                        </Badge>
                      </div>
                      <h3 className="text-base font-bold text-foreground mb-2">
                        {combo.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {combo.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">{combo.tool_name}</Badge>
                      <Badge variant="outline">{combo.difficulty_level}</Badge>
                      <Badge variant="outline">{combo.setup_time}</Badge>
                      <Badge variant="outline">{combo.cost_estimate}</Badge>
                    </div>

                    <div className="glass rounded-md p-4 bg-muted/30 border border-border/50">
                      <p className="text-xs font-semibold text-primary mb-2">Prompt:</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {combo.prompt_text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
