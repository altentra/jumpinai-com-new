import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { CheckCircle, Wrench, ArrowRight, Sparkles } from 'lucide-react';

export const InteractiveJumpDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

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
    <div className="w-full max-w-5xl mx-auto">
      <div className="glass rounded-2xl border border-primary/20 overflow-hidden backdrop-blur-xl shadow-xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
          <div className="relative h-[380px] overflow-hidden">
            <div className="h-full overflow-y-auto custom-scrollbar">
              {/* Overview Tab */}
              <TabsContent value="overview" className="p-8 space-y-8 mt-0">
                <div className="prose prose-invert max-w-none">
                  <div className="text-foreground/90 leading-relaxed space-y-4">
                    <p>You're ready to jump into AI-powered content creation for your YouTube channel. This personalized strategy roadmap delivers a comprehensive, step-by-step plan tailored to help you eliminate creative blocks, generate consistent video ideas, craft engaging scripts, and maintain momentum in your content production.</p>
                    
                    <p>This roadmap is built specifically around your current situation—struggling with overthinking during ideation—and your goals of producing regular, high-quality content without burning out. You'll discover exactly which AI tools to use, when to use them, and how to integrate them seamlessly into your workflow to transform from hesitant creator to confident content producer.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground">Strategic Roadmap</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-primary">Immediate Actions</span>
                      </div>
                      <div className="text-sm text-foreground/80 leading-relaxed space-y-2">
                        <p><strong>Set up your AI toolkit:</strong> Create accounts for Claude, ChatGPT, and Perplexity—three free or low-cost AI platforms that complement each other for ideation, scripting, and research.</p>
                        <p><strong>Run your first brainstorming session:</strong> Spend 20 minutes with Claude generating 10 video ideas based on your interests and niche.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Plan Tab */}
              <TabsContent value="plan" className="p-8 space-y-8 mt-0">
                {/* Phase Header */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm">
                        <div className="text-center">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phase</div>
                          <div className="text-2xl font-bold text-foreground">{phase1Data.phase_number}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <h2 className="text-2xl font-bold text-foreground leading-tight">
                        {phase1Data.title}
                      </h2>
                      <p className="text-foreground/80 leading-relaxed">
                        {phase1Data.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-foreground">Duration:</span>
                        <span className="text-muted-foreground">{phase1Data.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-6">
                  {phase1Data.steps.map((step, stepIndex) => (
                    <div
                      key={stepIndex}
                      className="group relative rounded-xl bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-white/[0.03] border border-white/10 backdrop-blur-sm p-6 hover:border-white/20 transition-all duration-200"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30">
                              <span className="text-sm font-semibold text-primary">Step {step.step_number}.</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground mb-3 leading-tight">
                              {step.title}
                            </h3>
                            <p className="text-foreground/80 leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>

                        {/* Tools & Prompts Box */}
                        {step.hasCombo && (
                          <div className="mt-4 rounded-lg bg-primary/10 border border-primary/20 p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Wrench className="w-4 h-4 text-primary" />
                                <div>
                                  <div className="text-sm font-medium text-foreground">
                                    Tools & Prompts for this Step
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    Custom AI tool & prompt ready for this step
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => setActiveTab('tools')}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                              >
                                View
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Tools & Prompts Tab */}
              <TabsContent value="toolPrompts" className="p-8 space-y-6 mt-0">
                {combosData.map((combo, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-white/[0.03] border border-white/10 backdrop-blur-sm p-6 space-y-6"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="px-2.5 py-1 rounded-md bg-primary/20 border border-primary/30">
                            <span className="text-xs font-bold text-primary">#{combo.number}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-foreground leading-tight">
                            {combo.title}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Tool Info */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Wrench className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-sm font-semibold text-foreground">{combo.tool_name}</h4>
                            <span className="px-2 py-0.5 rounded text-xs bg-primary/20 text-primary border border-primary/30">
                              {combo.tool_type}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/70 leading-relaxed mb-3">
                            {combo.description}
                          </p>
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-3">
                            <span>⏱️ Setup: {combo.setup_time}</span>
                            <span>💰 {combo.cost_estimate}</span>
                            <span>📊 {combo.difficulty_level}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-1 rounded bg-secondary/50 text-secondary-foreground">
                              {combo.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Prompt */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-accent" />
                          <h4 className="text-sm font-semibold text-foreground">Ready-to-Use Prompt</h4>
                        </div>
                        <div className="rounded-lg bg-black/20 border border-white/10 p-4">
                          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap font-mono">
                            {combo.prompt_text}
                          </p>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-foreground">How to Use</h4>
                        <p className="text-sm text-foreground/70 leading-relaxed">
                          {combo.prompt_instructions}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </div>

            {/* Bottom Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none" />
          </div>
        </Tabs>
      </div>
    </div>
  );
};
