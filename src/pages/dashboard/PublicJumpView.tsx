import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Heart, Upload, Calendar, Eye } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/hooks/use-toast';
import { jumpLikesService } from '@/services/jumpLikesService';
import ViewJumpDisplay from '@/components/ViewJumpDisplay';
import type { ProgressiveResult } from '@/hooks/useProgressiveGeneration';

export default function PublicJumpView() {
  const { jumpId, username } = useParams<{ jumpId: string; username: string }>();
  const navigate = useNavigate();
  const { user } = useOptimizedAuth();
  const { toast } = useToast();
  const [jump, setJump] = useState<any>(null);
  const [progressiveResult, setProgressiveResult] = useState<ProgressiveResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (jumpId) {
      loadJump();
    }
  }, [jumpId]);

  useEffect(() => {
    if (user && jumpId) {
      checkIfLiked();
    }
  }, [user?.id, jumpId]);

  const loadJump = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('user_jumps')
        .select('*')
        .eq('id', jumpId)
        .eq('is_public', true)
        .single();

      if (error) throw error;
      
      setJump(data);
      setLikesCount(data.likes_count || 0);

      // Fetch tool prompts for this jump
      const { data: toolPromptsData } = await supabase
        .from('user_tool_prompts')
        .select('*')
        .eq('jump_id', jumpId);

      // Transform to ProgressiveResult format
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
          use_cases: dbToolPrompt.use_cases || [],
          ai_tools: dbToolPrompt.ai_tools || [],
          features: dbToolPrompt.features || [],
          tags: dbToolPrompt.tags || [],
          ...dbToolPrompt
        };
      });

      // Create structured plan from data
      const structuredPlan = createStructuredPlan(data);

      const result: ProgressiveResult = {
        title: data.title,
        fullTitle: data.title,
        jumpNumber: extractJumpNumber(data.title),
        jumpName: data.title,
        full_content: data.full_content,
        structured_plan: structuredPlan,
        comprehensive_plan: data.comprehensive_plan,
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
        jumpId: data.id
      };

      setProgressiveResult(result);

      // Track view only once
      if (!hasTrackedView.current) {
        hasTrackedView.current = true;
        await supabase
          .from('user_jumps')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', jumpId);
      }
    } catch (error) {
      console.error('Error loading jump:', error);
      navigate('/404');
    } finally {
      setIsLoading(false);
    }
  };

  const extractJumpNumber = (title: string): number | null => {
    const match = title.match(/Jump #?(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  };

  const createStructuredPlan = (jumpData: any): any => {
    try {
      if (jumpData.structured_plan && typeof jumpData.structured_plan === 'object') {
        const plan = jumpData.structured_plan as any;
        if (Array.isArray(plan.phases) && plan.phases.length > 0) {
          return plan;
        }
        if (plan.action_plan?.phases) {
          return plan.action_plan;
        }
      }

      if (jumpData.comprehensive_plan && typeof jumpData.comprehensive_plan === 'object') {
        const plan = jumpData.comprehensive_plan as any;
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

  const checkIfLiked = async () => {
    if (!user || !jumpId) return;
    const hasLiked = await jumpLikesService.hasUserLiked(jumpId, user.id);
    setIsLiked(hasLiked);
  };

  const handleLikeToggle = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like jumps"
      });
      return;
    }

    if (!jumpId) return;

    // Optimistic update
    if (isLiked) {
      setIsLiked(false);
      setLikesCount(prev => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
    }

    try {
      if (isLiked) {
        await jumpLikesService.unlikeJump(jumpId, user.id);
      } else {
        await jumpLikesService.likeJump(jumpId, user.id);
      }
    } catch (error: any) {
      // Revert on error
      if (isLiked) {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      } else {
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/jump/${jumpId}/public/${username}`;
    const shareData = {
      title: jump?.title || 'Jump',
      text: `Check out this Jump: ${jump?.title || 'Jump'}`,
      url: url
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: 'Link copied to clipboard!' });
      } catch (error) {
        toast({ title: 'Failed to copy link', variant: 'destructive' });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!jump || !progressiveResult) {
    return null;
  }

  const displayTitle = jump.title.replace(/^Jump\s*#\d+\s*[:\-–]\s*/i, '');

  return (
    <>
      <Helmet>
        <title>{displayTitle} - JumpinAI</title>
        <meta name="description" content={jump.summary || `View this Jump on JumpinAI`} />
      </Helmet>

      <div className="max-w-5xl mx-auto">
        {/* Header with back button and actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/dashboard/profile/${username}`)}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{jump.views_count || 0}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${
                isLiked 
                  ? 'text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20' 
                  : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'
              }`}
              onClick={handleLikeToggle}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Jump title and date */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{displayTitle}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {new Date(jump.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Jump content - read-only mode */}
        <ViewJumpDisplay 
          result={progressiveResult} 
          generationTimer={0}
          isPublicView={true}
        />
      </div>
    </>
  );
}
