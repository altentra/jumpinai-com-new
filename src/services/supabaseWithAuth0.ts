import { supabase } from "@/integrations/supabase/client";

export class SupabaseWithAuth0 {
  constructor(private getAuthHeaders: () => Promise<Record<string, string>>) {}

  async invokeFunction(functionName: string, options: any = {}) {
    try {
      const headers = await this.getAuthHeaders();
      
      // For functions that need authentication, add the Auth0 token
      const functionOptions = {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        }
      };

      return await supabase.functions.invoke(functionName, functionOptions);
    } catch (error) {
      console.error(`Error invoking function ${functionName}:`, error);
      throw error;
    }
  }

  // Wrapper for functions that don't need auth
  async invokePublicFunction(functionName: string, options: any = {}) {
    return await supabase.functions.invoke(functionName, options);
  }
}