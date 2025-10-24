import { supabase } from "@/integrations/supabase/client";
import { createJump } from "./jumpService";
import { jumpNamingService } from "@/utils/jumpNamingService";

export interface StudioFormData {
  currentRole: string;
  industry: string;
  experienceLevel: string;
  aiKnowledge: string;
  aiExperience?: string;
  goals: string;
  challenges: string;
  timeCommitment: string;
  budget: string;
  urgency?: string;
}

export interface GenerationResult {
  jumpId?: string;
  jumpName?: string;
  jumpNumber?: number;
  fullTitle?: string;
  fullContent: string;
  structuredPlan?: any;
  comprehensivePlan?: any;
  components: {
    toolPrompts: any[];
    workflows: any[];
    blueprints: any[];
    strategies: any[];
  };
}

export const jumpinAIStudioService = {
  async generateJumpStreaming(
    formData: StudioFormData,
    userId?: string,
    onProgress?: (step: number, type: string, data: any) => void
  ): Promise<GenerationResult> {
    return new Promise(async (resolve, reject) => {
      const result: GenerationResult = {
        jumpId: undefined,
        fullContent: '',
        structuredPlan: null,
        comprehensivePlan: null,
        components: {
          toolPrompts: [],
          workflows: [],
          blueprints: [],
          strategies: []
        }
      };

      let jumpId: string | undefined;

      fetch('https://cieczaajcgkgdgenfdzi.supabase.co/functions/v1/jumps-ai-streaming', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData })
      }).then(async response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim() || !line.startsWith('data: ')) continue;

            try {
              const jsonStr = line.substring(6);
              const parsed = JSON.parse(jsonStr);
              const { step, type, data } = parsed;

              console.log(`📨 Received SSE event: step=${step}, type=${type}`);

              if (type === 'naming') {
                result.jumpName = data.jumpName;
                console.log('✅ Jump name received:', data.jumpName);
                
                if (onProgress) {
                  onProgress(step, type, data);
                }
                
                if (userId) {
                  (async () => {
                    try {
                      const jumpNumber = await jumpNamingService.getNextJumpNumber(userId);
                      const fullTitle = `Jump #${jumpNumber}: ${result.jumpName}`;
                      result.jumpNumber = jumpNumber;
                      result.fullTitle = fullTitle;
                      
                      const { data: savedJump, error } = await supabase
                        .from('user_jumps')
                        .insert({
                          user_id: userId,
                          title: fullTitle,
                          summary: `AI Transformation: ${result.jumpName}`,
                          full_content: JSON.stringify({ jumpName: result.jumpName }),
                          completion_percentage: 5,
                          status: 'generating'
                        })
                        .select()
                        .single();

                      if (!error && savedJump) {
                        jumpId = savedJump.id;
                        result.jumpId = jumpId;
                        console.log('✅ Jump created with ID:', jumpId);
                        
                        if (onProgress) {
                          onProgress(step, 'jump_created', { jumpId, jumpNumber, fullTitle });
                        }
                      }
                    } catch (error) {
                      console.error('❌ Error creating jump:', error);
                    }
                  })();
                }
              } else if (type === 'overview') {
                console.log('📋 Processing overview data');
                result.comprehensivePlan = data;
                
                let overviewText = '';
                if (data.executiveSummary) {
                  overviewText += `## Executive Summary\n\n${data.executiveSummary}\n\n`;
                }
                if (data.situationAnalysis) {
                  overviewText += `## Situation Analysis\n\n`;
                  if (data.situationAnalysis.currentState) {
                    overviewText += `### Current State\n${data.situationAnalysis.currentState}\n\n`;
                  }
                  if (data.situationAnalysis.challenges?.length) {
                    overviewText += `### Key Challenges\n`;
                    data.situationAnalysis.challenges.forEach((c: string) => {
                      overviewText += `- ${c}\n`;
                    });
                    overviewText += '\n';
                  }
                  if (data.situationAnalysis.opportunities?.length) {
                    overviewText += `### Opportunities\n`;
                    data.situationAnalysis.opportunities.forEach((o: string) => {
                      overviewText += `- ${o}\n`;
                    });
                    overviewText += '\n';
                  }
                }
                if (data.strategicVision) {
                  overviewText += `## Strategic Vision\n\n${data.strategicVision}\n\n`;
                }
                if (data.keyObjectives?.length) {
                  overviewText += `## Key Objectives\n\n`;
                  data.keyObjectives.forEach((obj: string, idx: number) => {
                    overviewText += `${idx + 1}. ${obj}\n`;
                  });
                  overviewText += '\n';
                }
                if (data.successMetrics?.length) {
                  overviewText += `## Success Metrics\n\n`;
                  data.successMetrics.forEach((metric: string) => {
                    overviewText += `- ${metric}\n`;
                  });
                  overviewText += '\n';
                }
                if (data.riskAssessment) {
                  overviewText += `## Risk Assessment\n\n`;
                  if (data.riskAssessment.risks?.length) {
                    overviewText += `### Potential Risks\n`;
                    data.riskAssessment.risks.forEach((risk: string) => {
                      overviewText += `- ${risk}\n`;
                    });
                    overviewText += '\n';
                  }
                  if (data.riskAssessment.mitigations?.length) {
                    overviewText += `### Mitigation Strategies\n`;
                    data.riskAssessment.mitigations.forEach((mitigation: string) => {
                      overviewText += `- ${mitigation}\n`;
                    });
                    overviewText += '\n';
                  }
                }
                
                result.fullContent = overviewText.trim();
                console.log('✅ Overview built with', result.fullContent.length, 'chars');
                
                if (onProgress) {
                  onProgress(step, type, data);
                }
                
                if (userId && jumpId) {
                  (async () => {
                    try {
                      await supabase
                        .from('user_jumps')
                        .update({
                          summary: result.fullContent.slice(0, 500),
                          full_content: result.fullContent,
                          comprehensive_plan: data,
                          completion_percentage: 19,
                          status: 'active'
                        })
                        .eq('id', jumpId);
                      
                      console.log('✅ Jump updated with overview');
                    } catch (error) {
                      console.error('❌ Error updating jump with overview:', error);
                    }
                  })();
                }
              } else if (type === 'comprehensive' || type === 'plan') {
                console.log('📝 Processing plan/comprehensive data');
                // Handle both direct structure and wrapped structure
                const planData = data.implementationPlan || data;
                result.structuredPlan = planData;
                console.log('✅ Plan has', planData.phases?.length || 0, 'phases');
                
                let planText = '\n\n=== IMPLEMENTATION PLAN ===\n';
                if (planData.phases) {
                  planText += '\nPHASES:\n';
                  planData.phases.forEach((phase: any, idx: number) => {
                      planText += `\n${idx + 1}. ${phase.name} (${phase.duration})\n`;
                      if (phase.objectives?.length) {
                        planText += '   Objectives:\n' + phase.objectives.map((o: string) => `   • ${o}`).join('\n') + '\n';
                      }
                      if (phase.actions?.length) {
                        planText += '   Actions:\n' + phase.actions.map((a: string) => `   • ${a}`).join('\n') + '\n';
                      }
                  });
                }
                if (planData.successMetrics?.length) {
                    planText += '\nSUCCESS METRICS:\n' + planData.successMetrics.map((m: string) => `• ${m}`).join('\n');
                }
                result.fullContent += planText;
                console.log('✅ Plan appended, total', result.fullContent.length, 'chars');
                
                if (onProgress) {
                  onProgress(step, type, data);
                }
                
                if (userId && jumpId) {
                  (async () => {
                    try {
                      await supabase
                        .from('user_jumps')
                        .update({
                          structured_plan: planData,
                          full_content: result.fullContent,
                          completion_percentage: 32
                        })
                        .eq('id', jumpId);
                      
                      console.log('✅ Jump updated with plan');
                    } catch (error) {
                      console.error('❌ Error updating jump with plan:', error);
                    }
                  })();
                }
              } else if (type === 'tool_prompts') {
                console.log('✨ Processing tool_prompts data');
                
                const toolPromptsArray = data.tool_prompts || [];
                console.log(`📦 Extracted ${toolPromptsArray.length} tool prompts`);
                
                // VALIDATE AND FILTER TOOL PROMPTS
                const validToolPrompts: any[] = [];
                const requiredFields = ['title', 'description', 'tool_name', 'prompt_text'];
                
                toolPromptsArray.forEach((tool: any, index: number) => {
                  const toolNum = index + 1;
                  const missingFields = requiredFields.filter(field => !tool[field] || tool[field].trim() === '');
                  
                  if (missingFields.length > 0) {
                    console.error(`❌ Tool #${toolNum} has missing/empty required fields:`, missingFields);
                    console.error(`Tool #${toolNum} data preview:`, JSON.stringify(tool).substring(0, 300));
                    // Create a placeholder error tool to maintain numbering
                    validToolPrompts.push({
                      title: `Error generating tool #${toolNum}`,
                      description: `This tool combo could not be generated properly. Missing fields: ${missingFields.join(', ')}`,
                      tool_name: 'Error',
                      prompt_text: 'This tool prompt is incomplete.',
                      category: 'Error',
                      isError: true
                    });
                  } else {
                    console.log(`✅ Tool #${toolNum} "${tool.title}" - valid`);
                    validToolPrompts.push(tool);
                  }
                });
                
                result.components!.toolPrompts = validToolPrompts;
                console.log(`✅ Processed ${validToolPrompts.length} tool prompts (${validToolPrompts.filter((t: any) => !t.isError).length} valid, ${validToolPrompts.filter((t: any) => t.isError).length} errors)`);
                
                if (onProgress) {
                  onProgress(step, type, data);
                }
                
                // Save only the valid (non-error) tool prompts to database
                const validForSave = validToolPrompts.filter((t: any) => !t.isError);
                if (userId && jumpId && validForSave.length > 0) {
                  console.log(`💾 Saving ${validForSave.length} valid tool prompts...`);
                  (async () => {
                    try {
                      const { toolPromptsService } = await import('@/services/toolPromptsService');
                      await toolPromptsService.saveToolPrompts(validForSave, userId, jumpId);
                      console.log('✅ Tool prompts saved successfully');
                    } catch (error) {
                      console.error('❌ Error saving tool prompts:', error);
                    }
                  })();
                }
              } else if (type === 'complete') {
                console.log('🎊 Generation complete event received');
                if (onProgress) {
                  onProgress(step, type, data);
                }
              } else if (type === 'workflows') {
                console.log('⚙️ Workflows data received (not saved - feature removed)');
                const workflowsArray = data.workflows || [];
                result.components!.workflows = workflowsArray;
                
                if (onProgress) {
                  onProgress(step, type, data);
                }
              } else if (type === 'blueprints') {
                console.log('📐 Blueprints data received (not saved - feature removed)');
                const blueprintsArray = data.blueprints || [];
                result.components!.blueprints = blueprintsArray;
                
                if (onProgress) {
                  onProgress(step, type, data);
                }
              } else if (type === 'strategies') {
                console.log('🎯 Strategies data received (not saved - feature removed)');
                const strategiesArray = data.strategies || [];
                result.components!.strategies = strategiesArray;
                
                if (onProgress) {
                  onProgress(step, type, data);
                }
              }

              if (userId && jumpId) {
                (async () => {
                  const progress = Math.min(100, step * 15);
                  await this.updateJumpProgress(jumpId, progress);
                })();
              }

            } catch (parseError) {
              console.error('❌ Error parsing SSE data:', parseError);
              console.error('Failed line:', line.substring(0, 200));
            }
          }
        }

        console.log('🎊 Stream complete!', {
          jumpName: result.jumpName,
          toolPromptsCount: result.components?.toolPrompts?.length || 0,
          workflowsCount: result.components?.workflows?.length || 0,
          blueprintsCount: result.components?.blueprints?.length || 0,
          strategiesCount: result.components?.strategies?.length || 0
        });
        resolve(result);

      }).catch(error => {
        console.error('❌ Streaming error:', error);
        reject(error);
      });
    });
  },

  // Old save methods removed - now using clean jumpComponentsService


  async generateJump(formData: StudioFormData, userId?: string, onProgress?: (step: number, data: any) => void): Promise<GenerationResult> {
    console.log(`generateJump called with userId: ${userId}`);
    const result: GenerationResult = {
      jumpId: undefined,
      fullContent: '',
      structuredPlan: null,
      comprehensivePlan: null,
      components: {
        toolPrompts: [],
        workflows: [],
        blueprints: [],
        strategies: []
      }
    };

    // Step 1: Generate Overview
    if (onProgress) onProgress(1, { message: 'Generating Overview...' });
    const overviewContent = await this.executeStep(1, formData, '');
    result.fullContent += `\n\n=== OVERVIEW ===\n${overviewContent}`;
    console.log('overviewContent', overviewContent);

    // Step 2: Generate Structured Plan
    if (onProgress) onProgress(2, { message: 'Generating Structured Plan...' });
    const structuredPlan = await this.executeStep(2, formData, overviewContent);
    result.fullContent += `\n\n=== STRUCTURED PLAN ===\n${structuredPlan}`;
    result.structuredPlan = structuredPlan;
    console.log('structuredPlan', structuredPlan);

    // Step 3: Generate Tool Prompts
    if (onProgress) onProgress(3, { message: 'Generating Tool Prompts...' });
    const toolPrompts = await this.executeStep(3, formData, overviewContent);
    result.components.toolPrompts = toolPrompts;
    console.log('toolPrompts', toolPrompts);

    // Step 4: Generate Workflows
    if (onProgress) onProgress(4, { message: 'Generating Workflows...' });
    const workflows = await this.executeStep(4, formData, overviewContent);
    result.components.workflows = workflows;
    console.log('workflows', workflows);

    // Step 5: Generate Blueprints
    if (onProgress) onProgress(5, { message: 'Generating Blueprints...' });
    const blueprints = await this.executeStep(5, formData, overviewContent);
    result.components.blueprints = blueprints;
    console.log('blueprints', blueprints);

    // Step 6: Generate Strategies
    if (onProgress) onProgress(6, { message: 'Generating Strategies...' });
    const strategies = await this.executeStep(6, formData, overviewContent);
    result.components.strategies = strategies;
    console.log('strategies', strategies);

    if (userId) {
      try {
        const jumpNumber = await jumpNamingService.getNextJumpNumber(userId);
        const fullTitle = `Jump #${jumpNumber}: ${this.extractTitle(result.fullContent)}`;

        const { data: savedJump, error } = await supabase
          .from('user_jumps')
          .insert({
            user_id: userId,
            title: fullTitle,
            summary: this.extractSummary(result.fullContent),
            full_content: result.fullContent,
            completion_percentage: 5,
            status: 'active'
          })
          .select()
          .single();

        if (!error && savedJump) {
          result.jumpId = savedJump.id;
          result.jumpName = fullTitle;
          console.log('savedJump', savedJump);

          // Save components
          await this.saveComponents(result.components, userId, savedJump.id);
        } else {
          console.error('Error creating jump:', error);
        }
      } catch (error) {
        console.error('Error creating jump:', error);
      }
    }

    return result;
  },

  async executeStep(step: number, formData: StudioFormData, overviewContent: string): Promise<any> {
    // Placeholder for AI function call
    console.log(`Executing step ${step} with formData:`, formData);
    console.log(`Using overviewContent:`, overviewContent);

    // Simulate AI response based on the step
    switch (step) {
      case 1:
        return `This is a comprehensive overview generated by AI for the given form data.`;
      case 2:
        return {
          phases: [
            { name: 'Phase 1', duration: '1 week', objectives: ['Objective 1', 'Objective 2'], actions: ['Action 1', 'Action 2'] },
            { name: 'Phase 2', duration: '2 weeks', objectives: ['Objective 3', 'Objective 4'], actions: ['Action 3', 'Action 4'] }
          ],
          successMetrics: ['Metric 1', 'Metric 2']
        };
      case 3:
        return [
          { tool: 'Tool 1', prompt: 'Prompt 1' },
          { tool: 'Tool 2', prompt: 'Prompt 2' }
        ];
      case 4:
        return [
          { title: 'Workflow 1', description: 'Description 1' },
          { title: 'Workflow 2', description: 'Description 2' }
        ];
      case 5:
        return [
          { title: 'Blueprint 1', description: 'Description 1' },
          { title: 'Blueprint 2', description: 'Description 2' }
        ];
      case 6:
        return [
          { title: 'Strategy 1', description: 'Description 1' },
          { title: 'Strategy 2', description: 'Description 2' }
        ];
      default:
        return `AI response for step ${step}`;
    }
    throw new Error('Not implemented');
  },

  async updateJumpProgress(jumpId: string, percentage: number): Promise<void> {
    try {
      await supabase
        .from('user_jumps')
        .update({ completion_percentage: percentage })
        .eq('id', jumpId);
      console.log(`✅ Updated jump ${jumpId} progress to ${percentage}%`);
    } catch (error) {
      console.error('❌ Error updating jump progress:', error);
    }
  },

  async saveComponents(components: any, userId: string, jumpId: string): Promise<void> {
    // Legacy method - use specific save methods instead
    console.warn('⚠️  saveComponents is deprecated - use specific save methods');
  },

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
  },

  async saveFormData(formData: StudioFormData, userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            profile_name: 'Studio Profile',
            current_role_value: formData.currentRole,
            industry: formData.industry,
            experience_level: formData.experienceLevel,
            ai_knowledge: formData.aiKnowledge,
            goals: formData.goals,
            challenges: formData.challenges,
            time_commitment: formData.timeCommitment,
            budget: formData.budget,
            is_active: true
          });
      } else {
        await supabase
          .from('user_profiles')
          .update({
            current_role_value: formData.currentRole,
            industry: formData.industry,
            experience_level: formData.experienceLevel,
            ai_knowledge: formData.aiKnowledge,
            goals: formData.goals,
            challenges: formData.challenges,
            time_commitment: formData.timeCommitment,
            budget: formData.budget
          })
          .eq('id', data.id);
      }
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  }
};
