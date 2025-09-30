import { useState, useCallback } from 'react';
import { jumpinAIStudioService, type StudioFormData, type GenerationResult } from '@/services/jumpinAIStudioService';
import { toast } from 'sonner';

export type ProcessingStatus = {
  stage: string;
  progress: number;
  currentTask: string;
  isComplete: boolean;
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
    tools: any[];
    prompts: any[];
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
        tools: [],
        prompts: [],
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

    // Process components one by one
    const components = rawResponse.components || { tools: [], prompts: [], workflows: [], blueprints: [], strategies: [] };
    
    // Process tools first
    if (components.tools && Array.isArray(components.tools) && components.tools.length > 0) {
      for (let i = 0; i < components.tools.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400));
        progressiveResult.components.tools.push(components.tools[i]);
        progressiveResult.processing_status = {
          stage: 'Processing Tools',
          progress: 40 + (i * 3),
          currentTask: `Processing AI tool ${i + 1} of ${components.tools.length}...`,
          isComplete: false
        };
        setProcessingStatus(progressiveResult.processing_status);
        setResult({ ...progressiveResult });
      }
    }
    
    // Process prompts
    if (components.prompts && Array.isArray(components.prompts) && components.prompts.length > 0) {
      for (let i = 0; i < components.prompts.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400));
        progressiveResult.components.prompts.push(components.prompts[i]);
        progressiveResult.processing_status = {
          stage: 'Processing Prompts',
          progress: 52 + (i * 3),
          currentTask: `Processing AI prompt ${i + 1} of ${components.prompts.length}...`,
          isComplete: false
        };
        setProcessingStatus(progressiveResult.processing_status);
        setResult({ ...progressiveResult });
      }
    }

    // Process workflows
    if (components.workflows && Array.isArray(components.workflows) && components.workflows.length > 0) {
      for (let i = 0; i < components.workflows.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400));
        progressiveResult.components.workflows.push(components.workflows[i]);
        progressiveResult.processing_status = {
          stage: 'Processing Workflows',
          progress: 64 + (i * 3),
          currentTask: `Processing workflow ${i + 1} of ${components.workflows.length}...`,
          isComplete: false
        };
        setProcessingStatus(progressiveResult.processing_status);
        setResult({ ...progressiveResult });
      }
    }

    // Process blueprints
    if (components.blueprints && Array.isArray(components.blueprints) && components.blueprints.length > 0) {
      for (let i = 0; i < components.blueprints.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400));
        progressiveResult.components.blueprints.push(components.blueprints[i]);
        progressiveResult.processing_status = {
          stage: 'Processing Blueprints',
          progress: 76 + (i * 3),
          currentTask: `Processing blueprint ${i + 1} of ${components.blueprints.length}...`,
          isComplete: false
        };
        setProcessingStatus(progressiveResult.processing_status);
        setResult({ ...progressiveResult });
      }
    }

    // Process strategies
    if (components.strategies && Array.isArray(components.strategies) && components.strategies.length > 0) {
      for (let i = 0; i < components.strategies.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400));
        progressiveResult.components.strategies.push(components.strategies[i]);
        progressiveResult.processing_status = {
          stage: 'Processing Strategies',
          progress: 88 + (i * 3),
          currentTask: `Processing strategy ${i + 1} of ${components.strategies.length}...`,
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
        plan: 'Building Strategic Plan',
        tools: 'Generating AI Tools',
        prompts: 'Crafting AI Prompts',
        workflows: 'Designing Workflows',
        blueprints: 'Building Blueprints',
        strategies: 'Developing Strategies'
      };
      
      const stepProgress: Record<string, number> = {
        naming: 5,
        overview: 19,
        plan: 32,
        tools: 46,
        prompts: 59,
        workflows: 73,
        blueprints: 86,
        strategies: 100
      };
      
      // Initial empty structure
      let jumpName = 'Generating Jump...';
      
      // Show initial empty structure immediately
      let progressiveResult: ProgressiveResult = {
        title: 'Generating Jump...',
        full_content: '',
        components: {
          tools: [],
          prompts: [],
          workflows: [],
          blueprints: [],
          strategies: []
        },
        processing_status: {
          stage: 'Generating',
          progress: 5,
          currentTask: 'AI is analyzing your requirements...',
          isComplete: false
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
            // STEP 1: Name only (5% - should be fast!)
            console.log('Processing naming step data:', stepData);
            jumpName = stepData.jumpName || 'AI Transformation Journey';
            
            // Display name immediately WITHOUT Jump# prefix
            progressiveResult.jumpName = jumpName;
            progressiveResult.title = jumpName; // Show name only, wait for jump_created event for full title
            
            progressiveResult.processing_status = {
              stage: 'Generating',
              progress: 5,
              currentTask: `${stepNames.naming} (${stepDuration}s)`,
              isComplete: false
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
            // STEP 2: Overview (19%)
            console.log('Processing overview step data:', stepData);
            
            // Extract overview data (Jump# and title already set in jump_created event)
            progressiveResult.full_content = stepData.executiveSummary || '';
            progressiveResult.structured_plan = stepData;
            progressiveResult.comprehensive_plan = stepData;
            
            // Update immediately - Overview is 19%
            progressiveResult.processing_status = {
              stage: 'Generating',
              progress: 19,
              currentTask: `${stepNames.overview} (${stepDuration}s)`,
              isComplete: false
            };
            progressiveResult.stepTimes = { ...progressiveResult.stepTimes, overview: stepDuration };
            setProcessingStatus(progressiveResult.processing_status);
            setResult({ ...progressiveResult });
            
          } else if (type === 'plan') {
            // STEP 3: Plan (32%)
            console.log('Processing plan step data:', stepData);
            if (stepData.structuredPlan) {
              progressiveResult.structured_plan = stepData.structuredPlan;
            }
            
            progressiveResult.processing_status = {
              stage: 'Generating',
              progress: 32,
              currentTask: `${stepNames.plan} (${stepDuration}s)`,
              isComplete: false
            };
            progressiveResult.stepTimes = { ...progressiveResult.stepTimes, plan: stepDuration };
            setProcessingStatus(progressiveResult.processing_status);
            setResult({ ...progressiveResult });
            
          } else if (type === 'tools') {
            // STEP 4: Tools (46%)
            console.log('Processing tools step data:', stepData);
            progressiveResult.components.tools = stepData.tools || [];
            
            // Update immediately - Tools is 46%
            const progress = 46;
            progressiveResult.processing_status = {
              stage: 'Generating',
              progress,
              currentTask: `${stepNames.tools} (${stepDuration}s)`,
              isComplete: false
            };
            progressiveResult.stepTimes = { ...progressiveResult.stepTimes, tools: stepDuration };
            setProcessingStatus(progressiveResult.processing_status);
            setResult({ ...progressiveResult });
            
          } else if (type === 'prompts') {
            // STEP 5: Prompts (59%)
            console.log('Processing prompts step data:', stepData);
            progressiveResult.components.prompts = stepData.prompts || [];
            
            // Update immediately - Prompts is 59%
            const progress = 59;
            progressiveResult.processing_status = {
              stage: 'Generating',
              progress,
              currentTask: `${stepNames.prompts} (${stepDuration}s)`,
              isComplete: false
            };
            progressiveResult.stepTimes = { ...progressiveResult.stepTimes, prompts: stepDuration };
            setProcessingStatus(progressiveResult.processing_status);
            setResult({ ...progressiveResult });
            
          } else if (type === 'workflows') {
            // STEP 6: Workflows (73%)
            console.log('Processing workflows step data:', stepData);
            progressiveResult.components.workflows = stepData.workflows || [];
            
            // Update immediately - Workflows is 73%
            const progress = 73;
            progressiveResult.processing_status = {
              stage: 'Generating',
              progress,
              currentTask: `${stepNames.workflows} (${stepDuration}s)`,
              isComplete: false
            };
            progressiveResult.stepTimes = { ...progressiveResult.stepTimes, workflows: stepDuration };
            setProcessingStatus(progressiveResult.processing_status);
            setResult({ ...progressiveResult });
            
          } else if (type === 'blueprints') {
            // STEP 7: Blueprints (86%)
            console.log('Processing blueprints step data:', stepData);
            progressiveResult.components.blueprints = stepData.blueprints || [];
            
            // Update immediately - Blueprints is 86%
            const progress = 86;
            progressiveResult.processing_status = {
              stage: 'Generating',
              progress,
              currentTask: `${stepNames.blueprints} (${stepDuration}s)`,
              isComplete: false
            };
            progressiveResult.stepTimes = { ...progressiveResult.stepTimes, blueprints: stepDuration };
            setProcessingStatus(progressiveResult.processing_status);
            setResult({ ...progressiveResult });
            
          } else if (type === 'strategies') {
            // STEP 8: Strategies (100%)
            console.log('Processing strategies step data:', stepData);
            progressiveResult.components.strategies = stepData.strategies || [];
            
            // Update immediately - Strategies is 100%
            const progress = 100;
            progressiveResult.processing_status = {
              stage: 'Generating',
              progress,
              currentTask: `${stepNames.strategies} (${stepDuration}s)`,
              isComplete: false
            };
            progressiveResult.stepTimes = { ...progressiveResult.stepTimes, strategies: stepDuration };
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
          tools: [],
          prompts: [],
          workflows: [],
          blueprints: [],
          strategies: []
        },
        processing_status: {
          stage: 'Complete',
          progress: 100,
          currentTask: `Jump generation complete! Total: ${totalTime}s`,
          isComplete: true
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