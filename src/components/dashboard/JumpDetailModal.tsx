import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { UserJump } from "@/services/jumpService";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { generateJumpPDF } from '@/utils/pdfGenerator';
import { supabase } from '@/integrations/supabase/client';
import ProgressiveJumpDisplay from '@/components/ProgressiveJumpDisplay';
import type { ProgressiveResult } from '@/hooks/useProgressiveGeneration';

interface JumpDetailModalProps {
  jump: UserJump | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function JumpDetailModal({ jump, isOpen, onClose }: JumpDetailModalProps) {
  const [progressiveResult, setProgressiveResult] = useState<ProgressiveResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && jump) {
      console.log('JumpDetailModal: Loading jump data for:', jump.id);
      loadJumpData();
    }
  }, [isOpen, jump]);

  const loadJumpData = async () => {
    if (!jump?.id) {
      console.log('JumpDetailModal: No jump ID provided');
      return;
    }

    try {
      setLoading(true);
      console.log('JumpDetailModal: Fetching data for jump ID:', jump.id);

      // Fetch all components for this jump in parallel
      const [toolsResult, promptsResult, workflowsResult, blueprintsResult, strategiesResult] = await Promise.all([
        supabase.from('user_tools').select('*').eq('jump_id', jump.id),
        supabase.from('user_prompts').select('*').eq('jump_id', jump.id),
        supabase.from('user_workflows').select('*').eq('jump_id', jump.id),
        supabase.from('user_blueprints').select('*').eq('jump_id', jump.id),
        supabase.from('user_strategies').select('*').eq('jump_id', jump.id)
      ]);

      console.log('JumpDetailModal: Components fetched:', {
        tools: toolsResult.data?.length || 0,
        prompts: promptsResult.data?.length || 0,
        workflows: workflowsResult.data?.length || 0,
        blueprints: blueprintsResult.data?.length || 0,
        strategies: strategiesResult.data?.length || 0
      });

      // Transform database tools to display format
      const transformedDbTools = (toolsResult.data || []).map((dbTool: any) => {
        // If tool_content exists, merge it with top-level fields
        const toolContent = dbTool.tool_content || {};
        return {
          id: dbTool.id,
          name: dbTool.title || toolContent.name || 'Unnamed Tool',
          description: dbTool.description || toolContent.description || 'No description available',
          category: dbTool.category || toolContent.category || 'General',
          website_url: toolContent.website_url || toolContent.url || toolContent.website,
          when_to_use: toolContent.when_to_use || toolContent.primary_use_case || 'Use as needed',
          why_this_tool: toolContent.why_this_tool || 'Recommended for your project',
          how_to_integrate: toolContent.how_to_integrate || toolContent.integration_notes || 'Follow setup instructions',
          alternatives: toolContent.alternatives || [],
          skill_level: toolContent.skill_level || dbTool.difficulty_level || 'Beginner',
          cost_model: toolContent.cost_model || dbTool.cost_estimate || 'Varies',
          implementation_time: toolContent.implementation_timeline || toolContent.implementation_time || dbTool.setup_time || 'Quick setup',
          // Include original database fields for compatibility
          ...dbTool
        };
      });

      // For backward compatibility, also extract tools from comprehensive_plan if no tools in database
      const fallbackTools = transformedDbTools.length ? [] : extractToolsFromJump(jump);
      const allTools = [...transformedDbTools, ...fallbackTools];

      // Create structured_plan from comprehensive_plan if it exists
      const structuredPlan = createStructuredPlan(jump);

      // Transform the saved jump data into ProgressiveResult format
      const result: ProgressiveResult = {
        title: jump.title,
        fullTitle: jump.title,
        jumpNumber: extractJumpNumber(jump.title),
        jumpName: jump.title,
        full_content: jump.full_content,
        structured_plan: structuredPlan,
        comprehensive_plan: jump.comprehensive_plan,
        components: {
          tools: allTools,
          prompts: promptsResult.data || [],
          workflows: workflowsResult.data || [],
          blueprints: blueprintsResult.data || [],
          strategies: strategiesResult.data || []
        },
        processing_status: {
          isComplete: true,
          stage: 'Complete',
          currentTask: 'Generated',
          progress: 100
        },
        jumpId: jump.id
      };

      console.log('JumpDetailModal: Transformed result:', result);
      setProgressiveResult(result);
    } catch (error) {
      console.error('JumpDetailModal: Error loading jump data:', error);
      // Set a minimal result on error to prevent crashes
      setProgressiveResult({
        title: jump?.title || 'Error Loading Jump',
        fullTitle: jump?.title || 'Error Loading Jump',
        jumpNumber: null,
        jumpName: jump?.title || 'Error Loading Jump',
        full_content: jump?.full_content || 'Failed to load jump content.',
        structured_plan: null,
        comprehensive_plan: null,
        components: {
          tools: [],
          prompts: [],
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
      if (jump.structured_plan) {
        return jump.structured_plan;
      }

      if (jump.comprehensive_plan && typeof jump.comprehensive_plan === 'object') {
        const plan = jump.comprehensive_plan as any;
        
        // Create phases from the comprehensive plan structure
        const phases = [];
        
        // Try to extract phases from the plan
        if (plan.action_plan?.phases) {
          return plan.action_plan;
        }

        // Create phases from key sections
        let phaseNumber = 1;
        
        if (plan.key_objectives) {
          phases.push({
            phase_number: phaseNumber++,
            title: "Key Objectives",
            description: Array.isArray(plan.key_objectives) ? plan.key_objectives.join('. ') : plan.key_objectives,
            duration: "Ongoing"
          });
        }

        if (plan.resource_requirements) {
          phases.push({
            phase_number: phaseNumber++,
            title: "Resource Setup", 
            description: "Set up required tools and resources for implementation",
            duration: "1-2 weeks"
          });
        }

        if (plan.success_metrics) {
          phases.push({
            phase_number: phaseNumber++,
            title: "Implementation & Monitoring",
            description: "Execute the plan while tracking success metrics",
            duration: "3-6 months"
          });
        }

        return {
          overview: plan.executive_summary || "Strategic implementation plan for your AI transformation",
          phases: phases
        };
      }

      return null;
    } catch (error) {
      console.error('Error creating structured plan:', error);
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

      // Fallback: try to extract from full_content
      if (jump.full_content) {
        // Simple extraction - look for tool mentions
        const toolMatches = jump.full_content.match(/(?:ChatGPT|Claude|Gemini|Midjourney|Canva|Notion|Zapier|Make|Airtable|ClickFunnels|WordPress|Shopify|Stripe|PayPal|Google Analytics|Mailchimp|ConvertKit|Buffer|Hootsuite|Figma|Adobe|Photoshop|Premiere Pro|After Effects|Final Cut Pro|DaVinci Resolve)/gi);
        
        if (toolMatches) {
          const uniqueTools = [...new Set(toolMatches)];
          return uniqueTools.map((tool, index) => ({
            name: tool,
            description: `AI-powered ${tool} for your transformation needs`,
            category: 'AI Tool',
            when_to_use: `Use ${tool} to enhance your productivity`,
            why_this_tool: `${tool} provides powerful capabilities for your project`,
            how_to_integrate: `Visit the ${tool} website and follow their setup guide`,
            alternatives: [],
            skill_level: 'Beginner',
            cost_model: 'Varies',
            implementation_time: 'Quick setup'
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
    } catch (error) {
      console.error('Error downloading plan:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] w-[98vw] sm:w-[95vw] md:w-full overflow-hidden flex flex-col p-0">
        {/* Mobile-Optimized Header */}
        <DialogHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3 border-b border-border/20 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0 space-y-1">
              <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold leading-tight pr-2">
                {jump?.title}
              </DialogTitle>
              {jump?.created_at && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Created on {formatDate(jump.created_at)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full border border-primary/20 whitespace-nowrap">
                AI Generated
              </span>
              <Button 
                onClick={downloadPlan}
                size="sm"
                className="gap-1.5 text-xs h-8 px-3"
              >
                <Download className="w-3 h-3" />
                <span className="hidden xs:inline sm:hidden md:inline">Download</span>
                <span className="xs:hidden sm:inline md:hidden">PDF</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Mobile-Optimized Content Area */}
        <div className="flex-1 overflow-y-auto">
          <ErrorBoundary>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Loading your jump...</p>
                </div>
              </div>
            ) : progressiveResult ? (
              <div className="p-3 sm:p-4 md:p-6 pt-2 sm:pt-3">
                <ProgressiveJumpDisplay 
                  result={progressiveResult} 
                  generationTimer={0}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground p-4">
                <div className="text-center space-y-2">
                  <p className="text-sm">Failed to load jump data</p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </ErrorBoundary>
        </div>
      </DialogContent>
    </Dialog>
  );
}