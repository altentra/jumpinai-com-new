import React, { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Sparkles, Clock, DollarSign, Target, AlertCircle, TrendingUp, Eye, Route, Lightbulb, Compass, MapPin } from 'lucide-react';
import { useScrollDrivenDemo } from '@/hooks/useScrollDrivenDemo';

export const InteractiveJumpDemo: React.FC = () => {
  const { containerRef, demoState } = useScrollDrivenDemo();
  const overviewRef = useRef<HTMLDivElement>(null);
  const planRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  // Sync tab content scroll based on demo state
  useEffect(() => {
    if (!demoState.isLocked) return;
    
    const refs = {
      overview: overviewRef,
      plan: planRef,
      tools: toolsRef,
    };
    
    const currentRef = refs[demoState.activeTab as keyof typeof refs]?.current;
    if (currentRef) {
      const maxScroll = Math.max(0, currentRef.scrollHeight - currentRef.clientHeight);
      const targetScroll = maxScroll * demoState.scrollProgress;
      
      console.log(`🎯 Scrolling ${demoState.activeTab} to ${targetScroll.toFixed(0)}px of ${maxScroll.toFixed(0)}px`);
      
      currentRef.scrollTop = targetScroll;
    }
  }, [demoState.activeTab, demoState.scrollProgress, demoState.isLocked]);

  // Real Jump #9 data - Phase 1 with first 2 steps
  const phase1Data = {
    phase_number: 1,
    title: "Foundation Phase: Building AI Ideation Foundations",
    description: "In this initial phase, you'll implement core AI tools like Claude, ChatGPT, and Perplexity to break through overthinking and generate your first content ideas, providing structured starting points for videos and posts. This matters because AI instantly simulates creative brainstorming, turning paralysis into actionable outlines and trend insights, allowing quick experimentation without endless deliberation. By the end, you'll have AI-generated content blueprints ready to prototype.",
    duration: "Early Stage — Begin when ready",
    steps: [
      {
        step_number: 1,
        title: "Use Claude for Overthinking-Busting Brainstorming Sessions",
        description: "Leverage Claude to overcome overthinking by inputting your interests, such as 'creative storytelling' or 'daily life tips,' and prompting it to generate 5-10 specific video or post ideas with structured outlines, including key hooks and calls-to-action. Experiment with follow-up prompts like 'Refine this idea for a 60-second video format' to iterate rapidly and build decision confidence. This AI implementation matters because Claude provides instant, focused creativity frameworks, replacing vague ideation with clear starting points in minutes. → Use Tool #1",
        hasCombo: true,
        comboNumber: 1
      },
      {
        step_number: 2,
        title: "Implement ChatGPT for Step-by-Step Content Templates",
        description: "Use ChatGPT to create starter templates by prompting it with a brainstormed idea from Claude, such as 'Generate a script template for a beginner's guide video on [topic], including intro, body, and outro sections.' Customize by asking for variations like 'Make it engaging for social media' to practice iterative refinement. This AI implementation is valuable because ChatGPT turns conceptual ideas into tangible content skeletons fast, helping you shift from overthinking to active production mode. → Use Tool #2",
        hasCombo: true,
        comboNumber: 2
      }
    ]
  };

  // First 2 tool/prompt combos - complete data
  const combosData = [
    {
      number: 1,
      title: "Overcoming Overthinking with AI Brainstorming for Content Ideas",
      tool_name: "Claude",
      tool_url: "https://claude.ai",
      tool_type: "AI Chatbot",
      description: "This combo uses Claude to generate structured content ideas based on your interests, directly busting overthinking by providing instant, focused outlines for videos or posts, turning uncertainty into actionable starting points.",
      category: "AI Ideation and Brainstorming",
      difficulty_level: "Beginner",
      setup_time: "5 minutes (sign up and start chatting)",
      cost_estimate: "Free tier sufficient; Pro at $20/month for advanced features if needed",
      prompt_text: `You are an expert content strategist specializing in helping beginners overcome creative paralysis through structured ideation. My goal is to create engaging online videos and posts, but I struggle with overthinking and not knowing where to start. My interests include creative storytelling and daily life tips.

Generate 5-10 specific, beginner-friendly content ideas tailored to short-form videos (under 60 seconds) or social media posts. For each idea, provide a structured outline including:

1) A compelling hook to grab attention in the first 5 seconds;
2) Main body with 3-4 key points or steps, keeping it simple and relatable;
3) A strong call-to-action to encourage engagement like comments or shares;
4) Estimated format (e.g., TikTok-style video or Instagram carousel).

Ensure ideas are original, aligned with 2025 trends like authentic personal narratives and quick value delivery, and varied across my interests to spark inspiration without overwhelming choices. Prioritize ideas that build confidence for rapid prototyping. After the list, suggest 2 follow-up refinement prompts I can use, such as adapting one idea for a specific platform.

Output in a clear, numbered format with bold headings for easy scanning. Success criteria: Ideas must be immediately actionable, reducing decision fatigue, and feel personally tailored to foster my unique voice.`,
      prompt_instructions: "Copy-paste this prompt directly into Claude's interface. Start with your interests (e.g., replace 'creative storytelling and daily life tips' with yours if different). After generating, use Claude's chat to refine by asking follow-ups like 'Refine idea #3 for a 60-second video format with more humor.' Experiment with 2-3 sessions to build prompting intuition, spending 30-60 minutes per session to avoid overthinking."
    },
    {
      number: 2,
      title: "Building Reusable Content Structures with AI Templates",
      tool_name: "ChatGPT",
      tool_url: "https://chatgpt.com",
      tool_type: "AI Chatbot",
      description: "This combo uses ChatGPT to transform raw ideas into fillable script templates, eliminating the 'blank page' fear by providing structured frameworks for intros, bodies, and outros that you customize, speeding up content creation and building repeatable workflows.",
      category: "Content Structuring and Scripting",
      difficulty_level: "Beginner",
      setup_time: "5 minutes (sign up and start prompting)",
      cost_estimate: "Free tier works; ChatGPT Plus at $20/month for faster responses and GPT-4 access",
      prompt_text: `You are a professional scriptwriter and content strategist helping beginners create structured, engaging content. I have a content idea: [Insert your specific idea from Claude here, e.g., 'A 60-second video on 3 daily habits that boost creativity for busy people'].

Generate a detailed script template tailored to this idea for a short-form video (under 90 seconds) or social media post. Structure the template with clear sections:

1) **Hook (First 5-7 seconds):** Write 2 attention-grabbing opening lines that create curiosity or relatability, optimized for stopping scrollers.

2) **Introduction (7-15 seconds):** Provide a brief context-setting statement that positions the value (e.g., 'If you're stuck in a creativity rut, these 3 simple habits changed everything for me').

3) **Main Body (40-60 seconds):** Break the core content into 3-4 digestible points or steps, each with:
   - A subheading (bold)
   - 2-3 sentences of explanation
   - A relatable example or quick tip
   - Visual cue suggestion (e.g., 'Show a timer counting down' or 'Display text overlay: Habit #1')

4) **Conclusion/Call-to-Action (10-15 seconds):** Write a closing statement that reinforces the takeaway and prompts engagement (e.g., 'Try habit #2 today and let me know how it goes in the comments!').

5) **Platform Adaptations:** Suggest 2 variations of this script—one for TikTok (ultra-concise, trend-driven) and one for Instagram Reels (slightly more polished narrative).

Output the template with placeholders [like this] where I can insert my personal examples or details. Ensure the tone is conversational, authentic, and beginner-friendly, avoiding jargon. Success criteria: The template should feel like a guided framework I can fill in within 20-30 minutes, reducing decision fatigue while maintaining my voice.`,
      prompt_instructions: "Copy this prompt template and replace the bracketed [content idea] section with your actual idea from Claude. Paste into ChatGPT. After receiving the template, save it to a document. Customize the placeholders with your own examples. For subsequent content, reuse this template structure to speed up creation."
    }
  ];

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
      <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br from-white/[0.03] via-white/[0.02] to-white/[0.03] backdrop-blur-sm p-1">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-xl opacity-30"></div>
        <div className="relative glass rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
          <Tabs value={demoState.activeTab} className="w-full pointer-events-none">
            {/* Tab Navigation - Original styling */}
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
            <div className="relative h-[360px] overflow-hidden">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0 h-full overflow-hidden">
                <div 
                  ref={overviewRef} 
                  className="h-full overflow-y-auto space-y-6 p-6" 
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
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
                        <p>You're at a pivotal moment where your passion for creating online content—videos, posts, or creative pieces—is held back by overthinking and uncertainty about where to begin, but AI adaptation is critical now because the content landscape in November 2025 demands rapid iteration and personalization that only AI can provide at scale. By strategically implementing AI tools like Claude for brainstorming and structuring ideas, ChatGPT for generating drafts, and Midjourney for visual assets, you'll transform paralysis into productive output, leveraging AI's ability to simulate creative processes and refine concepts instantly. Your journey will involve mastering key milestones such as using Perplexity to research trending topics without endless scrolling, implementing Runway to prototype videos from text prompts, and integrating Zapier AI to automate your publishing workflow, ensuring every step builds your AI fluency. Imagine a future where you're confidently releasing engaging content weekly, with AI as your co-creator, driving audience growth and turning your aspirations into a thriving online presence through seamless AI implementation.</p>
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
                          <p>Your desire to create online content is stalled by overthinking and a lack of starting points, leading to inaction despite your creative potential. AI implementation is essential now because tools like Claude and ChatGPT can generate tailored content ideas in seconds, breaking the overthinking cycle by providing structured outlines and prompts that guide your decisions. In the fast-evolving digital space of November 2025, AI adaptation allows you to experiment without high stakes, using Gemini to analyze audience trends or NotebookLM to organize research notes into actionable insights. Without AI, you'd remain stuck in ideation loops, but with it, you can prototype posts or videos rapidly, building momentum through iterative AI-assisted creation. This positions AI as the accelerator for turning vague aspirations into consistent, high-quality output.</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
                            Key Challenges
                          </h4>
                          <ul className="space-y-2">
                            <li className="text-[11px] sm:text-xs pl-4 border-l-2 border-destructive/30">
                              <div className="prose prose-2xs dark:prose-invert max-w-none text-[11px] sm:text-xs">
                                <p>Overthinking content ideas, which AI tools like Claude overcome by generating focused brainstorming sessions and decision frameworks</p>
                              </div>
                            </li>
                            <li className="text-[11px] sm:text-xs pl-4 border-l-2 border-destructive/30">
                              <div className="prose prose-2xs dark:prose-invert max-w-none text-[11px] sm:text-xs">
                                <p>Uncertainty about where to start, solved by ChatGPT's prompting techniques that create step-by-step content blueprints</p>
                              </div>
                            </li>
                            <li className="text-[11px] sm:text-xs pl-4 border-l-2 border-destructive/30">
                              <div className="prose prose-2xs dark:prose-invert max-w-none text-[11px] sm:text-xs">
                                <p>Lack of creative direction, addressed by Midjourney's image generation for visualizing concepts and sparking inspiration</p>
                              </div>
                            </li>
                            <li className="text-[11px] sm:text-xs pl-4 border-l-2 border-destructive/30">
                              <div className="prose prose-2xs dark:prose-invert max-w-none text-[11px] sm:text-xs">
                                <p>Difficulty in maintaining consistency, mitigated by Zapier AI's automation for scheduling and refining content workflows</p>
                              </div>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                            Opportunities
                          </h4>
                          <ul className="space-y-2">
                            <li className="text-[11px] sm:text-xs pl-4 border-l-2 border-primary/30">
                              <div className="prose prose-2xs dark:prose-invert max-w-none text-[11px] sm:text-xs">
                                <p>Leveraging generative AI like Runway for quick video prototyping, turning raw ideas into polished clips without expensive equipment</p>
                              </div>
                            </li>
                            <li className="text-[11px] sm:text-xs pl-4 border-l-2 border-primary/30">
                              <div className="prose prose-2xs dark:prose-invert max-w-none text-[11px] sm:text-xs">
                                <p>Using Perplexity for real-time trend research to align content with audience interests and boost engagement</p>
                              </div>
                            </li>
                            <li className="text-[11px] sm:text-xs pl-4 border-l-2 border-primary/30">
                              <div className="prose prose-2xs dark:prose-invert max-w-none text-[11px] sm:text-xs">
                                <p>Implementing NotebookLM to synthesize notes and outlines into cohesive posts, streamlining the creation process</p>
                              </div>
                            </li>
                            <li className="text-[11px] sm:text-xs pl-4 border-l-2 border-primary/30">
                              <div className="prose prose-2xs dark:prose-invert max-w-none text-[11px] sm:text-xs">
                                <p>Mastering Make.com for AI-driven automations that connect tools, enabling scalable content production</p>
                              </div>
                            </li>
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
                        <p>In your AI-powered success state, you'll wake up to a streamlined workflow where Claude handles initial content strategy, ChatGPT refines your scripts, and Runway generates video drafts, allowing you to focus on your unique voice and creativity. Daily, you'll integrate Gemini for audience insights and Midjourney for eye-catching visuals, producing videos and posts that resonate deeply and grow your online following organically. Through consistent AI implementation, you'll achieve milestones like a dedicated content calendar automated via Zapier AI and viral pieces born from Perplexity-researched trends, leading to collaborations and monetization opportunities. This vision isn't distant—it's the natural outcome of adapting AI tools as your creative partner, empowering you to create freely and build a sustainable online presence that inspires others.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Roadmap */}
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
                          <p>Begin by setting up Claude to brainstorm your first content theme—input your interests, and let it generate 5-10 specific post or video ideas to overcome overthinking, experimenting with prompts to refine outputs. Next, use ChatGPT to create a simple starter template for a video script or social post, practicing iterative prompting to build confidence in quick ideation. Establish AI foundations by integrating Perplexity for a 30-minute session on current content trends, noting how it provides starting points without overwhelm. This phase moves fast with AI's instant feedback, though your learning curve will shape the pace—expect your first AI-assisted piece ready within days.</p>
                        </div>
                      </div>
                      
                      {/* Short-term (30-90 days) */}
                      <div className="p-3 sm:p-4 rounded-xl border border-primary/30 bg-primary/5">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-foreground" />
                            Short-term Milestones
                          </h4>
                          <Badge variant="outline" className="text-[10px] sm:text-xs">30-90 days</Badge>
                        </div>
                        <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                          <p>As you build confidence, master Runway by inputting ChatGPT-generated scripts to produce short video prototypes, iterating on AI feedback to enhance visuals and pacing. Implement Midjourney for generating thumbnails and graphics, using it alongside NotebookLM to organize your content ideas into a reusable library. Scale by building an AI workflow with Make.com to automate idea-to-draft processes, connecting Claude outputs directly to ChatGPT for refinement. This phase focuses on momentum through tool integration, adapting as you discover what resonates in your creations.</p>
                        </div>
                      </div>
                      
                      {/* Long-term (90+ days) */}
                      <div className="p-3 sm:p-4 rounded-xl border border-primary/30 bg-primary/5">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                            <Target className="w-3 h-3 sm:w-4 sm:h-4 text-foreground" />
                            Long-term Goals
                          </h4>
                          <Badge variant="outline" className="text-[10px] sm:text-xs">90+ days</Badge>
                        </div>
                        <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                          <p>Advance to optimizing your AI stack by customizing Gemini for personalized audience analysis, predicting content performance and refining strategies based on data. Become a power user with Veo for advanced video generation, combining it with Zapier AI to automate full publishing pipelines from ideation to social media. Sustain success by regularly experimenting with Grok for unconventional creative twists, evolving your toolkit as AI advances in November 2025. Your mastery timeline depends on consistent implementation and the field's rapid changes, positioning you as an AI-driven content creator with scalable impact.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

              {/* Plan Tab */}
              <TabsContent value="plan" className="mt-0 h-full overflow-hidden">
                <div 
                  ref={planRef} 
                  className="h-full overflow-y-auto space-y-8 p-8" 
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <Card className="relative glass backdrop-blur-lg bg-card/80 border border-border hover:border-primary/40 transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-primary/10 flex flex-col items-center justify-center border border-primary/30">
                            <span className="text-[9px] sm:text-[10px] font-semibold text-primary uppercase tracking-wider">Phase</span>
                            <span className="text-xl sm:text-2xl font-bold text-primary leading-none mt-0.5">
                              {phase1Data.phase_number}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-2">
                            {phase1Data.title}
                          </CardTitle>
                          <div className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                            {phase1Data.description}
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="outline" className="text-[10px] sm:text-xs">
                              Duration: {phase1Data.duration}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 md:p-6">
                      <div className="space-y-3 sm:space-y-4">
                        {phase1Data.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="group">
                            <div className="bg-background/40 backdrop-blur-[2px] border border-primary/40 border-l-2 border-l-primary/50 hover:border-primary/70 hover:border-l-primary/80 rounded-3xl p-3 sm:p-4 md:p-5 hover:bg-background/60 transition-all duration-300 shadow-[0_2px_8px_rgba(var(--primary),0.15)] hover:shadow-[0_4px_16px_rgba(var(--primary),0.25)]">
                              <div className="flex items-start gap-3 sm:gap-4 mb-3">
                                <div className="flex-shrink-0 pt-0.5">
                                  <div className="px-3 py-2 rounded-2xl bg-gradient-to-br from-primary/25 to-primary/15 flex items-center justify-center border border-primary/40 shadow-sm">
                                    <span className="text-sm sm:text-base font-bold text-primary whitespace-nowrap">
                                      Step {step.step_number}.
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                  <h4 className="text-base sm:text-lg font-bold mb-1.5 text-foreground leading-snug">
                                    {step.title}
                                  </h4>
                                  <div className="text-sm text-muted-foreground/90 leading-relaxed">
                                    {step.description}
                                  </div>
                                </div>
                              </div>

                              {/* Tools & Prompts for this Step - Blue Box */}
                              {step.hasCombo && (
                                <div className="p-3 rounded-2xl border bg-blue-500/5 border-blue-500/30">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-start gap-2 flex-1">
                                      <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                                      <div>
                                        <p className="text-xs font-medium mb-0.5 text-blue-600 dark:text-blue-400">
                                          Tools & Prompts for this Step
                                        </p>
                                        <p className="text-xs text-muted-foreground/80 leading-snug">
                                          Custom AI tool & prompt ready for this step
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Note: Tab switching handled by scroll animation
                                      }}
                                      className="relative group/view shrink-0"
                                    >
                                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40 rounded-[2rem] blur-md opacity-40 group-hover/view:opacity-70 transition duration-500"></div>
                                      <div className="relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-background/40 via-background/30 to-background/40 backdrop-blur-xl rounded-[2rem] border border-primary/40 group-hover/view:border-primary/60 transition-all duration-300 overflow-hidden shadow-lg shadow-primary/10">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/view:translate-x-full transition-transform duration-1000"></div>
                                        <span className="relative text-sm font-bold text-foreground group-hover/view:text-primary transition-colors duration-300 whitespace-nowrap">
                                          View
                                        </span>
                                        <div className="relative flex items-center justify-center w-5 h-5 rounded-xl bg-primary/30 group-hover/view:bg-primary/40 transition-all duration-300">
                                          <ArrowRight className="w-3.5 h-3.5 text-primary group-hover/view:translate-x-0.5 transition-transform duration-300" />
                                        </div>
                                      </div>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

              {/* Tools & Prompts Tab */}
              <TabsContent value="tools" className="mt-0 h-full overflow-hidden">
                <div 
                  ref={toolsRef} 
                  className="h-full overflow-y-auto space-y-6 p-6" 
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                {combosData.map((combo, index) => (
                  <div key={index} className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                    <Card className="relative glass backdrop-blur-lg bg-card/80 border border-border hover:border-primary/40 transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col gap-2 mb-2">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="font-semibold break-words">{combo.number}. {combo.title}</span>
                          </CardTitle>
                          {combo.category && (
                            <Badge variant="outline" className="w-fit text-xs self-end">
                              {combo.category}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                          {combo.description}
                        </p>
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
                                <ArrowRight className="w-4 h-4 text-primary group-hover/tool:translate-x-0.5 group-hover/tool:-translate-y-0.5 transition-transform duration-300" />
                              </div>
                            </div>
                          </a>
                        </div>

                        {/* Prompt Display */}
                        <div className="space-y-3">
                          <span className="text-sm font-medium flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Ready-to-Use Prompt
                          </span>
                          <div className="bg-muted/30 border border-border rounded-lg p-3">
                            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed break-words overflow-wrap-anywhere">
                              {combo.prompt_text}
                            </pre>
                          </div>
                        </div>

                        {/* How to Use */}
                        <div className="relative group/section">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-2xl blur opacity-30 group-hover/section:opacity-50 transition duration-300"></div>
                          <div className="relative p-3 bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-amber-500/10 backdrop-blur-sm border border-yellow-500/20 rounded-2xl hover:border-yellow-500/30 transition-all duration-300">
                            <div className="flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-yellow-700 dark:text-yellow-400 mt-0.5 shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400 mb-1">How to Use</p>
                                <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                                  {combo.prompt_instructions}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* When to Use */}
                        <div className="relative group/section">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur opacity-30 group-hover/section:opacity-50 transition duration-300"></div>
                          <div className="relative p-3 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-cyan-500/10 backdrop-blur-sm border border-blue-500/20 rounded-2xl hover:border-blue-500/30 transition-all duration-300">
                            <div className="flex items-start gap-2">
                              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">When to Use</p>
                                <p className="text-xs sm:text-sm text-foreground leading-relaxed">At the very start of your content creation journey, when paralysis from overthinking blocks ideation.</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Why This Combo */}
                        <div className="relative group/section">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur opacity-30 group-hover/section:opacity-50 transition duration-300"></div>
                          <div className="relative p-3 bg-gradient-to-br from-green-500/10 via-green-500/5 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 rounded-2xl hover:border-green-500/30 transition-all duration-300">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Why This Combo</p>
                                <p className="text-xs sm:text-sm text-foreground leading-relaxed">Recommended for your project</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Alternative Tools */}
                        <div className="relative group/section">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur opacity-30 group-hover/section:opacity-50 transition duration-300"></div>
                          <div className="relative p-3 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-red-500/10 backdrop-blur-sm border border-orange-500/20 rounded-2xl hover:border-orange-500/30 transition-all duration-300">
                            <div className="flex items-start gap-2 mb-3">
                              <ArrowRight className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                              <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Alternative Tools:</p>
                            </div>
                            <div className="space-y-3">
                              {index === 0 && (
                                <>
                                  <div className="space-y-2">
                                    <button className="relative group/alt inline-block">
                                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover/alt:opacity-60 transition duration-500"></div>
                                      <div className="relative flex items-center gap-3 px-5 py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover/alt:border-primary/50 transition-all duration-300 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover/alt:translate-x-full transition-transform duration-1000"></div>
                                        <span className="relative text-sm font-bold text-foreground group-hover/alt:text-primary transition-colors duration-300 whitespace-nowrap">ChatGPT</span>
                                        <div className="relative flex items-center justify-center w-6 h-6 rounded-xl bg-primary/20 group-hover/alt:bg-primary/30 transition-all duration-300">
                                          <ArrowRight className="w-4 h-4 text-primary group-hover/alt:translate-x-0.5 group-hover/alt:-translate-y-0.5 transition-transform duration-300" />
                                        </div>
                                      </div>
                                    </button>
                                    <p className="text-xs sm:text-sm text-foreground leading-relaxed">Great free alternative for similar ideation if you prefer OpenAI's ecosystem, but Claude's focus on clarity better combats overthinking.</p>
                                  </div>
                                  <div className="space-y-2">
                                    <button className="relative group/alt inline-block">
                                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover/alt:opacity-60 transition duration-500"></div>
                                      <div className="relative flex items-center gap-3 px-5 py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover/alt:border-primary/50 transition-all duration-300 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover/alt:translate-x-full transition-transform duration-1000"></div>
                                        <span className="relative text-sm font-bold text-foreground group-hover/alt:text-primary transition-colors duration-300 whitespace-nowrap">Gemini</span>
                                        <div className="relative flex items-center justify-center w-6 h-6 rounded-xl bg-primary/20 group-hover/alt:bg-primary/30 transition-all duration-300">
                                          <ArrowRight className="w-4 h-4 text-primary group-hover/alt:translate-x-0.5 group-hover/alt:-translate-y-0.5 transition-transform duration-300" />
                                        </div>
                                      </div>
                                    </button>
                                    <p className="text-xs sm:text-sm text-foreground leading-relaxed">Fits budget-conscious users with free access, offering quick iterations for those new to AI prompting.</p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Meta Information */}
                        <div className="flex gap-2 flex-wrap pt-2 border-t border-border">
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20" variant="outline">
                            {combo.difficulty_level}
                          </Badge>
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Clock className="w-3 h-3" />
                            {combo.setup_time}
                          </Badge>
                          <Badge variant="secondary" className="text-xs gap-1">
                            <DollarSign className="w-3 h-3" />
                            {combo.cost_estimate}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>

          {/* Bottom Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none" />
        </Tabs>
      </div>
    </div>
  </div>
);
};
