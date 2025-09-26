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
      const [promptsResult, workflowsResult, blueprintsResult, strategiesResult] = await Promise.all([
        supabase.from('user_prompts').select('*').eq('jump_id', jump.id),
        supabase.from('user_workflows').select('*').eq('jump_id', jump.id),
        supabase.from('user_blueprints').select('*').eq('jump_id', jump.id),
        supabase.from('user_strategies').select('*').eq('jump_id', jump.id)
      ]);

      console.log('JumpDetailModal: Components fetched:', {
        prompts: promptsResult.data?.length || 0,
        workflows: workflowsResult.data?.length || 0,
        blueprints: blueprintsResult.data?.length || 0,
        strategies: strategiesResult.data?.length || 0
      });

      // Extract tools from comprehensive_plan or full_content
      const tools = extractToolsFromJump(jump);

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
          tools: tools,
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
        if (plan.resource_requirements?.tools_needed) {
          return plan.resource_requirements.tools_needed.map((tool: any, index: number) => ({
            name: tool.name || tool,
            description: tool.description || 'AI tool for your transformation',
            category: tool.category || 'General',
            website_url: tool.website_url || tool.url,
            when_to_use: tool.when_to_use || 'Use when needed for your project',
            why_this_tool: tool.why_this_tool || 'Helps achieve your goals efficiently'
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
            why_this_tool: `${tool} provides powerful capabilities for your project`
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">{jump?.title}</DialogTitle>
              {jump?.created_at && (
                <p className="text-sm text-muted-foreground mt-1">
                  Created on {formatDate(jump.created_at)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
                AI Generated
              </span>
              <Button 
                onClick={downloadPlan}
                size="sm"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ErrorBoundary>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : progressiveResult ? (
            <ProgressiveJumpDisplay 
              result={progressiveResult} 
              generationTimer={0}
            />
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Failed to load jump data
            </div>
          )}
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}