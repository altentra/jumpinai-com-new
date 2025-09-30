import { supabase } from '@/integrations/supabase/client';
import { StudioFormData } from '@/services/jumpinAIStudioService';

export interface JumpNameResult {
  name: string;
  number: number;
  fullTitle: string;
}

export const jumpNamingService = {
  /**
   * Generate an appropriate jump name based on form inputs
   */
  generateJumpName(formData: StudioFormData): string {
    const { goals, industry, challenges, aiExperience } = formData;
    
    // Analyze the core objective from goals
    const coreObjective = this.identifyCoreObjective(goals);
    
    // Extract industry context for personalization
    const industryContext = industry.trim() ? ` in ${industry}` : '';
    
    // Create an inspiring, action-oriented name
    let baseName = '';
    
    if (coreObjective) {
      // Generate inspiring names based on the objective type
      baseName = this.generateInspiringName(coreObjective, industry, aiExperience);
    } else {
      // Fallback: analyze challenges for name inspiration
      const challengeFocus = this.identifyChallengeFocus(challenges);
      if (challengeFocus) {
        baseName = `${challengeFocus} Transformation`;
      } else {
        baseName = 'AI Innovation Journey';
      }
    }
    
    // Add industry context if it enhances the name
    if (industryContext && !baseName.toLowerCase().includes(industry.toLowerCase())) {
      baseName += industryContext;
    }
    
    // Clean and format the name
    return this.formatJumpName(baseName);
  },

  /**
   * Identify the core objective from user goals
   */
  identifyCoreObjective(goals: string): string | null {
    if (!goals.trim()) return null;
    
    const lowerGoals = goals.toLowerCase();
    
    // Map common goal patterns to inspiring objectives
    const objectivePatterns = [
      { keywords: ['automate', 'automation', 'streamline', 'efficiency'], objective: 'Automation Excellence' },
      { keywords: ['customer', 'client', 'service', 'support', 'experience'], objective: 'Customer Experience Revolution' },
      { keywords: ['marketing', 'content', 'social', 'brand', 'campaign'], objective: 'Marketing Intelligence' },
      { keywords: ['sales', 'revenue', 'conversion', 'lead', 'pipeline'], objective: 'Sales Acceleration' },
      { keywords: ['data', 'analytics', 'insight', 'intelligence', 'reporting'], objective: 'Data-Driven Intelligence' },
      { keywords: ['product', 'development', 'innovation', 'design', 'prototype'], objective: 'Product Innovation' },
      { keywords: ['operation', 'workflow', 'process', 'productivity'], objective: 'Operational Excellence' },
      { keywords: ['personalize', 'recommend', 'customize', 'tailor'], objective: 'Personalization Engine' },
      { keywords: ['predict', 'forecast', 'trend', 'analysis'], objective: 'Predictive Intelligence' },
      { keywords: ['creative', 'content', 'generate', 'create', 'design'], objective: 'Creative Amplification' },
      { keywords: ['research', 'analyze', 'discover', 'explore'], objective: 'Research Acceleration' },
      { keywords: ['scale', 'growth', 'expand', 'enterprise'], objective: 'Growth Acceleration' },
      { keywords: ['team', 'collaboration', 'communication', 'workplace'], objective: 'Team Transformation' },
      { keywords: ['compete', 'advantage', 'market', 'leadership'], objective: 'Competitive Edge' },
    ];
    
    // Find the best matching objective
    for (const pattern of objectivePatterns) {
      if (pattern.keywords.some(keyword => lowerGoals.includes(keyword))) {
        return pattern.objective;
      }
    }
    
    // Extract action verbs and key nouns for a custom objective
    const actionWords = this.extractKeywords(goals, 1);
    if (actionWords.length > 0) {
      const actionWord = actionWords[0].charAt(0).toUpperCase() + actionWords[0].slice(1);
      return `${actionWord} Revolution`;
    }
    
    return null;
  },

  /**
   * Generate an inspiring name based on objective and context
   */
  generateInspiringName(objective: string, industry: string, aiExperience?: string): string {
    // For beginners, use more approachable names
    const isBeginnerFriendly = aiExperience?.toLowerCase().includes('beginner') || aiExperience?.toLowerCase().includes('none');
    
    if (isBeginnerFriendly) {
      return objective.replace('Revolution', 'Journey').replace('Excellence', 'Transformation');
    }
    
    // For advanced users, keep powerful, action-oriented names
    return objective;
  },

  /**
   * Identify the main focus from challenges
   */
  identifyChallengeFocus(challenges: string): string | null {
    if (!challenges.trim()) return null;
    
    const lowerChallenges = challenges.toLowerCase();
    
    const focusPatterns = [
      { keywords: ['time', 'resource', 'capacity', 'bandwidth'], focus: 'Efficiency' },
      { keywords: ['cost', 'budget', 'expensive', 'price'], focus: 'Cost Optimization' },
      { keywords: ['quality', 'accuracy', 'precision', 'reliability'], focus: 'Quality Enhancement' },
      { keywords: ['speed', 'slow', 'delay', 'bottleneck'], focus: 'Speed' },
      { keywords: ['compete', 'behind', 'lagging', 'catch up'], focus: 'Competitive Edge' },
      { keywords: ['skill', 'knowledge', 'expertise', 'learning'], focus: 'Capability Building' },
    ];
    
    for (const pattern of focusPatterns) {
      if (pattern.keywords.some(keyword => lowerChallenges.includes(keyword))) {
        return pattern.focus;
      }
    }
    
    return null;
  },

  /**
   * Get the next jump number for a user
   */
  async getNextJumpNumber(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_jumps')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error getting jump count:', error);
        return 1;
      }
      
      return (data?.length || 0) + 1;
    } catch (error) {
      console.error('Error getting next jump number:', error);
      return 1;
    }
  },

  /**
   * Generate full jump title with name and number
   */
  async generateFullJumpTitle(formData: StudioFormData, userId?: string): Promise<JumpNameResult> {
    const name = this.generateJumpName(formData);
    const number = userId ? await this.getNextJumpNumber(userId) : 1;
    const fullTitle = `Jump #${number}: ${name}`;
    
    return {
      name,
      number,
      fullTitle
    };
  },

  /**
   * Extract meaningful keywords from text
   */
  extractKeywords(text: string, maxWords: number = 2): string[] {
    if (!text.trim()) return [];
    
    // Common words to filter out
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must', 'shall',
      'i', 'me', 'my', 'we', 'us', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her',
      'it', 'its', 'they', 'them', 'their', 'this', 'that', 'these', 'those',
      'want', 'need', 'like', 'get', 'make', 'use', 'help', 'work', 'find', 'create'
    ]);
    
    // Extract words, clean them, and filter
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 2 && 
        !stopWords.has(word) && 
        !/^\d+$/.test(word)
      )
      .slice(0, maxWords * 2); // Get more words initially to have options
    
    // Prioritize AI/tech related words and business terms
    const priorityWords = words.filter(word => 
      /^(ai|automation|machine|learning|data|analytics|digital|tech|business|marketing|sales|customer|process|strategy|growth|revenue|efficiency|productivity)/.test(word)
    );
    
    // Combine priority words with other meaningful words
    const finalWords = [...priorityWords, ...words.filter(w => !priorityWords.includes(w))];
    
    return finalWords.slice(0, maxWords);
  },

  /**
   * Format and clean the jump name
   */
  formatJumpName(name: string): string {
    return name
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .substring(0, 50); // Limit length
  },

  /**
   * Generate name using AI for more sophisticated naming (fallback method)
   */
  async generateAIJumpName(formData: StudioFormData): Promise<string> {
    try {
      // This could be extended to use AI for more sophisticated naming
      // For now, fall back to rule-based naming
      return this.generateJumpName(formData);
    } catch (error) {
      console.error('Error generating AI jump name:', error);
      return this.generateJumpName(formData);
    }
  }
};