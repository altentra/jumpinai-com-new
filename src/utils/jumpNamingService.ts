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
    const { goals, industry, challenges } = formData;
    
    // Extract key words from goals (main focus)
    const goalKeywords = this.extractKeywords(goals, 2);
    
    // Extract industry context
    const industryContext = industry.trim() ? ` ${industry}` : '';
    
    // Create base name from goals and industry
    let baseName = '';
    
    if (goalKeywords.length > 0) {
      baseName = goalKeywords.join(' ');
    } else {
      // Fallback based on challenges or generic
      const challengeKeywords = this.extractKeywords(challenges, 1);
      baseName = challengeKeywords.length > 0 ? challengeKeywords[0] : 'AI Transformation';
    }
    
    // Add industry context if available
    if (industryContext) {
      baseName += industryContext;
    }
    
    // Clean and format the name
    return this.formatJumpName(baseName);
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