import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import { getJumpById, UserJump } from "@/services/jumpService";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { generateJumpPDF } from '@/utils/pdfGenerator';
import { supabase } from '@/integrations/supabase/client';
import ProgressiveJumpDisplay from '@/components/ProgressiveJumpDisplay';
import type { ProgressiveResult } from '@/hooks/useProgressiveGeneration';
import { toast } from 'sonner';

export default function ViewJump() {
  const { jumpId } = useParams<{ jumpId: string }>();
  const navigate = useNavigate();
  const [jump, setJump] = useState<UserJump | null>(null);
  const [progressiveResult, setProgressiveResult] = useState<ProgressiveResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jumpId) {
      loadJumpData();
    }
  }, [jumpId]);

  const loadJumpData = async () => {
    if (!jumpId) return;

    try {
      setLoading(true);
      console.log('ViewJump: Fetching jump data for:', jumpId);

      // Fetch the jump
      const jumpData = await getJumpById(jumpId);
      if (!jumpData) {
        toast.error('Jump not found');
        navigate('/dashboard/jumps');
        return;
      }
      setJump(jumpData);

      // Fetch tool prompts for this jump
      const toolPromptsResult = await supabase.from('user_tool_prompts').select('*').eq('jump_id', jumpId);

      console.log('ViewJump: Components fetched:', {
        toolPrompts: toolPromptsResult.data?.length || 0
      });

      // Transform database tool-prompts to display format with complete data structure
      const transformedDbToolPrompts = (toolPromptsResult.data || []).map((dbToolPrompt: any) => {
        console.log('Transforming tool prompt:', dbToolPrompt.title);
        
        // Merge content object with top-level fields for complete data
        const content = dbToolPrompt.content || {};
        
        return {
          // Core identification
          id: dbToolPrompt.id,
          name: dbToolPrompt.tool_name || content.name || dbToolPrompt.title || 'Unnamed Tool',
          category: dbToolPrompt.category || content.category || 'General',
          
          // Description and URLs
          description: dbToolPrompt.description || content.description || 'No description available',
          website_url: dbToolPrompt.tool_url || content.website_url || content.url || '',
          
          // Usage information (CRITICAL for display)
          when_to_use: content.when_to_use || dbToolPrompt.use_cases?.[0] || 'Use as needed',
          why_this_tool: content.why_this_tool || 'Recommended for your project',
          how_to_integrate: content.how_to_integrate || 'Follow setup instructions',
          
          // Prompt data
          custom_prompt: dbToolPrompt.prompt_text || content.custom_prompt || '',
          prompt_instructions: dbToolPrompt.prompt_instructions || content.prompt_instructions || '',
          
          // Metadata
          alternatives: content.alternatives || [],
          skill_level: content.skill_level || dbToolPrompt.difficulty_level || 'Beginner',
          cost_model: content.cost_model || dbToolPrompt.cost_estimate || 'Varies',
          implementation_timeline: content.implementation_timeline || dbToolPrompt.setup_time || 'Quick setup',
          implementation_time: content.implementation_timeline || dbToolPrompt.setup_time || 'Quick setup',
          
          // Arrays
          use_cases: dbToolPrompt.use_cases || [],
          ai_tools: dbToolPrompt.ai_tools || [],
          features: dbToolPrompt.features || [],
          tags: dbToolPrompt.tags || [],
          
          // Keep all original fields for compatibility
          ...dbToolPrompt
        };
      });

      console.log('✅ Transformed', transformedDbToolPrompts.length, 'tool prompts');

      // For backward compatibility, also extract tools from comprehensive_plan if no tools in database
      const fallbackToolPrompts = transformedDbToolPrompts.length ? [] : extractToolsFromJump(jumpData);
      const allToolPrompts = [...transformedDbToolPrompts, ...fallbackToolPrompts];

      // Create structured_plan from comprehensive_plan if it exists
      const structuredPlan = createStructuredPlan(jumpData);

      // Transform the saved jump data into ProgressiveResult format
      const result: ProgressiveResult = {
        title: jumpData.title,
        fullTitle: jumpData.title,
        jumpNumber: extractJumpNumber(jumpData.title),
        jumpName: jumpData.title,
        full_content: jumpData.full_content,
        structured_plan: structuredPlan,
        comprehensive_plan: jumpData.comprehensive_plan,
        components: {
          toolPrompts: allToolPrompts,
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
        jumpId: jumpData.id
      };

      console.log('ViewJump: Transformed result:', result);
      setProgressiveResult(result);
    } catch (error) {
      console.error('ViewJump: Error loading jump data:', error);
      toast.error('Failed to load jump');
      // Set a minimal result on error to prevent crashes
      if (jump) {
        setProgressiveResult({
          title: jump?.title || 'Error Loading Jump',
          fullTitle: jump?.title || 'Error Loading Jump',
          jumpNumber: null,
          jumpName: jump?.title || 'Error Loading Jump',
          full_content: jump?.full_content || 'Failed to load jump content.',
          structured_plan: null,
          comprehensive_plan: null,
          components: {
            toolPrompts: [],
            workflows: [],
            blueprints: [],
            strategies: []
          },
          processing_status: {
            isComplete: true,
            stage: 'Error',
            currentTask: 'Failed to load',
            progress: 0
          },
          jumpId: jump?.id || null
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const extractJumpNumber = (title: string): number | null => {
    const match = title.match(/Jump #?(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  };

  const createStructuredPlan = (jump: UserJump): any => {
    try {
      // ✅ CRITICAL FIX: Use structured_plan directly if it exists (contains Step 3 phases with full details)
      if (jump.structured_plan && typeof jump.structured_plan === 'object') {
        const plan = jump.structured_plan as any;
        
        // If it already has phases array at root, return it as-is
        if (Array.isArray(plan.phases) && plan.phases.length > 0) {
          console.log('✅ Using structured_plan.phases directly:', plan.phases.length, 'phases found');
          return plan;
        }
        
        // If it has action_plan.phases, return that
        if (plan.action_plan?.phases) {
          console.log('✅ Using structured_plan.action_plan.phases');
          return plan.action_plan;
        }
      }

      // Fallback: Try comprehensive_plan
      if (jump.comprehensive_plan && typeof jump.comprehensive_plan === 'object') {
        const plan = jump.comprehensive_plan as any;
        
        // Check if comprehensive_plan has action_plan.phases
        if (plan.action_plan?.phases && Array.isArray(plan.action_plan.phases)) {
          console.log('✅ Using comprehensive_plan.action_plan.phases');
          return plan.action_plan;
        }
        
        // Check if phases are at root level
        if (Array.isArray(plan.phases) && plan.phases.length > 0) {
          console.log('✅ Using comprehensive_plan.phases at root');
          return { phases: plan.phases };
        }

        // Legacy fallback: Create basic phases from key sections
        console.warn('⚠️ No phases found, creating basic structure from sections');
        const phases = [];
        let phaseNumber = 1;
        
        if (plan.key_objectives) {
          phases.push({
            phase_number: phaseNumber++,
            title: "Key Objectives",
            description: Array.isArray(plan.key_objectives) ? plan.key_objectives.join('. ') : plan.key_objectives,
            duration: "Ongoing",
            objectives: Array.isArray(plan.key_objectives) ? plan.key_objectives : [plan.key_objectives],
            key_actions: [],
            milestones: []
          });
        }

        if (plan.resource_requirements) {
          phases.push({
            phase_number: phaseNumber++,
            title: "Resource Setup", 
            description: "Set up required tools and resources for implementation",
            duration: "1-2 weeks",
            objectives: ["Acquire and configure necessary tools"],
            key_actions: [],
            milestones: []
          });
        }

        if (phases.length > 0) {
          return {
            overview: plan.executiveSummary || plan.executive_summary || "Strategic implementation plan",
            phases: phases
          };
        }
      }

      console.warn('⚠️ No structured plan data found');
      return null;
    } catch (error) {
      console.error('❌ Error creating structured plan:', error);
      return null;
    }
  };

  const extractToolsFromJump = (jump: UserJump): any[] => {
    try {
      // Try to extract tools from comprehensive_plan
      if (jump.comprehensive_plan && typeof jump.comprehensive_plan === 'object') {
        const plan = jump.comprehensive_plan as any;
        
        // Check tools_prompts.recommended_ai_tools first (correct structure)
        if (plan.tools_prompts?.recommended_ai_tools) {
          return plan.tools_prompts.recommended_ai_tools.map((tool: any, index: number) => ({
            name: tool.tool || tool.name,
            description: tool.use_case || tool.description || 'AI tool for your transformation',
            category: tool.category || 'General',
            website_url: tool.website_url || tool.url,
            when_to_use: tool.when_to_use || tool.use_case || 'Use when needed for your project',
            why_this_tool: tool.why_this_tool || `${tool.tool || tool.name} provides powerful capabilities for your project`,
            how_to_integrate: tool.how_to_integrate || tool.integration_notes || 'Follow the platform\'s integration guide',
            alternatives: tool.alternatives || [],
            skill_level: tool.learning_curve || 'Beginner',
            cost_model: tool.cost_estimate || 'Free/Paid',
            implementation_time: tool.implementation_time || 'Quick setup'
          }));
        }
        
        // Fallback: check old structure for backwards compatibility
        if (plan.resource_requirements?.tools_needed) {
          return plan.resource_requirements.tools_needed.map((tool: any, index: number) => ({
            name: tool.name || tool,
            description: tool.description || 'AI tool for your transformation',
            category: tool.category || 'General',
            website_url: tool.website_url || tool.url,
            when_to_use: tool.when_to_use || 'Use when needed for your project',
            why_this_tool: tool.why_this_tool || 'Helps achieve your goals efficiently',
            how_to_integrate: tool.how_to_integrate || 'Follow integration guidelines',
            alternatives: tool.alternatives || [],
            skill_level: tool.skill_level || 'Beginner',
            cost_model: tool.cost_model || 'Varies',
            implementation_time: tool.implementation_time || 'Quick setup'
          }));
        }
      }

      return [];
    } catch (error) {
      console.error('Error extracting tools from jump:', error);
      return [];
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const downloadPlan = async () => {
    if (!jump || !progressiveResult) return;
    
    try {
      const jumpPDFData = {
        title: jump.title,
        summary: jump.summary || undefined,
        content: jump.full_content || '',
        createdAt: jump.created_at,
        structured_plan: progressiveResult.structured_plan,
        comprehensive_plan: progressiveResult.comprehensive_plan,
        components: progressiveResult.components
      };
      
      console.log('Generating PDF with data:', jumpPDFData);
      await generateJumpPDF(jumpPDFData);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading plan:', error);
      toast.error('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading your jump...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="glass border-0 ring-1 ring-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl bg-gradient-to-br from-background/80 via-card/60 to-primary/5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/dashboard/jumps')}
                variant="ghost"
                size="sm"
                className="rounded-xl border-0 ring-1 ring-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
              {jump?.title}
            </h1>
            {jump?.created_at && (
              <p className="text-sm text-muted-foreground">
                Created on {formatDate(jump.created_at)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20 whitespace-nowrap">
              AI Generated
            </span>
            <Button 
              onClick={downloadPlan}
              size="sm"
              className="gap-2 rounded-xl"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <ErrorBoundary>
        {progressiveResult ? (
          <ProgressiveJumpDisplay 
            result={progressiveResult} 
            generationTimer={0}
          />
        ) : (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <div className="text-center space-y-2">
              <p className="text-sm">Failed to load jump data</p>
              <Button 
                onClick={() => loadJumpData()} 
                variant="outline" 
                size="sm"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}

