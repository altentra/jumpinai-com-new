import { supabase } from '@/integrations/supabase/client';
import { createJump } from './jumpService';
import { userProfileService } from './userProfileService';
import { jumpNamingService } from '@/utils/jumpNamingService';

export interface StudioFormData {
  goals: string;
  challenges: string;
  industry: string;
  aiExperience: string;
  urgency: string;
  budget: string;
}

export interface GenerationResult {
  jumpId?: string;
  jumpName?: string;
  jumpNumber?: number;
  fullTitle?: string;
  fullContent: string;
  structuredPlan?: any;
  comprehensivePlan?: any;
  components?: {
    tools: any[];
    prompts: any[];
    workflows: any[];
    blueprints: any[];
    strategies: any[];
  };
}

export const jumpinAIStudioService = {
  // SECURITY: Save form data ONLY for authenticated users with verified userId
  async saveFormData(formData: StudioFormData, userId: string): Promise<void> {
    if (!userId) {
      console.error('SECURITY: Attempted to save form data without valid userId');
      throw new Error('User ID required for saving form data');
    }
    
    try {
      console.log('Saving form data for authenticated user:', userId);
      
      // SECURITY: All data is tied to specific authenticated user
      const profileData = {
        currentRole: 'Studio User',
        industry: formData.industry,
        experienceLevel: 'intermediate',
        aiKnowledge: formData.aiExperience,
        goals: formData.goals,
        challenges: formData.challenges,
        timeCommitment: formData.urgency,
        budget: formData.budget,
      };

      // SECURITY: userProfileService.createProfile enforces RLS policies
      await userProfileService.createProfile(profileData, userId);
      console.log('Form data saved successfully for user:', userId);
    } catch (error) {
      console.error('Error saving form data:', error);
      throw error;
    }
  },

  // Generate Jump in AI using the 6-step approach
  async generateJump(formData: StudioFormData, userId?: string, onProgress?: (step: number, data: any) => void): Promise<GenerationResult> {
    try {
      console.log('Starting 6-step Jump generation with data:', formData);

      // Initialize the final result
      let finalResult: GenerationResult = {
        jumpId: undefined,
        fullContent: '',
        structuredPlan: null,
        comprehensivePlan: null,
        components: {
          tools: [],
          prompts: [],
          workflows: [],
          blueprints: [],
          strategies: []
        }
      };

      let jumpId: string | undefined;
      let overviewContent = '';

      // Step 1: Generate Overview & Plan
      console.log('🚀 Step 1: Generating Overview & Plan...');
      const step1Data = await this.executeStep(1, formData, '');
      
      if (step1Data.success) {
        finalResult.fullContent = step1Data.full_content || '';
        finalResult.structuredPlan = step1Data.structured_plan;
        finalResult.comprehensivePlan = step1Data.comprehensive_plan;
        overviewContent = step1Data.full_content || '';

        // Generate jump name and number
        const jumpNameInfo = await jumpNamingService.generateFullJumpTitle(formData, userId);
        finalResult.jumpName = jumpNameInfo.name;
        finalResult.jumpNumber = jumpNameInfo.number;
        finalResult.fullTitle = jumpNameInfo.fullTitle;
        
        console.log('Generated jump name info:', jumpNameInfo);

        // Save the jump to database if user is logged in
        if (userId && step1Data.full_content) {
          try {
            console.log('Saving jump to database for user:', userId);
            await this.saveFormData(formData, userId);

            const jumpData = {
              title: jumpNameInfo.fullTitle, // Use generated title instead of extracted
              summary: this.extractSummary(step1Data.full_content),
              full_content: step1Data.full_content,
              structured_plan: step1Data.structured_plan,
              comprehensive_plan: step1Data.comprehensive_plan,
              jump_type: 'studio_generated',
              status: 'active',
              completion_percentage: 20
            };

            const createdJump = await createJump(jumpData);
            jumpId = createdJump?.id;
            finalResult.jumpId = jumpId;
            console.log('Created Jump with ID:', jumpId, 'and title:', jumpNameInfo.fullTitle);
          } catch (saveError) {
            console.error('Error saving jump to database:', saveError);
          }
        } else if (!userId) {
          // For guest users, still generate the name for display
          console.log('Guest user - showing generated jump name:', jumpNameInfo.fullTitle);
        }

        // Report progress
        if (onProgress) {
          onProgress(1, { 
            ...step1Data, 
            jumpId,
            jumpName: finalResult.jumpName,
            jumpNumber: finalResult.jumpNumber,
            fullTitle: finalResult.fullTitle
          });
        }
      } else {
        throw new Error(`Step 1 failed: ${step1Data.error}`);
      }

      // Step 2: Generate Tools
      console.log('🚀 Step 2: Generating Tools...');
      const step2Data = await this.executeStep(2, formData, overviewContent);
      
      if (step2Data.success && step2Data.components?.tools) {
        finalResult.components.tools = step2Data.components.tools;
        
        // Update comprehensive_plan with tools and save to database
        if (userId && jumpId) {
          // Update the comprehensive_plan to include tools
          const updatedComprehensivePlan = {
            ...finalResult.comprehensivePlan,
            tools_prompts: {
              ...finalResult.comprehensivePlan?.tools_prompts,
              recommended_ai_tools: step2Data.components.tools
            }
          };
          
          finalResult.comprehensivePlan = updatedComprehensivePlan;
          
          // Update the jump in database with tools included in comprehensive_plan
          await supabase
            .from('user_jumps')
            .update({ comprehensive_plan: updatedComprehensivePlan })
            .eq('id', jumpId);
            
          await this.updateJumpProgress(jumpId, 33);
          console.log('Updated comprehensive_plan with tools for jump:', jumpId);
        }

        if (onProgress) {
          onProgress(2, step2Data);
        }
      }

      // Step 3: Generate Prompts
      console.log('🚀 Step 3: Generating Prompts...');
      const step3Data = await this.executeStep(3, formData, overviewContent);
      
      if (step3Data.success && step3Data.components?.prompts) {
        finalResult.components.prompts = step3Data.components.prompts;
        
        // Save prompts to database
        if (userId && jumpId) {
          await this.saveComponents({ prompts: step3Data.components.prompts }, userId, jumpId);
          await this.updateJumpProgress(jumpId, 50);
        }

        if (onProgress) {
          onProgress(3, step3Data);
        }
      }

      // Step 4: Generate Workflows
      console.log('🚀 Step 4: Generating Workflows...');
      const step4Data = await this.executeStep(4, formData, overviewContent);
      
      if (step4Data.success && step4Data.components?.workflows) {
        finalResult.components.workflows = step4Data.components.workflows;
        
        // Save workflows to database
        if (userId && jumpId) {
          await this.saveComponents({ workflows: step4Data.components.workflows }, userId, jumpId);
          await this.updateJumpProgress(jumpId, 66);
        }

        if (onProgress) {
          onProgress(4, step4Data);
        }
      }

      // Step 5: Generate Blueprints
      console.log('🚀 Step 5: Generating Blueprints...');
      const step5Data = await this.executeStep(5, formData, overviewContent);
      
      if (step5Data.success && step5Data.components?.blueprints) {
        finalResult.components.blueprints = step5Data.components.blueprints;
        
        // Save blueprints to database
        if (userId && jumpId) {
          await this.saveComponents({ blueprints: step5Data.components.blueprints }, userId, jumpId);
          await this.updateJumpProgress(jumpId, 83);
        }

        if (onProgress) {
          onProgress(5, step5Data);
        }
      }

      // Step 6: Generate Strategies
      console.log('🚀 Step 6: Generating Strategies...');
      const step6Data = await this.executeStep(6, formData, overviewContent);
      
      if (step6Data.success && step6Data.components?.strategies) {
        finalResult.components.strategies = step6Data.components.strategies;
        
        // Save strategies to database
        if (userId && jumpId) {
          await this.saveComponents({ strategies: step6Data.components.strategies }, userId, jumpId);
          await this.updateJumpProgress(jumpId, 100);
        }

        if (onProgress) {
          onProgress(6, step6Data);
        }
      }

      console.log('✅ All 6 steps completed successfully!');
      console.log('Final result:', {
        jumpId: finalResult.jumpId,
        hasFullContent: !!finalResult.fullContent,
        componentCounts: {
          tools: finalResult.components.tools.length,
          prompts: finalResult.components.prompts.length,
          workflows: finalResult.components.workflows.length,
          blueprints: finalResult.components.blueprints.length,
          strategies: finalResult.components.strategies.length
        }
      });

      return finalResult;

    } catch (error) {
      console.error('Error in 6-step Jump generation:', error);
      throw error;
    }
  },

  // Execute a single step of the generation process
  async executeStep(step: number, formData: StudioFormData, overviewContent: string): Promise<any> {
    try {
      const requestData = {
        goals: formData.goals,
        challenges: formData.challenges,
        industry: formData.industry,
        ai_experience: formData.aiExperience,
        urgency: formData.urgency,
        budget: formData.budget,
        step: step,
        overview_content: overviewContent
      };

      console.log(`Executing Step ${step} with data:`, requestData);

      const { data, error } = await supabase.functions.invoke('jumps-ai-coach', {
        body: requestData
      });

      console.log(`Step ${step} response:`, { data, error });

      if (error) {
        console.error(`Step ${step} error:`, error);
        return {
          success: false,
          error: error.message || `Failed to generate Step ${step}`,
          step: step
        };
      }

      if (!data) {
        console.error(`No data received from Step ${step}`);
        return {
          success: false,
          error: `No data received from Step ${step}`,
          step: step
        };
      }

      return {
        ...data,
        success: true,
        step: step
      };

    } catch (error) {
      console.error(`Error executing Step ${step}:`, error);
      return {
        success: false,
        error: error.message || `Failed to execute Step ${step}`,
        step: step
      };
    }
  },

  // Update jump progress
  async updateJumpProgress(jumpId: string, percentage: number): Promise<void> {
    try {
      await supabase
        .from('user_jumps')
        .update({ completion_percentage: percentage })
        .eq('id', jumpId);
      console.log(`Updated jump ${jumpId} progress to ${percentage}%`);
    } catch (error) {
      console.error('Error updating jump progress:', error);
    }
  },

  // Save individual components to their respective tables
  async saveComponents(components: any, userId: string, jumpId: string): Promise<void> {
    try {
      // Save prompts
      if (components.prompts && components.prompts.length > 0) {
        for (const prompt of components.prompts) {
          await supabase.from('user_prompts').insert({
            user_id: userId,
            jump_id: jumpId,
            title: prompt.title,
            description: prompt.description,
            prompt_text: prompt.prompt_text,
            category: prompt.category,
            ai_tools: prompt.ai_tools,
            use_cases: prompt.use_cases,
            instructions: prompt.instructions,
            tags: prompt.tags || [],
            difficulty: prompt.difficulty,
            estimated_time: prompt.estimated_time
          });
        }
      }

      // Save workflows
      if (components.workflows && components.workflows.length > 0) {
        for (const workflow of components.workflows) {
          await supabase.from('user_workflows').insert({
            user_id: userId,
            jump_id: jumpId,
            title: workflow.title,
            description: workflow.description,
            workflow_steps: workflow.workflow_steps,
            category: workflow.category,
            ai_tools: workflow.ai_tools,
            duration_estimate: workflow.duration_estimate,
            complexity_level: workflow.complexity_level,
            prerequisites: workflow.prerequisites,
            expected_outcomes: workflow.expected_outcomes,
            instructions: workflow.instructions,
            tags: workflow.tags || [],
            tools_needed: workflow.tools_needed,
            skill_level: workflow.skill_level
          });
        }
      }

      // Save blueprints
      if (components.blueprints && components.blueprints.length > 0) {
        for (const blueprint of components.blueprints) {
          await supabase.from('user_blueprints').insert({
            user_id: userId,
            jump_id: jumpId,
            title: blueprint.title,
            description: blueprint.description,
            blueprint_content: blueprint.blueprint_content,
            category: blueprint.category,
            ai_tools: blueprint.ai_tools,
            implementation_time: blueprint.implementation_time,
            difficulty_level: blueprint.difficulty_level,
            resources_needed: blueprint.resources_needed,
            deliverables: blueprint.deliverables,
            instructions: blueprint.instructions,
            tags: blueprint.tags || [],
            implementation: blueprint.implementation,
            requirements: blueprint.requirements,
            tools_used: blueprint.tools_used
          });
        }
      }

      // Save strategies
      if (components.strategies && components.strategies.length > 0) {
        for (const strategy of components.strategies) {
          await supabase.from('user_strategies').insert({
            user_id: userId,
            jump_id: jumpId,
            title: strategy.title,
            description: strategy.description,
            strategy_framework: strategy.strategy_framework,
            category: strategy.category,
            ai_tools: strategy.ai_tools,
            timeline: strategy.timeline,
            success_metrics: strategy.success_metrics,
            key_actions: strategy.key_actions,
            potential_challenges: strategy.potential_challenges,
            mitigation_strategies: strategy.mitigation_strategies,
            instructions: strategy.instructions,
            tags: strategy.tags || [],
            priority_level: strategy.priority_level,
            resource_requirements: strategy.resource_requirements
          });
        }
      }

      console.log('Successfully saved all components to database');
    } catch (error) {
      console.error('Error saving components:', error);
      // Don't throw error - we still want to show the generated content
    }
  },

  // Extract title from content
  extractTitle(fullContent: string): string {
    const lines = fullContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#') && !trimmed.startsWith('##')) {
        return trimmed.replace(/^#+\s*/, '').trim();
      }
    }
    return 'AI Transformation Plan';
  },

  // Extract summary from content
  extractSummary(fullContent: string): string {
    const lines = fullContent.split('\n');
    let summary = '';
    let foundStart = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!foundStart && (trimmed.includes('summary') || trimmed.includes('overview'))) {
        foundStart = true;
        continue;
      }
      if (foundStart && trimmed && !trimmed.startsWith('#')) {
        summary += trimmed + ' ';
        if (summary.length > 200) break;
      }
    }
    
    return summary.trim() || fullContent.substring(0, 200) + '...';
  }
};