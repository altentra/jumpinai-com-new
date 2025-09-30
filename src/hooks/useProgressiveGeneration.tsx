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
        overview: 'Creating Overview & Strategic Plan',
        tools: 'Generating AI Tools Recommendations',
        prompts: 'Crafting AI Prompts',
        workflows: 'Designing Workflow Processes',
        blueprints: 'Building Implementation Blueprints',
        strategies: 'Developing Strategic Frameworks'
      };
      
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
          const progress = Math.min(100, (step / 7) * 100);
          
          // Update progressive result with new data
          if (type === 'overview') {
            progressiveResult.jumpId = stepData.jumpId;
            progressiveResult.jumpName = stepData.jumpName || 'AI Transformation Journey';
            progressiveResult.jumpNumber = stepData.jumpNumber;
            progressiveResult.fullTitle = stepData.fullTitle;
            progressiveResult.title = stepData.fullTitle || progressiveResult.jumpName;
            progressiveResult.full_content = stepData.executiveSummary || '';
            progressiveResult.structured_plan = stepData;
            progressiveResult.comprehensive_plan = stepData;
          } else if (type === 'tools') {
            progressiveResult.components.tools = stepData.tools || [];
          } else if (type === 'prompts') {
            progressiveResult.components.prompts = stepData.prompts || [];
          } else if (type === 'workflows') {
            progressiveResult.components.workflows = stepData.workflows || [];
          } else if (type === 'blueprints') {
            progressiveResult.components.blueprints = stepData.blueprints || [];
          } else if (type === 'strategies') {
            progressiveResult.components.strategies = stepData.strategies || [];
          }
          
          // Update status and timing
          progressiveResult.processing_status = {
            stage: type === 'complete' ? 'Complete' : 'Generating',
            progress,
            currentTask: `${taskName} (${stepDuration}s)`,
            isComplete: type === 'complete'
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