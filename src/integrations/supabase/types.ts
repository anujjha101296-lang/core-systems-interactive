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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activity: {
        Row: {
          activity_type: string
          created_at: string
          id: number
          metadata: Json
          resource_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: number
          metadata?: Json
          resource_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: number
          metadata?: Json
          resource_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          created_at: string
          resource_id: string
          resource_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          resource_id: string
          resource_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          resource_id?: string
          resource_type?: string
          user_id?: string
        }
        Relationships: []
      }
      concept_catalog: {
        Row: {
          created_at: string
          difficulty: string
          lesson_slug: string | null
          prerequisites: string[]
          slug: string
          source_ids: string[]
          title: string
          track: string
        }
        Insert: {
          created_at?: string
          difficulty?: string
          lesson_slug?: string | null
          prerequisites?: string[]
          slug: string
          source_ids?: string[]
          title: string
          track: string
        }
        Update: {
          created_at?: string
          difficulty?: string
          lesson_slug?: string | null
          prerequisites?: string[]
          slug?: string
          source_ids?: string[]
          title?: string
          track?: string
        }
        Relationships: []
      }
      concept_mastery: {
        Row: {
          concept: string
          debugging: number
          followups: number
          interview: number
          lab: number
          last_assessed_at: string | null
          mechanism: number
          numerical: number
          track: string
          understanding: number
          user_id: string
        }
        Insert: {
          concept: string
          debugging?: number
          followups?: number
          interview?: number
          lab?: number
          last_assessed_at?: string | null
          mechanism?: number
          numerical?: number
          track: string
          understanding?: number
          user_id: string
        }
        Update: {
          concept?: string
          debugging?: number
          followups?: number
          interview?: number
          lab?: number
          last_assessed_at?: string | null
          mechanism?: number
          numerical?: number
          track?: string
          understanding?: number
          user_id?: string
        }
        Relationships: []
      }
      interview_progress: {
        Row: {
          best_score: number | null
          depth: number
          sessions: number
          topic: string
          track: string
          updated_at: string
          user_id: string
        }
        Insert: {
          best_score?: number | null
          depth?: number
          sessions?: number
          topic: string
          track: string
          updated_at?: string
          user_id: string
        }
        Update: {
          best_score?: number | null
          depth?: number
          sessions?: number
          topic?: string
          track?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lab_attempts: {
        Row: {
          completed: boolean
          completed_at: string | null
          id: number
          lab_id: string
          result: Json | null
          score: number | null
          started_at: string
          state: Json
          track: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          id?: number
          lab_id: string
          result?: Json | null
          score?: number | null
          started_at?: string
          state?: Json
          track: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          id?: number
          lab_id?: string
          result?: Json | null
          score?: number | null
          started_at?: string
          state?: Json
          track?: string
          user_id?: string
        }
        Relationships: []
      }
      lab_catalog: {
        Row: {
          concept_slugs: string[]
          created_at: string
          description: string
          difficulty: string
          id: string
          title: string
          track: string
        }
        Insert: {
          concept_slugs?: string[]
          created_at?: string
          description: string
          difficulty?: string
          id: string
          title: string
          track: string
        }
        Update: {
          concept_slugs?: string[]
          created_at?: string
          description?: string
          difficulty?: string
          id?: string
          title?: string
          track?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean
          completion_pct: number
          current_section: number
          last_visited_at: string
          lesson_slug: string
          track: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completion_pct?: number
          current_section?: number
          last_visited_at?: string
          lesson_slug: string
          track: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completion_pct?: number
          current_section?: number
          last_visited_at?: string
          lesson_slug?: string
          track?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      question_attempts: {
        Row: {
          answer: Json | null
          attempt_number: number
          created_at: string
          explanation_viewed: boolean
          id: number
          is_correct: boolean | null
          lesson_slug: string | null
          question_id: string
          question_type: string
          solution_revealed: boolean
          time_spent_seconds: number | null
          track: string
          user_id: string
        }
        Insert: {
          answer?: Json | null
          attempt_number?: number
          created_at?: string
          explanation_viewed?: boolean
          id?: number
          is_correct?: boolean | null
          lesson_slug?: string | null
          question_id: string
          question_type: string
          solution_revealed?: boolean
          time_spent_seconds?: number | null
          track: string
          user_id: string
        }
        Update: {
          answer?: Json | null
          attempt_number?: number
          created_at?: string
          explanation_viewed?: boolean
          id?: number
          is_correct?: boolean | null
          lesson_slug?: string | null
          question_id?: string
          question_type?: string
          solution_revealed?: boolean
          time_spent_seconds?: number | null
          track?: string
          user_id?: string
        }
        Relationships: []
      }
      question_bank: {
        Row: {
          answer: Json
          common_mistake: string | null
          concept_slug: string
          created_at: string
          difficulty: string
          explanation: string
          follow_up: string | null
          id: string
          kind: string
          lab_id: string | null
          lesson_slug: string
          options: Json | null
          prompt: string
          track: string
          tradeoff: string | null
        }
        Insert: {
          answer: Json
          common_mistake?: string | null
          concept_slug: string
          created_at?: string
          difficulty: string
          explanation: string
          follow_up?: string | null
          id: string
          kind: string
          lab_id?: string | null
          lesson_slug: string
          options?: Json | null
          prompt: string
          track: string
          tradeoff?: string | null
        }
        Update: {
          answer?: Json
          common_mistake?: string | null
          concept_slug?: string
          created_at?: string
          difficulty?: string
          explanation?: string
          follow_up?: string | null
          id?: string
          kind?: string
          lab_id?: string | null
          lesson_slug?: string
          options?: Json | null
          prompt?: string
          track?: string
          tradeoff?: string | null
        }
        Relationships: []
      }
      source_registry: {
        Row: {
          created_at: string
          id: string
          kind: string
          notes: string | null
          scope: string
          title: string
          url: string
        }
        Insert: {
          created_at?: string
          id: string
          kind: string
          notes?: string | null
          scope: string
          title: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          notes?: string | null
          scope?: string
          title?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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