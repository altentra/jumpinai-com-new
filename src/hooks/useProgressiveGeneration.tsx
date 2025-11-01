import { useState, useCallback } from 'react';
import { jumpinAIStudioService, type StudioFormData, type GenerationResult } from '@/services/jumpinAIStudioService';
import { toast } from 'sonner';

export type ProcessingStatus = {
  stage: string;
  progress: number;
  currentTask: string;
  isComplete: boolean;
  currentStep?: string; // Track which step is currently generating: 'naming', 'overview', 'plan', 'tool_prompts'
};

export type ProgressiveResult = {
  jumpId?: string;
  jumpName?: string;
  jumpNumber?: number;
  fullTitle?: string;
  title: string;
  full_content: string;
  structured_plan?: any;
  comprehensive_plan?: any;
  components: {
    toolPrompts: any[];
    plan?: any;
    workflows: any[];
    blueprints: any[];
    strategies: any[];
  };
  processing_status: ProcessingStatus;
  stepTimes?: { [key: string]: number };
};

export const useProgressiveGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ProgressiveResult | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    stage: '',
    progress: 0,
    currentTask: '',
    isComplete: false
  });
  const [stepStartTimes, setStepStartTimes] = useState<{ [key: string]: number }>({});

  const processResponseInChunks = useCallback(async (rawResponse: GenerationResult): Promise<ProgressiveResult> => {
    const progressiveResult: ProgressiveResult = {
      jumpId: rawResponse.jumpId,
      jumpName: rawResponse.jumpName,
      jumpNumber: rawResponse.jumpNumber,
      fullTitle: rawResponse.fullTitle,
      title: rawResponse.fullTitle || 'AI Transformation Jump',
      full_content: '',
      structured_plan: null,
      comprehensive_plan: null,
      components: {
        toolPrompts: [],
        plan: null,
        workflows: [],
        blueprints: [],
        strategies: []
      },
      processing_status: {
        stage: 'Processing Response',
        progress: 0,
        currentTask: 'Analyzing OpenAI response...',
        isComplete: false
      }
    };

    // Update initial status
    setProcessingStatus(progressiveResult.processing_status);
    setResult({ ...progressiveResult });

    // Process full content first
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UI update
    progressiveResult.full_content = rawResponse.fullContent || '';
    progressiveResult.processing_status = {
      stage: 'Processing Content',
      progress: 15,
      currentTask: 'Extracting strategic action plan...',
      isComplete: false
    };
    setProcessingStatus(progressiveResult.processing_status);
    setResult({ ...progressiveResult });

    // Process structured plan
    await new Promise(resolve => setTimeout(resolve, 300));
    progressiveResult.structured_plan = rawResponse.structuredPlan;
    progressiveResult.processing_status = {
      stage: 'Processing Structure',
      progress: 25,
      currentTask: 'Building implementation phases...',
      isComplete: false
    };
    setProcessingStatus(progressiveResult.processing_status);
    setResult({ ...progressiveResult });

    // Process comprehensive plan
    await new Promise(resolve => setTimeout(resolve, 300));
    progressiveResult.comprehensive_plan = rawResponse.comprehensivePlan;
    progressiveResult.processing_status = {
      stage: 'Processing Strategy',
      progress: 35,
      currentTask: 'Analyzing success metrics and risks...',
      isComplete: false
    };
    setProcessingStatus(progressiveResult.processing_status);
    setResult({ ...progressiveResult });

    // Process tool-prompts only (workflows/blueprints/strategies removed)
    const components = rawResponse.components || { toolPrompts: [] };
    
    if (components.toolPrompts && Array.isArray(components.toolPrompts) && components.toolPrompts.length > 0) {
      for (let i = 0; i < components.toolPrompts.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400));
        progressiveResult.components.toolPrompts.push(components.toolPrompts[i]);
        progressiveResult.processing_status = {
          stage: 'Processing Tools & Prompts',
          progress: 40 + (i * 10),
          currentTask: `Processing tool & prompt ${i + 1} of ${components.toolPrompts.length}...`,
          isComplete: false
        };
        setProcessingStatus(progressiveResult.processing_status);
        setResult({ ...progressiveResult });
      }
    }

    // Final completion
    await new Promise(resolve => setTimeout(resolve, 500));
    progressiveResult.processing_status = {
      stage: 'Complete',
      progress: 100,
      currentTask: 'Jump generation complete!',
      isComplete: true
    };
    setProcessingStatus(progressiveResult.processing_status);
    setResult({ ...progressiveResult });

    return progressiveResult;
  }, []);

  const generateWithProgression = useCallback(async (
    formData: StudioFormData,
    userId?: string
  ): Promise<ProgressiveResult> => {
    setIsGenerating(true);
    setResult(null);
    setProcessingStatus({
      stage: 'Generating',
      progress: 0,
      currentTask: 'Initializing AI generation...',
      isComplete: false
    });

    try {
      // Initialize timing tracking
      const stepTimes: { [key: string]: number } = {};
      let currentStepStartTime = Date.now();
      
      const stepNames: Record<string, string> = {
        naming: 'Generating Jump Name',
        overview: 'Creating Overview',
        comprehensive: 'Building Strategic Plan',
        plan: 'Building Strategic Plan',
        tool_prompts: 'Generating Tools & Prompts',
        tools: 'Generating Tools & Prompts'
      };
      
      const stepProgress: Record<string, number> = {
        naming: 10,
        overview: 30,
        comprehensive: 60,
        plan: 60,
        tool_prompts: 100,
        tools: 100
      };
      
      // Initial empty structure
      let jumpName = 'Generating Jump...';
      
      // Show initial empty structure immediately
      let progressiveResult: ProgressiveResult = {
        title: 'Generating Jump...',
        full_content: '',
        components: {
          toolPrompts: [],
          plan: null,
          workflows: [],  // Keep for type compatibility but won't be used
          blueprints: [], // Keep for type compatibility but won't be used
          strategies: []  // Keep for type compatibility but won't be used
        },
        processing_status: {
          stage: 'Generating',
          progress: 5,
          currentTask: 'Generating Jump Name...',
          isComplete: false,
          currentStep: 'naming'
        },
        stepTimes: {}
      };
      setResult(progressiveResult);

      // Generate with real-time streaming progress
      const rawResponse = await jumpinAIStudioService.generateJumpStreaming(
        formData, 
        userId,
        // Real-time progress callback
        (step: number, type: string, stepData: any) => {
          console.log(`Step ${step} (${type}) completed:`, stepData);
          
          // Calculate step completion time
          const stepEndTime = Date.now();
          const stepDuration = Math.round((stepEndTime - currentStepStartTime) / 1000);
          stepTimes[type] = stepDuration;
          currentStepStartTime = stepEndTime;
          
          const taskName = stepNames[type] || `Processing ${type}...`;
          const progress = stepProgress[type] || Math.min(100, (step / 8) * 100);
          
          // Update progressive result with new data
          if (type === 'naming') {
            // STEP 1: Name complete - show it and start overview
            console.log('Processing naming step data:', stepData);
            jumpName = stepData.jumpName || 'AI Transformation Journey';
            
            // Display name immediately WITHOUT Jump# prefix
            progressiveResult.jumpName = jumpName;
            progressiveResult.title = jumpName; // Show name only, wait for jump_created event for full title
            
            progressiveResult.processing_status = {
              stage: 'Generating',
              progress: 10,
              currentTask: `Name has been generated (${stepDuration}s). Generating Overview...`,
              isComplete: false,
              currentStep: 'overview'
            };
            progressiveResult.stepTimes = { naming: stepDuration };
            setProcessingStatus(progressiveResult.processing_status);
            setResult({ ...progressiveResult });
            
          } else if (type === 'jump_created') {
            // IMMEDIATE UPDATE: Jump created with Jump# formatting right after naming
            console.log('Jump created callback:', stepData);
            progressiveResult.jumpId = stepData.jumpId;
            progressiveResult.jumpNumber = stepData.jumpNumber;
            progressiveResult.fullTitle = stepData.fullTitle;
            progressiveResult.title = stepData.fullTitle; // Update with full "Jump #X: Name"
            
            // Update UI immediately
            setResult({ ...progressiveResult });
            
          } else if (type === 'overview') {
            // STEP 2: Overview complete - show it and start plan
            console.log('Processing overview step data:', stepData);
            
            // Store the complete overview data with proper structure for ComprehensiveJumpDisplay
            progressiveResult.comprehensive_plan = {
              title: jumpName,
              executive_summary: stepData.executive_summary || '',
              overview: stepData.overview || {
                vision_statement: '',
                transformation_scope: '',
                expected_outcomes: [],
                timeline_overview: ''
              },
              analysis: stepData.analysis || {
                current_state: {
                  strengths: [],
                  weaknesses: [],
                  opportunities: [],
                  threats: []
                },
                gap_analysis: [],
                readiness_assessment: {
                  score: 0,
                  factors: []
                },
                market_context: ''
              },
              action_plan: { phases: [] } // Will be filled in step 3
            };
            
            // Build full overview content from all sections for display
            let overviewText = '';
            if (stepData.executive_summary) overviewText += `## Executive Summary\n\n${stepData.executive_summary}\n\n`;
            if (stepData.overview) {
              overviewText += `## Vision\n\n${stepData.overview.vision_statement}\n\n`;
              overviewText += `## Transformation Scope\n\n${stepData.overview.transformation_scope}\n\n`;
              if (stepData.overview.expected_outcomes?.length) {
                overviewText += `## Expected Outcomes\n\n`;
                stepData.overview.expected_outcomes.forEach((o: string) => overviewText += `- ${o}\n`);
                overviewText += '\n';
              }
            }
            if (stepData.analysis) {
              if (stepData.analysis.current_state) {
                if (stepData.analysis.current_state.strengths?.length) {
                  overviewText += `## Strengths\n`;
                  stepData.analysis.current_state.strengths.forEach((s: string) => overviewText += `- ${s}\n`);
                  overviewText += '\n';
                }
                if (stepData.analysis.current_state.opportunities?.length) {
                  overviewText += `## Opportunities\n`;
                  stepData.analysis.current_state.opportunities.forEach((o: string) => overviewText += `- ${o}\n`);
                  overviewText += '\n';
                }
              }
            }
            
            progressiveResult.full_content = overviewText.trim();
            
            progressiveResult.processing_status = {
              stage: 'Generating',
              progress: 30,
              currentTask: `Overview has been generated (${stepDuration}s). Generating Plan...`,
              isComplete: false,
              currentStep: 'plan'
            };
            progressiveResult.stepTimes = { ...progressiveResult.stepTimes, overview: stepDuration };
            setProcessingStatus(progressiveResult.processing_status);
            setResult({ ...progressiveResult });
            
          } else if (type === 'comprehensive' || type === 'plan') {
            // STEP 3: Plan complete - show it and start tools
            console.log('📋 Received strategic action plan:', stepData);
            
            // Store the plan data and update comprehensive_plan with action_plan
            progressiveResult.structured_plan = stepData;
            progressiveResult.components.plan = stepData;
            
            // Update comprehensive_plan with the action plan
            if (progressiveResult.comprehensive_plan) {
              progressiveResult.comprehensive_plan.action_plan = stepData;
            }
            
            progressiveResult.processing_status = {
              stage: 'Generating',
              progress: 60,
              currentTask: `Plan has been generated (${stepDuration}s). Generating Tools & Prompts...`,
              isComplete: false,
              currentStep: 'tool_prompts'
            };
            progressiveResult.stepTimes = { ...progressiveResult.stepTimes, comprehensive: stepDuration };
            setProcessingStatus(progressiveResult.processing_status);
            setResult({ ...progressiveResult });
            
          } else if (type === 'tool_prompts' || type === 'tools') {
            // STEP 4: Tools & Prompts complete
            console.log('Processing tool-prompts step data:', stepData);
            progressiveResult.components.toolPrompts = stepData.tool_prompts || stepData.tools || [];
            
            const progress = 100;
            progressiveResult.processing_status = {
              stage: 'Generating',
              progress,
              currentTask: `Tools & Prompts have been generated (${stepDuration}s). Finalizing...`,
              isComplete: false,
              currentStep: 'complete'
            };
            progressiveResult.stepTimes = { ...progressiveResult.stepTimes, tool_prompts: stepDuration };
            setProcessingStatus(progressiveResult.processing_status);
            setResult({ ...progressiveResult });
            
          } else if (type === 'complete') {
            // Generation complete
            console.log('All steps complete');
            progressiveResult.jumpId = stepData.jumpId;
            progressiveResult.jumpNumber = stepData.jumpNumber;
            progressiveResult.fullTitle = stepData.fullTitle;
            progressiveResult.title = stepData.fullTitle;
            setResult({ ...progressiveResult });
            
          }
        }
      );
      
      // Calculate total generation time
      const totalTime = Object.values(stepTimes).reduce((sum, time) => sum + time, 0);
      
      // Final update with complete data
      const finalResult: ProgressiveResult = {
        jumpId: rawResponse.jumpId,
        jumpName: rawResponse.jumpName,
        jumpNumber: rawResponse.jumpNumber,
        fullTitle: rawResponse.fullTitle,
        title: rawResponse.fullTitle || 'AI Transformation Jump',
        full_content: rawResponse.fullContent,
        structured_plan: rawResponse.structuredPlan,
        comprehensive_plan: rawResponse.comprehensivePlan,
        components: rawResponse.components || {
          toolPrompts: [],
          workflows: [],
          blueprints: [],
          strategies: []
        },
        processing_status: {
          stage: 'Complete',
          progress: 100,
          currentTask: `Jump has been created (${totalTime}s)`,
          isComplete: true,
          currentStep: 'complete'
        },
        stepTimes: stepTimes
      };
      
      setResult(finalResult);
      setProcessingStatus(finalResult.processing_status);
      
      return finalResult;
    } catch (error) {
      setProcessingStatus({
        stage: 'Error',
        progress: 0,
        currentTask: `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isComplete: false
      });
      throw error;
    } finally {
      console.log('Generation process finished, setting isGenerating to false');
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    result,
    processingStatus,
    generateWithProgression
  };
};