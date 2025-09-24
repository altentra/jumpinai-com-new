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
  // Save form data for logged-in users
  async saveFormData(formData: StudioFormData, userId: string): Promise<void> {
    try {
      // Create or update user profile with the form data
      const profileData = {
        currentRole: 'Studio User', // Default role for studio users
        industry: formData.industry,
        experienceLevel: 'intermediate', // Default
        aiKnowledge: formData.aiExperience,
        goals: formData.goals,
        challenges: formData.challenges,
        timeCommitment: formData.urgency,
        budget: formData.budget,
      };

      await userProfileService.createProfile(profileData, userId);
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

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to generate Jump');
      }

      console.log('Generated Jump data:', data);

      let jumpId: string | undefined;

      // If user is logged in, save the jump to database
      if (userId && data.full_content) {
        try {
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
        } catch (saveError) {
          console.error('Error saving jump to database:', saveError);
          // Continue without saving - user still gets the generated content
        }
      }

      return {
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

    } catch (error) {
      console.error('Error generating Jump:', error);
      throw error;
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