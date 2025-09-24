import { supabase } from '@/integrations/supabase/client';
import { createJump } from './jumpService';
import { userProfileService } from './userProfileService';

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
  fullContent: string;
  structuredPlan?: any;
  comprehensivePlan?: any;
  components?: {
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

  // Generate Jump in AI using the edge function
  async generateJump(formData: StudioFormData, userId?: string): Promise<GenerationResult> {
    try {
      // Prepare the request data
      const requestData = {
        goals: formData.goals,
        challenges: formData.challenges,
        industry: formData.industry,
        ai_experience: formData.aiExperience,
        urgency: formData.urgency,
        budget: formData.budget,
        generate_components: true, // Always generate components
      };

      console.log('Generating Jump with data:', requestData);

      // Call the jumps-ai-coach edge function 
      const { data, error } = await supabase.functions.invoke('jumps-ai-coach', {
        body: requestData
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to generate Jump');
      }

      if (!data) {
        console.error('No data received from edge function');
        throw new Error('No data received from AI generation service');
      }

      console.log('Generated Jump data keys:', Object.keys(data));

      let jumpId: string | undefined;

      // If user is logged in, save the jump to database
      if (userId && data && data.full_content) {
        try {
          console.log('Saving jump to database for user:', userId);
          // Save form data as profile
          await this.saveFormData(formData, userId);

          // Create the jump record
          const jumpData = {
            title: this.extractTitle(data.full_content),
            summary: this.extractSummary(data.full_content),
            full_content: data.full_content,
            structured_plan: data.structured_plan,
            comprehensive_plan: data.comprehensive_plan,
            jump_type: 'studio_generated',
            status: 'active',
            completion_percentage: 0
          };

          const createdJump = await createJump(jumpData);
          jumpId = createdJump?.id;

          console.log('Created Jump with ID:', jumpId);

          // Save individual components if they exist
          if (data.components) {
            await this.saveComponents(data.components, userId, jumpId);
          }
        } catch (saveError) {
          console.error('Error saving jump to database:', saveError);
          // Continue without saving - user still gets the generated content
        }
      }

      const result = {
        jumpId,
        fullContent: data.full_content || '',
        structuredPlan: data.structured_plan,
        comprehensivePlan: data.comprehensive_plan,
        components: data.components || {
          prompts: [],
          workflows: [],
          blueprints: [],
          strategies: []
        }
      };

      console.log('Returning result:', Object.keys(result));
      return result;

    } catch (error) {
      console.error('Error generating Jump:', error);
      throw error;
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