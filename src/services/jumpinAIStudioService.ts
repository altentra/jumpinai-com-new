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
    toolPrompts: any[];
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

  // Generate Jump using streaming approach - all steps in one API call
  async generateJumpStreaming(
    formData: StudioFormData,
    userId?: string,
    onProgress?: (step: number, type: string, data: any) => void
  ): Promise<GenerationResult> {
    console.log('Starting streaming jump generation...');
    
      const result: GenerationResult = {
        fullContent: '',
        components: {
          toolPrompts: [],
          workflows: [],
          blueprints: [],
          strategies: []
        }
      };

    return new Promise((resolve, reject) => {
      // Use hardcoded project URL to ensure it works
      const url = 'https://cieczaajcgkgdgenfdzi.supabase.co/functions/v1/jumps-ai-streaming';
      
      console.log('Fetching streaming endpoint:', url);
      
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpZWN6YWFqY2drZ2RnZW5mZHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MzU4OTksImV4cCI6MjA2NjExMTg5OX0.OiDppCXfN_AN64XvCvfhphFqbjSvRtKSwF-cIXCZMQU',
        },
        body: JSON.stringify(formData)
      }).then(async response => {
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No reader available');
        }

        let buffer = '';
        let jumpId: string | undefined;

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonData = JSON.parse(line.slice(6));
                const { step, type, data } = jsonData;

                console.log(`✅ Received step ${step} (${type}):`, data);

                if (type === 'error') {
                  console.error('❌ Error from backend:', data.message);
                  throw new Error(data.message);
                }

                if (type === 'complete') {
                  console.log('🎉 Generation complete!');
                  continue;
                }

                // Process each step with proper data extraction
                if (type === 'naming') {
                  // STEP 1: Quick name only (5% - 3-5 seconds)
                  console.log('🏷️ Processing naming data:', data);
                  result.jumpName = data.jumpName || 'AI Transformation Journey';
                  console.log('Jump name set to:', result.jumpName);
                  
                  // Call progress callback IMMEDIATELY with just the name
                  if (onProgress) {
                    onProgress(step, type, data);
                  }
                  
                  // Save jump with name and generate Jump# immediately (non-blocking)
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
                          console.log('Jump created with ID:', jumpId, 'Title:', fullTitle);
                          
                          // Fire jump_created callback with Jump# immediately
                          if (onProgress) {
                            onProgress(step, 'jump_created', { 
                              jumpId, 
                              jumpNumber, 
                              fullTitle 
                            });
                          }
                        }
                      } catch (error) {
                        console.error('Error creating jump in naming step:', error);
                      }
                    })();
                  }
                } else if (type === 'overview') {
                  // STEP 2: Overview (19%)
                  console.log('📋 Processing overview data:', data);
                  result.comprehensivePlan = data;
                  
                  // Build comprehensive markdown text from ALL sections
                  let overviewText = '';
                  
                  // Executive Summary
                  if (data.executiveSummary) {
                    overviewText += `## Executive Summary\n\n${data.executiveSummary}\n\n`;
                  }
                  
                  // Situation Analysis
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
                  
                  // Strategic Vision
                  if (data.strategicVision) {
                    overviewText += `## Strategic Vision\n\n${data.strategicVision}\n\n`;
                  }
                  
                  // Key Objectives
                  if (data.keyObjectives?.length) {
                    overviewText += `## Key Objectives\n\n`;
                    data.keyObjectives.forEach((obj: string, idx: number) => {
                      overviewText += `${idx + 1}. ${obj}\n`;
                    });
                    overviewText += '\n';
                  }
                  
                  // Success Metrics
                  if (data.successMetrics?.length) {
                    overviewText += `## Success Metrics\n\n`;
                    data.successMetrics.forEach((metric: string) => {
                      overviewText += `- ${metric}\n`;
                    });
                    overviewText += '\n';
                  }
                  
                  // Risk Assessment
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
                  console.log('✅ Overview built with full content length:', result.fullContent.length);
                  
                  // Call progress callback IMMEDIATELY
                  if (onProgress) {
                    onProgress(step, type, data);
                  }
                  
                  // Update jump with overview data in background (non-blocking)
                  if (userId && jumpId) {
                    (async () => {
                      try {
                        await supabase
                          .from('user_jumps')
                          .update({
                            summary: result.fullContent.slice(0, 500),
                            full_content: result.fullContent, // Save as plain text markdown
                            comprehensive_plan: data, // Save structured data
                            completion_percentage: 19,
                            status: 'active'
                          })
                          .eq('id', jumpId);
                        
                        console.log('✅ Jump updated with overview data');
                      } catch (error) {
                        console.error('❌ Error updating jump with overview:', error);
                      }
                    })();
                  }
                } else if (type === 'plan') {
                  // STEP 3: Detailed plan (32%)
                  console.log('📝 Processing plan data:', data);
                  if (data.implementationPlan) {
                    result.structuredPlan = data.implementationPlan;
                    console.log('Plan phases:', data.implementationPlan.phases ? data.implementationPlan.phases.length : 0);
                    
                    // Append plan details to fullContent
                    let planText = '\n\n=== IMPLEMENTATION PLAN ===\n';
                    if (data.implementationPlan.phases) {
                      planText += '\nPHASES:\n';
                      data.implementationPlan.phases.forEach((phase: any, idx: number) => {
                        planText += `\n${idx + 1}. ${phase.name} (${phase.duration})\n`;
                        if (phase.objectives?.length) {
                          planText += '   Objectives:\n' + phase.objectives.map((o: string) => `   • ${o}`).join('\n') + '\n';
                        }
                        if (phase.actions?.length) {
                          planText += '   Actions:\n' + phase.actions.map((a: string) => `   • ${a}`).join('\n') + '\n';
                        }
                      });
                    }
                    if (data.implementationPlan.successMetrics?.length) {
                      planText += '\nSUCCESS METRICS:\n' + data.implementationPlan.successMetrics.map((m: string) => `• ${m}`).join('\n');
                    }
                    result.fullContent += planText;
                    console.log('Plan appended, full content now:', result.fullContent.length, 'chars');
                  }
                  
                  // Call progress callback IMMEDIATELY with the correct data structure
                  if (onProgress) {
                    onProgress(step, type, data);
                  }
                  
                  // Update jump with plan data in background (non-blocking)
                  if (userId && jumpId && data.implementationPlan) {
                    (async () => {
                      try {
                        await supabase
                          .from('user_jumps')
                          .update({
                            structured_plan: data.implementationPlan,
                            full_content: result.fullContent,
                            completion_percentage: 32
                          })
                          .eq('id', jumpId);
                        
                        console.log('Jump updated with implementation plan (structured_plan)');
                      } catch (error) {
                        console.error('Error updating jump with plan:', error);
                      }
                    })();
                  }
                } else if (type === 'tool_prompts') {
                  // STEP 4: Tools & Prompts Combined (52%)
                  console.log('✨ Processing tool-prompts data:', data);
                  
                  const toolPromptsArray = data.tool_prompts || [];
                  console.log(`📦 Extracted ${toolPromptsArray.length} tool prompts`);
                  
                  result.components!.toolPrompts = toolPromptsArray;
                  
                  if (onProgress) {
                    onProgress(step, type, data);
                  }
                  
                  if (userId && jumpId && toolPromptsArray.length > 0) {
                    console.log(`💾 Saving ${toolPromptsArray.length} tool prompts...`);
                    (async () => {
                      try {
                        const { toolPromptsService } = await import('@/services/toolPromptsService');
                        await toolPromptsService.saveToolPrompts(toolPromptsArray, userId, jumpId);
                        console.log('✅ Tool prompts saved successfully');
                      } catch (error) {
                        console.error('❌ Error saving tool prompts:', error);
                      }
                    })();
                  }
                } else if (type === 'prompts') {
                  // Legacy: Skip
                  console.log('⚠️ Skipping legacy prompts step');
                } else if (type === 'workflows') {
                  // STEP 6: Workflows (73%)
                  console.log('⚙️ Processing workflows data:', data);
                  result.components!.workflows = data.workflows || [];
                  console.log(`✓ ${result.components!.workflows.length} workflows extracted:`, result.components!.workflows.map(w => w.title));
                  
                  // Call progress callback IMMEDIATELY
                  if (onProgress) {
                    onProgress(step, type, data);
                  }
                  
                  // Save in background
                  if (userId && jumpId) {
                    (async () => {
                      await this.saveComponents({ workflows: result.components!.workflows }, userId, jumpId);
                    })();
                  }
                } else if (type === 'blueprints') {
                  // STEP 7: Blueprints (86%)
                  console.log('📐 Processing blueprints data:', data);
                  result.components!.blueprints = data.blueprints || [];
                  console.log(`✓ ${result.components!.blueprints.length} blueprints extracted:`, result.components!.blueprints.map(b => b.title));
                  
                  // Call progress callback IMMEDIATELY
                  if (onProgress) {
                    onProgress(step, type, data);
                  }
                  
                  // Save in background
                  if (userId && jumpId) {
                    (async () => {
                      await this.saveComponents({ blueprints: result.components!.blueprints }, userId, jumpId);
                    })();
                  }
                } else if (type === 'strategies') {
                  // STEP 8: Strategies (100%)
                  console.log('🎯 Processing strategies data:', data);
                  result.components!.strategies = data.strategies || [];
                  console.log(`✓ ${result.components!.strategies.length} strategies extracted:`, result.components!.strategies.map(s => s.title));
                  
                  // Call progress callback IMMEDIATELY
                  if (onProgress) {
                    onProgress(step, type, data);
                  }
                  
                  // Save in background
                  if (userId && jumpId) {
                    (async () => {
                      await this.saveComponents({ strategies: result.components!.strategies }, userId, jumpId);
                    })();
                  }
                }

                // Update progress in background
                if (userId && jumpId) {
                  (async () => {
                    const progress = Math.min(100, step * 15);
                    await this.updateJumpProgress(jumpId, progress);
                  })();
                }

              } catch (parseError) {
                console.error('❌ Error parsing SSE data:', parseError);
                console.error('Failed line:', line);
                console.error('Parse error details:', {
                  name: parseError.name,
                  message: parseError.message,
                  line: line.substring(0, 200)
                });
              }
            }
          }
        }

        console.log('🎊 Stream complete! Final result:', {
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
          toolPrompts: [],
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

      // Step 2: Generate Tools & Prompts Combined
      console.log('🚀 Step 2: Generating Tools & Prompts...');
      const step2Data = await this.executeStep(2, formData, overviewContent);
      
      if (step2Data.success && step2Data.components?.tool_prompts) {
        finalResult.components.toolPrompts = step2Data.components.tool_prompts;
        
        // Save tool-prompts to database
        if (userId && jumpId) {
          try {
            const { toolPromptsService } = await import('./toolPromptsService');
            await toolPromptsService.saveToolPrompts(step2Data.components.tool_prompts, userId, jumpId);
            console.log('Saved tool-prompts to user_tool_prompts table for jump:', jumpId);
          } catch (error) {
            console.error('Error saving tool-prompts:', error);
          }
          await this.updateJumpProgress(jumpId, 40);
        }

        if (onProgress) {
          onProgress(2, step2Data);
        }
      }

      // Step 3: Generate Workflows
      console.log('🚀 Step 3: Generating Workflows...');
      const step3Data = await this.executeStep(3, formData, overviewContent);
      
      if (step3Data.success && step3Data.components?.workflows) {
        finalResult.components.workflows = step3Data.components.workflows;
        
        // Save workflows to database
        if (userId && jumpId) {
          await this.saveComponents({ workflows: step3Data.components.workflows }, userId, jumpId);
          await this.updateJumpProgress(jumpId, 60);
        }

        if (onProgress) {
          onProgress(3, step3Data);
        }
      }

      // Step 4: Generate Blueprints
      console.log('🚀 Step 4: Generating Blueprints...');
      const step4Data = await this.executeStep(4, formData, overviewContent);
      
      if (step4Data.success && step4Data.components?.blueprints) {
        finalResult.components.blueprints = step4Data.components.blueprints;
        
        // Save blueprints to database
        if (userId && jumpId) {
          await this.saveComponents({ blueprints: step4Data.components.blueprints }, userId, jumpId);
          await this.updateJumpProgress(jumpId, 80);
        }

        if (onProgress) {
          onProgress(4, step4Data);
        }
      }

      // Step 5: Generate Strategies
      console.log('🚀 Step 5: Generating Strategies...');
      const step5Data = await this.executeStep(5, formData, overviewContent);
      
      if (step5Data.success && step5Data.components?.strategies) {
        finalResult.components.strategies = step5Data.components.strategies;
        
        // Save strategies to database
        if (userId && jumpId) {
          await this.saveComponents({ strategies: step5Data.components.strategies }, userId, jumpId);
          await this.updateJumpProgress(jumpId, 100);
        }

        if (onProgress) {
          onProgress(5, step5Data);
        }
      }

      console.log('✅ All 5 steps completed successfully!');
      console.log('Final result:', {
        jumpId: finalResult.jumpId,
        hasFullContent: !!finalResult.fullContent,
        componentCounts: {
          toolPrompts: finalResult.components.toolPrompts.length,
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
      // Save tool-prompts
      if (components.toolPrompts && components.toolPrompts.length > 0) {
        const { toolPromptsService } = await import('./toolPromptsService');
        await toolPromptsService.saveToolPrompts(components.toolPrompts, userId, jumpId);
      }
      
      // Legacy support for separate tools and prompts (will be deprecated)
      if (components.tools && components.tools.length > 0) {
        const { toolsService } = await import('./toolsService');
        await toolsService.saveTools(components.tools, userId, jumpId);
      }
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

      // Save workflows - Map camelCase to snake_case
      if (components.workflows && components.workflows.length > 0) {
        for (const workflow of components.workflows) {
          await supabase.from('user_workflows').insert({
            user_id: userId,
            jump_id: jumpId,
            title: workflow.title,
            description: workflow.description,
            workflow_steps: workflow.workflowSteps || workflow.workflow_steps,
            category: workflow.category,
            ai_tools: workflow.aiTools || workflow.ai_tools,
            duration_estimate: workflow.durationEstimate || workflow.duration_estimate,
            complexity_level: workflow.complexityLevel || workflow.complexity_level,
            prerequisites: workflow.prerequisites,
            expected_outcomes: workflow.expectedOutcomes || workflow.expected_outcomes,
            instructions: workflow.instructions,
            tags: workflow.tags || [],
            tools_needed: workflow.toolsNeeded || workflow.tools_needed,
            skill_level: workflow.skillLevel || workflow.skill_level
          });
        }
      }

      // Save blueprints - Map camelCase to snake_case
      if (components.blueprints && components.blueprints.length > 0) {
        for (const blueprint of components.blueprints) {
          await supabase.from('user_blueprints').insert({
            user_id: userId,
            jump_id: jumpId,
            title: blueprint.title,
            description: blueprint.description,
            blueprint_content: blueprint.blueprintContent || blueprint.blueprint_content,
            category: blueprint.category,
            ai_tools: blueprint.aiTools || blueprint.ai_tools,
            implementation_time: blueprint.implementationTime || blueprint.implementation_time,
            difficulty_level: blueprint.difficultyLevel || blueprint.difficulty_level,
            resources_needed: blueprint.resourcesNeeded || blueprint.resources_needed,
            deliverables: blueprint.deliverables,
            instructions: blueprint.instructions,
            tags: blueprint.tags || [],
            implementation: blueprint.implementation,
            requirements: blueprint.requirements,
            tools_used: blueprint.toolsUsed || blueprint.tools_used
          });
        }
      }

      // Save strategies - Map camelCase to snake_case
      if (components.strategies && components.strategies.length > 0) {
        for (const strategy of components.strategies) {
          await supabase.from('user_strategies').insert({
            user_id: userId,
            jump_id: jumpId,
            title: strategy.title,
            description: strategy.description,
            strategy_framework: strategy.strategyFramework || strategy.strategy_framework,
            category: strategy.category,
            ai_tools: strategy.aiTools || strategy.ai_tools,
            timeline: strategy.timeline,
            success_metrics: strategy.successMetrics || strategy.success_metrics,
            key_actions: strategy.keyActions || strategy.key_actions,
            potential_challenges: strategy.potentialChallenges || strategy.potential_challenges,
            mitigation_strategies: strategy.mitigationStrategies || strategy.mitigation_strategies,
            instructions: strategy.instructions,
            tags: strategy.tags || [],
            priority_level: strategy.priorityLevel || strategy.priority_level,
            resource_requirements: strategy.resourceRequirements || strategy.resource_requirements
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