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
    turnstileToken?: string,
    onProgress?: (step: number, type: string, data: any) => void
  ): Promise<GenerationResult> {
    return new Promise(async (resolve, reject) => {
      // For guest users, generate a temporary jump ID so features like clarify/reroute work
      const tempJumpId = crypto.randomUUID();
      
      const result: GenerationResult = {
        jumpId: userId ? undefined : tempJumpId, // Use temp ID for guests immediately
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

      let jumpId: string | undefined = userId ? undefined : tempJumpId;

      // Get the session for auth token (optional for guests)
      const { data: { session } } = await supabase.auth.getSession();
      
      // Build headers - include auth token only if user is logged in
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // Build request body - turnstileToken only for guests
      const requestBody = { 
        formData,
        turnstileToken
      };

      fetch('https://cieczaajcgkgdgenfdzi.supabase.co/functions/v1/jumps-ai-streaming', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
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
                
                // Extract metadata from response
                const metadata = data._metadata || {};
                const jumpIpAddress = metadata.ipAddress;
                const jumpLocation = metadata.location;
                console.log('📍 Jump metadata:', { jumpIpAddress, jumpLocation });
                
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
                          status: 'generating',
                          ip_address: jumpIpAddress,
                          location: jumpLocation
                        })
                        .select()
                        .single();

                      if (!error && savedJump) {
                        jumpId = savedJump.id;
                        result.jumpId = jumpId;
                        console.log('✅ Jump created with ID:', jumpId, 'from', jumpLocation);
                        
                        if (onProgress) {
                          onProgress(step, 'jump_created', { jumpId, jumpNumber, fullTitle });
                        }
                      }
                    } catch (error) {
                      console.error('❌ Error creating jump:', error);
                    }
                  })();
                } else {
                  // For guest users, send jump_created event with temp ID
                  console.log('✅ Guest jump using temp ID:', jumpId, 'from', jumpLocation);
                  if (onProgress) {
                    onProgress(step, 'jump_created', { 
                      jumpId, 
                      jumpNumber: null, 
                      fullTitle: result.jumpName 
                    });
                  }
                }
              } else if (type === 'overview') {
                console.log('📋 Processing overview data:', data);
                result.comprehensivePlan = {
                  executiveSummary: data.executiveSummary || '',
                  situationAnalysis: data.situationAnalysis || {},
                  strategicVision: data.strategicVision || '',
                  roadmap: data.roadmap || {},
                  successFactors: data.successFactors || [],
                  riskMitigation: data.riskMitigation || [],
                  action_plan: { phases: [] } // Will be filled by plan step
                };
                
                let overviewText = '';
                if (data.executiveSummary) {
                  overviewText += `## Executive Summary\n\n${data.executiveSummary}\n\n`;
                }
                if (data.situationAnalysis) {
                  if (data.situationAnalysis.currentState) {
                    overviewText += `## Current State\n\n${data.situationAnalysis.currentState}\n\n`;
                  }
                  if (data.situationAnalysis.challenges?.length) {
                    overviewText += `## Challenges\n`;
                    data.situationAnalysis.challenges.forEach((c: string) => {
                      overviewText += `- ${c}\n`;
                    });
                    overviewText += '\n';
                  }
                  if (data.situationAnalysis.opportunities?.length) {
                    overviewText += `## Opportunities\n`;
                    data.situationAnalysis.opportunities.forEach((o: string) => {
                      overviewText += `- ${o}\n`;
                    });
                    overviewText += '\n';
                  }
                }
                if (data.strategicVision) {
                  overviewText += `## Strategic Vision\n\n${data.strategicVision}\n\n`;
                }
                if (data.roadmap) {
                  overviewText += `## Roadmap\n\n`;
                  if (data.roadmap.immediate) overviewText += `**Immediate (0-30 days):** ${data.roadmap.immediate}\n\n`;
                  if (data.roadmap.shortTerm) overviewText += `**Short-term (30-90 days):** ${data.roadmap.shortTerm}\n\n`;
                  if (data.roadmap.longTerm) overviewText += `**Long-term (90+ days):** ${data.roadmap.longTerm}\n\n`;
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
                          comprehensive_plan: result.comprehensivePlan,
                          completion_percentage: 30,
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
                console.log('📝 Processing plan data:', data);
                const planData = data.phases ? data : data.action_plan || data;
                result.structuredPlan = planData;
                console.log('✅ Plan has', planData.phases?.length || 0, 'phases');
                
                // Update comprehensive_plan with action_plan
                if (result.comprehensivePlan) {
                  result.comprehensivePlan.action_plan = planData;
                }
                
                let planText = '\n\n=== STRATEGIC ACTION PLAN ===\n';
                if (planData.phases?.length) {
                  planData.phases.forEach((phase: any, idx: number) => {
                    planText += `\n### Phase ${phase.phase_number || idx + 1}: ${phase.title}\n`;
                    planText += `Duration: ${phase.duration}\n`;
                    planText += `${phase.description}\n\n`;
                    
                    if (phase.steps?.length) {
                      planText += 'Steps:\n';
                      phase.steps.forEach((step: any) => {
                        planText += `\n${step.step_number}. ${step.title}\n`;
                        planText += `   ${step.description}\n`;
                        planText += `   Time: ${step.estimated_time}\n`;
                      });
                      planText += '\n';
                    }
                  });
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
                          comprehensive_plan: result.comprehensivePlan,
                          full_content: result.fullContent,
                          completion_percentage: 60
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
                console.log('📊 Raw data received:', JSON.stringify(data, null, 2));
                
                const toolPromptsArray = data.tool_prompts || [];
                console.log(`📦 Extracted ${toolPromptsArray.length} tool prompts`);
                
                // Validate each tool prompt has required fields
                const validatedPrompts = toolPromptsArray.map((tp: any, idx: number) => {
                  const promptText = tp.prompt_text || tp.custom_prompt || tp.prompt;
                  const toolName = tp.tool_name || tp.name;
                  
                  console.log(`📋 Tool prompt ${idx + 1} validation:`, {
                    title: tp.title,
                    tool_name: toolName,
                    hasPromptText: !!promptText,
                    hasToolName: !!toolName,
                    phase: tp.phase,
                    isValid: !!(promptText && toolName)
                  });
                  
                  return tp;
                });
                
                console.log(`✅ Tool prompts validation complete: ${validatedPrompts.filter((tp: any) => {
                  const promptText = tp.prompt_text || tp.custom_prompt || tp.prompt;
                  const toolName = tp.tool_name || tp.name;
                  return promptText && toolName;
                }).length}/${validatedPrompts.length} have complete required data`);
                
                result.components!.toolPrompts = validatedPrompts;
                
                if (onProgress) {
                  onProgress(step, type, data);
                }
                
                if (userId && jumpId && toolPromptsArray.length > 0) {
                  console.log(`💾 Attempting to save ${toolPromptsArray.length} tool prompts...`);
                  console.log('💾 Save context:', { userId, jumpId, arrayLength: toolPromptsArray.length });
                  (async () => {
                    try {
                      const { toolPromptsService } = await import('@/services/toolPromptsService');
                      console.log('💾 toolPromptsService loaded, calling saveToolPrompts...');
                      const savedIds = await toolPromptsService.saveToolPrompts(toolPromptsArray, userId, jumpId);
                      console.log('✅ Tool prompts saved successfully with IDs:', savedIds);
                      
                      // Update the result with saved IDs
                      if (savedIds && savedIds.length === toolPromptsArray.length) {
                        result.components!.toolPrompts = toolPromptsArray.map((tp, idx) => ({
                          ...tp,
                          id: savedIds[idx]
                        }));
                        console.log('✅ Updated tool prompts with database IDs:', savedIds);
                        
                        // Trigger progress update to notify components about the ID update
                        if (onProgress) {
                          console.log('🔄 Notifying components of tool prompt ID updates');
                          onProgress(step, 'tool_prompts_ids_updated', { 
                            tool_prompts: result.components!.toolPrompts,
                            ids: savedIds
                          });
                        }
                      }
                    } catch (error) {
                      console.error('❌ Error saving tool prompts:', error);
                      console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
                    }
                  })();
                } else if (jumpId && toolPromptsArray.length > 0) {
                  // For guest users, generate temporary IDs so UI can display properly
                  console.log('🎯 Guest mode: Generating temp IDs for tool prompts');
                  const tempIds = toolPromptsArray.map(() => crypto.randomUUID());
                  result.components!.toolPrompts = toolPromptsArray.map((tp, idx) => ({
                    ...tp,
                    id: tempIds[idx]
                  }));
                  
                  // Notify components about the temp IDs
                  if (onProgress) {
                    console.log('🔄 Notifying components of temp tool prompt IDs');
                    onProgress(step, 'tool_prompts_ids_updated', { 
                      tool_prompts: result.components!.toolPrompts,
                      ids: tempIds
                    });
                  }
                } else {
                  console.warn('⚠️ NOT saving tool prompts. Conditions:', {
                    hasUserId: !!userId,
                    hasJumpId: !!jumpId,
                    arrayLength: toolPromptsArray.length,
                    arrayIsEmpty: toolPromptsArray.length === 0
                  });
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
