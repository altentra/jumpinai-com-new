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
      title: rawResponse.jumpId ? 'AI Transformation Jump' : 'AI Transformation Jump',
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
      
      // Show initial empty structure immediately
      let progressiveResult: ProgressiveResult = {
        title: 'AI Transformation Jump',
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

      // Generate with real-time step progress
      const rawResponse = await jumpinAIStudioService.generateJump(
        formData, 
        userId,
        // Real-time progress callback
        (step: number, stepData: any) => {
          console.log(`Step ${step} completed:`, stepData);
          
          // Calculate step completion time
          const stepEndTime = Date.now();
          const stepDuration = Math.round((stepEndTime - currentStepStartTime) / 1000);
          stepTimes[step.toString()] = stepDuration;
          currentStepStartTime = stepEndTime; // Reset for next step
          
          const progressMap = {
            1: { progress: 16, task: `Generated strategic overview and comprehensive plan (${stepDuration}s)` },
            2: { progress: 33, task: `Generated AI tools recommendations (${stepDuration}s)` },
            3: { progress: 50, task: `Generated AI prompts for your transformation (${stepDuration}s)` },
            4: { progress: 66, task: `Generated workflow processes and procedures (${stepDuration}s)` },
            5: { progress: 83, task: `Generated implementation blueprints (${stepDuration}s)` },
            6: { progress: 100, task: `Generated strategic frameworks - Complete! (${stepDuration}s)` }
          };
          
          const stepProgress = progressMap[step] || { progress: Math.round((step / 6) * 100), task: `Completed step ${step} (${stepDuration}s)` };
          
          // Update progressive result with new data
          if (step === 1 && stepData.full_content) {
            progressiveResult.jumpId = stepData.jumpId;
            progressiveResult.full_content = stepData.full_content;
            progressiveResult.structured_plan = stepData.structured_plan;
            progressiveResult.comprehensive_plan = stepData.comprehensive_plan;
          }
          
          if (stepData.components) {
            if (stepData.components.tools && stepData.components.tools.length > 0) {
              progressiveResult.components.tools = stepData.components.tools;
            }
            if (stepData.components.prompts && stepData.components.prompts.length > 0) {
              progressiveResult.components.prompts = stepData.components.prompts;
            }
            if (stepData.components.workflows && stepData.components.workflows.length > 0) {
              progressiveResult.components.workflows = stepData.components.workflows;
            }
            if (stepData.components.blueprints && stepData.components.blueprints.length > 0) {
              progressiveResult.components.blueprints = stepData.components.blueprints;
            }
            if (stepData.components.strategies && stepData.components.strategies.length > 0) {
              progressiveResult.components.strategies = stepData.components.strategies;
            }
          }
          
          // Update status and timing
          progressiveResult.processing_status = {
            stage: `Step ${step} Complete`,
            progress: stepProgress.progress,
            currentTask: stepProgress.task,
            isComplete: step === 6
          };
          progressiveResult.stepTimes = { ...stepTimes };
          
          setProcessingStatus(progressiveResult.processing_status);
          setResult({ ...progressiveResult });
        }
      );
      
      // Calculate total generation time
      const totalTime = Object.values(stepTimes).reduce((sum, time) => sum + time, 0);
      
      // Final update with complete data
      const finalResult: ProgressiveResult = {
        jumpId: rawResponse.jumpId,
        title: 'AI Transformation Jump',
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