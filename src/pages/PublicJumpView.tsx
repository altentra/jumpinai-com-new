import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import ViewJumpDisplay from '@/components/ViewJumpDisplay';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import type { ProgressiveResult } from '@/hooks/useProgressiveGeneration';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';

export default function PublicJumpView() {
  const { jumpId, username } = useParams<{ jumpId: string; username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [progressiveResult, setProgressiveResult] = useState<ProgressiveResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [jumpTitle, setJumpTitle] = useState('');
  const [jumpCreatedAt, setJumpCreatedAt] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (jumpId) {
      loadPublicJump();
    }
  }, [jumpId, user?.id]);

  const loadPublicJump = async () => {
    if (!jumpId) return;

    try {
      setLoading(true);

      // Fetch jump and verify it's public
      const { data: jump, error } = await supabase
        .from('user_jumps')
        .select('*')
        .eq('id', jumpId)
        .eq('is_public', true)
        .single();

      if (error || !jump) {
        toast.error('This jump is not publicly available');
        navigate('/404');
        return;
      }

      // Store jump info
      const displayTitle = jump.title.replace(/^Jump\s*#\d+\s*[:\-–]\s*/i, '');
      setJumpTitle(displayTitle);
      setJumpCreatedAt(jump.created_at);

      // Check if current user is the owner
      setIsOwner(user?.id === jump.user_id);

      // Track view
      await trackJumpView(jumpId);

      // Fetch tool prompts
      const { data: toolPromptsData } = await supabase
        .from('user_tool_prompts')
        .select('*')
        .eq('jump_id', jumpId);

      // Transform tool prompts
      const transformedToolPrompts = (toolPromptsData || []).map((dbToolPrompt: any) => {
        const content = dbToolPrompt.content || {};
        return {
          id: dbToolPrompt.id,
          name: dbToolPrompt.tool_name || content.name || dbToolPrompt.title || 'Unnamed Tool',
          category: dbToolPrompt.category || content.category || 'General',
          description: dbToolPrompt.description || content.description || 'No description available',
          website_url: dbToolPrompt.tool_url || content.website_url || content.url || '',
          when_to_use: content.when_to_use || dbToolPrompt.use_cases?.[0] || 'Use as needed',
          why_this_tool: content.why_this_tool || 'Recommended for your project',
          how_to_integrate: content.how_to_integrate || 'Follow setup instructions',
          custom_prompt: dbToolPrompt.prompt_text || content.custom_prompt || '',
          prompt_instructions: dbToolPrompt.prompt_instructions || content.prompt_instructions || '',
          alternatives: content.alternatives || [],
          skill_level: content.skill_level || dbToolPrompt.difficulty_level || 'Beginner',
          cost_model: content.cost_model || dbToolPrompt.cost_estimate || 'Varies',
          implementation_timeline: content.implementation_timeline || dbToolPrompt.setup_time || 'Quick setup',
          implementation_time: content.implementation_timeline || dbToolPrompt.setup_time || 'Quick setup',
          use_cases: dbToolPrompt.use_cases || [],
          ai_tools: dbToolPrompt.ai_tools || [],
          features: dbToolPrompt.features || [],
          tags: dbToolPrompt.tags || [],
          ...dbToolPrompt
        };
      });

      // Create structured plan
      const structuredPlan = createStructuredPlan(jump);

      // Build progressive result
      const result: ProgressiveResult = {
        title: jump.title,
        fullTitle: jump.title,
        jumpNumber: extractJumpNumber(jump.title),
        jumpName: jump.title,
        full_content: jump.full_content,
        structured_plan: structuredPlan,
        comprehensive_plan: jump.comprehensive_plan,
        components: {
          toolPrompts: transformedToolPrompts,
          workflows: [],
          blueprints: [],
          strategies: []
        },
        processing_status: {
          isComplete: true,
          stage: 'Complete',
          currentTask: 'Generated',
          progress: 100
        },
        jumpId: jump.id
      };

      setProgressiveResult(result);
    } catch (error) {
      console.error('Error loading public jump:', error);
      toast.error('Failed to load jump');
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const trackJumpView = async (jumpId: string) => {
    try {
      const { data: currentJump } = await supabase
        .from('user_jumps')
        .select('views_count')
        .eq('id', jumpId)
        .single();

      if (currentJump) {
        const newCount = (currentJump.views_count || 0) + 1;
        await supabase
          .from('user_jumps')
          .update({ views_count: newCount })
          .eq('id', jumpId);
      }
    } catch (error) {
      console.error('Error tracking jump view:', error);
    }
  };

  const extractJumpNumber = (title: string): number | null => {
    const match = title.match(/Jump #?(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  };

  const createStructuredPlan = (jump: any): any => {
    try {
      if (jump.structured_plan && typeof jump.structured_plan === 'object') {
        const plan = jump.structured_plan as any;
        if (Array.isArray(plan.phases) && plan.phases.length > 0) {
          return plan;
        }
        if (plan.action_plan?.phases) {
          return plan.action_plan;
        }
      }

      if (jump.comprehensive_plan && typeof jump.comprehensive_plan === 'object') {
        const plan = jump.comprehensive_plan as any;
        if (plan.action_plan?.phases && Array.isArray(plan.action_plan.phases)) {
          return plan.action_plan;
        }
        if (Array.isArray(plan.phases) && plan.phases.length > 0) {
          return { phases: plan.phases };
        }
      }

      return null;
    } catch (error) {
      console.error('Error creating structured plan:', error);
      return null;
    }
  };

  const handleBackClick = () => {
    if (username) {
      navigate(`/u/${username}`);
    } else {
      navigate('/');
    }
  };

  const handleShareLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading jump...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!progressiveResult) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{jumpTitle} - JumpinAI</title>
        <meta name="description" content={`View ${jumpTitle} on JumpinAI`} />
      </Helmet>

      <Navigation />

      <div className="min-h-screen scroll-snap-container bg-gradient-to-br from-background/95 via-background to-primary/5 dark:bg-gradient-to-br dark:from-black dark:via-gray-950/90 dark:to-gray-900/60 relative">
        {/* Premium floating background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[28rem] h-[28rem] bg-gradient-to-br from-primary/25 via-primary/15 to-primary/5 rounded-full blur-3xl animate-pulse opacity-60"></div>
          <div className="absolute -bottom-40 -left-40 w-[32rem] h-[32rem] bg-gradient-to-tr from-secondary/20 via-accent/10 to-secondary/5 rounded-full blur-3xl animate-pulse opacity-50" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[24rem] h-[24rem] bg-gradient-to-br from-accent/15 via-primary/10 to-transparent rounded-full blur-3xl animate-pulse opacity-40" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative w-full max-w-7xl mx-auto pt-24 pb-6 px-4 lg:px-6 space-y-6">
          {/* Enhanced Header */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-3xl blur-xl opacity-40"></div>
            <div className="relative glass backdrop-blur-xl border border-border/40 hover:border-primary/30 transition-all duration-500 rounded-3xl p-6 shadow-2xl bg-gradient-to-br from-background/60 to-background/30">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-secondary/4 rounded-3xl"></div>
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              
              <div className="relative z-10 space-y-4">
                <div className={`flex items-center gap-4 ${isOwner ? 'justify-between' : 'justify-end'}`}>
                  {isOwner && (
                    <Button
                      onClick={handleBackClick}
                      variant="ghost"
                      size="sm"
                      className="rounded-xl border border-border/40 bg-background/60 hover:bg-background/80 backdrop-blur-sm transition-all duration-300"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Profile
                    </Button>
                  )}

                  <Button
                    onClick={handleShareLink}
                    variant="ghost"
                    size="sm"
                    className="rounded-xl border border-border/40 bg-background/60 hover:bg-background/80 backdrop-blur-sm transition-all duration-300"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {jumpTitle}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Created on {new Date(jumpCreatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} at {new Date(jumpCreatedAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Jump Display - Read-only mode */}
          <ViewJumpDisplay 
            result={progressiveResult} 
            generationTimer={0}
            isPublicView={true}
          />
        </div>
      </div>

      <Footer />
    </>
  );
}
