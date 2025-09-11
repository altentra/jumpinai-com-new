export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      contact_activities: {
        Row: {
          activity_type: string
          contact_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          source: string
        }
        Insert: {
          activity_type: string
          contact_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          source: string
        }
        Update: {
          activity_type?: string
          contact_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          lead_magnet_downloaded: boolean | null
          newsletter_subscribed: boolean | null
          notes: string | null
          source: string
          status: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          lead_magnet_downloaded?: boolean | null
          newsletter_subscribed?: boolean | null
          notes?: string | null
          source: string
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          lead_magnet_downloaded?: boolean | null
          newsletter_subscribed?: boolean | null
          notes?: string | null
          source?: string
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      lead_magnet_downloads: {
        Row: {
          downloaded_at: string
          email: string
          id: string
          ip_address: string | null
          pdf_name: string
          user_agent: string | null
        }
        Insert: {
          downloaded_at?: string
          email: string
          id?: string
          ip_address?: string | null
          pdf_name?: string
          user_agent?: string | null
        }
        Update: {
          downloaded_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          pdf_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          source: string | null
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          download_count: number | null
          download_token: string | null
          id: string
          max_downloads: number | null
          product_id: string
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          download_count?: number | null
          download_token?: string | null
          id?: string
          max_downloads?: number | null
          product_id: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          download_count?: number | null
          download_token?: string | null
          id?: string
          max_downloads?: number | null
          product_id?: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          id: string
          name: string
          price: number
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          id?: string
          name: string
          price?: number
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          id?: string
          name?: string
          price?: number
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email_verification_expires_at: string | null
          email_verification_token: string | null
          email_verified: boolean | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email_verification_expires_at?: string | null
          email_verification_token?: string | null
          email_verified?: boolean | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email_verification_expires_at?: string | null
          email_verification_token?: string | null
          email_verified?: boolean | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_blueprints: {
        Row: {
          ai_tools: string[] | null
          blueprint_content: Json
          category: string | null
          created_at: string
          deliverables: string[] | null
          description: string | null
          difficulty_level: string | null
          id: string
          implementation: string | null
          implementation_time: string | null
          instructions: string | null
          jump_id: string | null
          requirements: string[] | null
          resources_needed: string[] | null
          tags: string[] | null
          title: string
          tools_used: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_tools?: string[] | null
          blueprint_content: Json
          category?: string | null
          created_at?: string
          deliverables?: string[] | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          implementation?: string | null
          implementation_time?: string | null
          instructions?: string | null
          jump_id?: string | null
          requirements?: string[] | null
          resources_needed?: string[] | null
          tags?: string[] | null
          title: string
          tools_used?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_tools?: string[] | null
          blueprint_content?: Json
          category?: string | null
          created_at?: string
          deliverables?: string[] | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          implementation?: string | null
          implementation_time?: string | null
          instructions?: string | null
          jump_id?: string | null
          requirements?: string[] | null
          resources_needed?: string[] | null
          tags?: string[] | null
          title?: string
          tools_used?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_blueprints_jump_id"
            columns: ["jump_id"]
            isOneToOne: false
            referencedRelation: "user_jumps"
            referencedColumns: ["id"]
          },
        ]
      }
      user_jumps: {
        Row: {
          completion_percentage: number | null
          comprehensive_plan: Json | null
          created_at: string
          full_content: string
          id: string
          jump_type: string | null
          profile_id: string | null
          status: string | null
          structured_plan: Json | null
          summary: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completion_percentage?: number | null
          comprehensive_plan?: Json | null
          created_at?: string
          full_content: string
          id?: string
          jump_type?: string | null
          profile_id?: string | null
          status?: string | null
          structured_plan?: Json | null
          summary?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completion_percentage?: number | null
          comprehensive_plan?: Json | null
          created_at?: string
          full_content?: string
          id?: string
          jump_type?: string | null
          profile_id?: string | null
          status?: string | null
          structured_plan?: Json | null
          summary?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_jumps_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          ai_knowledge: string | null
          budget: string | null
          challenges: string | null
          created_at: string
          current_role_value: string | null
          experience_level: string | null
          goals: string | null
          id: string
          industry: string | null
          is_active: boolean
          profile_name: string
          time_commitment: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_knowledge?: string | null
          budget?: string | null
          challenges?: string | null
          created_at?: string
          current_role_value?: string | null
          experience_level?: string | null
          goals?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean
          profile_name?: string
          time_commitment?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_knowledge?: string | null
          budget?: string | null
          challenges?: string | null
          created_at?: string
          current_role_value?: string | null
          experience_level?: string | null
          goals?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean
          profile_name?: string
          time_commitment?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_prompts: {
        Row: {
          ai_tools: string[] | null
          category: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          estimated_time: string | null
          id: string
          instructions: string | null
          jump_id: string | null
          prompt_text: string
          tags: string[] | null
          title: string
          updated_at: string
          use_cases: string[] | null
          user_id: string
        }
        Insert: {
          ai_tools?: string[] | null
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          estimated_time?: string | null
          id?: string
          instructions?: string | null
          jump_id?: string | null
          prompt_text: string
          tags?: string[] | null
          title: string
          updated_at?: string
          use_cases?: string[] | null
          user_id: string
        }
        Update: {
          ai_tools?: string[] | null
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          estimated_time?: string | null
          id?: string
          instructions?: string | null
          jump_id?: string | null
          prompt_text?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          use_cases?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_prompts_jump_id"
            columns: ["jump_id"]
            isOneToOne: false
            referencedRelation: "user_jumps"
            referencedColumns: ["id"]
          },
        ]
      }
      user_strategies: {
        Row: {
          ai_tools: string[] | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          instructions: string | null
          jump_id: string | null
          key_actions: string[] | null
          mitigation_strategies: string[] | null
          potential_challenges: string[] | null
          priority_level: string | null
          resource_requirements: string[] | null
          strategy_framework: Json
          success_metrics: string[] | null
          tags: string[] | null
          timeline: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_tools?: string[] | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instructions?: string | null
          jump_id?: string | null
          key_actions?: string[] | null
          mitigation_strategies?: string[] | null
          potential_challenges?: string[] | null
          priority_level?: string | null
          resource_requirements?: string[] | null
          strategy_framework: Json
          success_metrics?: string[] | null
          tags?: string[] | null
          timeline?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_tools?: string[] | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instructions?: string | null
          jump_id?: string | null
          key_actions?: string[] | null
          mitigation_strategies?: string[] | null
          potential_challenges?: string[] | null
          priority_level?: string | null
          resource_requirements?: string[] | null
          strategy_framework?: Json
          success_metrics?: string[] | null
          tags?: string[] | null
          timeline?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_strategies_jump_id"
            columns: ["jump_id"]
            isOneToOne: false
            referencedRelation: "user_jumps"
            referencedColumns: ["id"]
          },
        ]
      }
      user_workflows: {
        Row: {
          ai_tools: string[] | null
          category: string | null
          complexity_level: string | null
          created_at: string
          description: string | null
          duration_estimate: string | null
          expected_outcomes: string[] | null
          id: string
          instructions: string | null
          jump_id: string | null
          prerequisites: string[] | null
          skill_level: string | null
          tags: string[] | null
          title: string
          tools_needed: string[] | null
          updated_at: string
          user_id: string
          workflow_steps: Json
        }
        Insert: {
          ai_tools?: string[] | null
          category?: string | null
          complexity_level?: string | null
          created_at?: string
          description?: string | null
          duration_estimate?: string | null
          expected_outcomes?: string[] | null
          id?: string
          instructions?: string | null
          jump_id?: string | null
          prerequisites?: string[] | null
          skill_level?: string | null
          tags?: string[] | null
          title: string
          tools_needed?: string[] | null
          updated_at?: string
          user_id: string
          workflow_steps: Json
        }
        Update: {
          ai_tools?: string[] | null
          category?: string | null
          complexity_level?: string | null
          created_at?: string
          description?: string | null
          duration_estimate?: string | null
          expected_outcomes?: string[] | null
          id?: string
          instructions?: string | null
          jump_id?: string | null
          prerequisites?: string[] | null
          skill_level?: string | null
          tags?: string[] | null
          title?: string
          tools_needed?: string[] | null
          updated_at?: string
          user_id?: string
          workflow_steps?: Json
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_workflows_jump_id"
            columns: ["jump_id"]
            isOneToOne: false
            referencedRelation: "user_jumps"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          email_col: string
          limit_count: number
          table_name: string
          time_col: string
          time_window_hours?: number
          user_email: string
        }
        Returns: boolean
      }
      upsert_contact: {
        Args: {
          p_email: string
          p_first_name?: string
          p_last_name?: string
          p_lead_magnet_downloaded?: boolean
          p_newsletter_subscribed?: boolean
          p_source?: string
          p_tags?: string[]
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
