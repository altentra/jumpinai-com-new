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
    prompts: any[];
    workflows: any[];
    blueprints: any[];
    strategies: any[];
  };
  processing_status: ProcessingStatus;
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

  const processResponseInChunks = useCallback(async (rawResponse: GenerationResult): Promise<ProgressiveResult> => {
    const progressiveResult: ProgressiveResult = {
      jumpId: rawResponse.jumpId,
      title: rawResponse.jumpId ? 'AI Transformation Jump' : 'AI Transformation Jump',
      full_content: '',
      structured_plan: null,
      comprehensive_plan: null,
      components: {
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
    const components = rawResponse.components || { prompts: [], workflows: [], blueprints: [], strategies: [] };
    
    // Process prompts
    if (components.prompts && Array.isArray(components.prompts) && components.prompts.length > 0) {
      for (let i = 0; i < components.prompts.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400));
        progressiveResult.components.prompts.push(components.prompts[i]);
        progressiveResult.processing_status = {
          stage: 'Processing Prompts',
          progress: 40 + (i * 5),
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
          progress: 55 + (i * 5),
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
          progress: 70 + (i * 5),
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
          progress: 85 + (i * 3),
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
      currentTask: 'Sending request to AI...',
      isComplete: false
    });

    try {
      // Show initial empty structure immediately
      const emptyResult: ProgressiveResult = {
        title: 'AI Transformation Jump',
        full_content: '',
        components: {
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
        }
      };
      setResult(emptyResult);

      // Generate with OpenAI
      const rawResponse = await jumpinAIStudioService.generateJump(formData, userId);
      
      // Process the response progressively
      const finalResult = await processResponseInChunks(rawResponse);
      
      return finalResult;
    } catch (error) {
      console.error('Error in progressive generation:', error);
      setProcessingStatus({
        stage: 'Error',
        progress: 0,
        currentTask: 'Generation failed',
        isComplete: false
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [processResponseInChunks]);

  return {
    isGenerating,
    result,
    processingStatus,
    generateWithProgression
  };
};