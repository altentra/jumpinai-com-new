import { supabase } from "@/integrations/supabase/client";

/**
 * Clean, simple service for saving Jump components
 * No more camelCase/snake_case mess - handles mapping in ONE place
 */

export const jumpComponentsService = {
  /**
   * Save workflows from AI generation
   */
  async saveWorkflows(workflows: any[], userId: string, jumpId: string): Promise<void> {
    if (!workflows || workflows.length === 0) {
      console.log('⚠️ No workflows to save');
      return;
    }

    console.log(`💾 Saving ${workflows.length} workflows for jump ${jumpId}`);

    for (const workflow of workflows) {
      try {
        const { error } = await supabase
          .from('user_workflows')
          .insert({
            user_id: userId,
            jump_id: jumpId,
            title: workflow.title,
            description: workflow.description,
            category: workflow.category,
            workflow_steps: workflow.workflowSteps || [],
            duration_estimate: workflow.durationEstimate,
            complexity_level: workflow.complexityLevel,
            ai_tools: workflow.aiTools || [],
            prerequisites: workflow.prerequisites || [],
            expected_outcomes: workflow.expectedOutcomes || [],
            instructions: workflow.instructions,
            tags: workflow.tags || [],
            tools_needed: workflow.toolsNeeded || [],
            skill_level: workflow.skillLevel
          });

        if (error) {
          console.error(`❌ Failed to save workflow "${workflow.title}":`, error);
        } else {
          console.log(`✅ Saved workflow: ${workflow.title}`);
        }
      } catch (error) {
        console.error(`❌ Error saving workflow "${workflow.title}":`, error);
      }
    }
  },

  /**
   * Save blueprints from AI generation
   */
  async saveBlueprints(blueprints: any[], userId: string, jumpId: string): Promise<void> {
    if (!blueprints || blueprints.length === 0) {
      console.log('⚠️ No blueprints to save');
      return;
    }

    console.log(`💾 Saving ${blueprints.length} blueprints for jump ${jumpId}`);

    for (const blueprint of blueprints) {
      try {
        const { error } = await supabase
          .from('user_blueprints')
          .insert({
            user_id: userId,
            jump_id: jumpId,
            title: blueprint.title,
            description: blueprint.description,
            category: blueprint.category,
            blueprint_content: blueprint.blueprintContent || {},
            ai_tools: blueprint.aiTools || [],
            implementation_time: blueprint.implementationTime,
            difficulty_level: blueprint.difficultyLevel,
            resources_needed: blueprint.resourcesNeeded || [],
            deliverables: blueprint.deliverables || [],
            instructions: blueprint.instructions,
            tags: blueprint.tags || [],
            implementation: blueprint.implementation,
            requirements: blueprint.requirements || [],
            tools_used: blueprint.toolsUsed || []
          });

        if (error) {
          console.error(`❌ Failed to save blueprint "${blueprint.title}":`, error);
        } else {
          console.log(`✅ Saved blueprint: ${blueprint.title}`);
        }
      } catch (error) {
        console.error(`❌ Error saving blueprint "${blueprint.title}":`, error);
      }
    }
  },

  /**
   * Save strategies from AI generation
   */
  async saveStrategies(strategies: any[], userId: string, jumpId: string): Promise<void> {
    if (!strategies || strategies.length === 0) {
      console.log('⚠️ No strategies to save');
      return;
    }

    console.log(`💾 Saving ${strategies.length} strategies for jump ${jumpId}`);

    for (const strategy of strategies) {
      try {
        const { error } = await supabase
          .from('user_strategies')
          .insert({
            user_id: userId,
            jump_id: jumpId,
            title: strategy.title,
            description: strategy.description,
            category: strategy.category,
            strategy_framework: strategy.strategyFramework || {},
            ai_tools: strategy.aiTools || [],
            timeline: strategy.timeline,
            success_metrics: strategy.successMetrics || [],
            key_actions: strategy.keyActions || [],
            potential_challenges: strategy.potentialChallenges || [],
            mitigation_strategies: strategy.mitigationStrategies || [],
            instructions: strategy.instructions,
            tags: strategy.tags || [],
            priority_level: strategy.priorityLevel,
            resource_requirements: strategy.resourceRequirements || []
          });

        if (error) {
          console.error(`❌ Failed to save strategy "${strategy.title}":`, error);
        } else {
          console.log(`✅ Saved strategy: ${strategy.title}`);
        }
      } catch (error) {
        console.error(`❌ Error saving strategy "${strategy.title}":`, error);
      }
    }
  }
};
