export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      error_log: {
        Row: {
          beschreibung: string | null;
          created_at: string;
          id: string;
          quelle: string | null;
          thema: string | null;
          user_id: string;
        };
        Insert: {
          beschreibung?: string | null;
          created_at?: string;
          id?: string;
          quelle?: string | null;
          thema?: string | null;
          user_id: string;
        };
        Update: {
          beschreibung?: string | null;
          created_at?: string;
          id?: string;
          quelle?: string | null;
          thema?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      exam_answers: {
        Row: {
          antworttext: string | null;
          attempt_id: string;
          id: string;
          ki_feedback: string | null;
          ki_punkte: number | null;
          question_id: string | null;
        };
        Insert: {
          antworttext?: string | null;
          attempt_id: string;
          id?: string;
          ki_feedback?: string | null;
          ki_punkte?: number | null;
          question_id?: string | null;
        };
        Update: {
          antworttext?: string | null;
          attempt_id?: string;
          id?: string;
          ki_feedback?: string | null;
          ki_punkte?: number | null;
          question_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "exam_answers_attempt_id_fkey";
            columns: ["attempt_id"];
            isOneToOne: false;
            referencedRelation: "exam_attempts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exam_answers_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "exam_questions";
            referencedColumns: ["id"];
          },
        ];
      };
      exam_attempts: {
        Row: {
          exam_id: string | null;
          finished_at: string | null;
          gesamtpunkte: number | null;
          id: string;
          started_at: string;
          user_id: string;
        };
        Insert: {
          exam_id?: string | null;
          finished_at?: string | null;
          gesamtpunkte?: number | null;
          id?: string;
          started_at?: string;
          user_id: string;
        };
        Update: {
          exam_id?: string | null;
          finished_at?: string | null;
          gesamtpunkte?: number | null;
          id?: string;
          started_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      exam_questions: {
        Row: {
          aufgabe_nr: number | null;
          exam_id: string | null;
          frage: string | null;
          id: string;
          max_punkte: number | null;
          musterloesung: string | null;
          teil: string | null;
        };
        Insert: {
          aufgabe_nr?: number | null;
          exam_id?: string | null;
          frage?: string | null;
          id: string;
          max_punkte?: number | null;
          musterloesung?: string | null;
          teil?: string | null;
        };
        Update: {
          aufgabe_nr?: number | null;
          exam_id?: string | null;
          frage?: string | null;
          id?: string;
          max_punkte?: number | null;
          musterloesung?: string | null;
          teil?: string | null;
        };
        Relationships: [];
      };
      flashcard_progress: {
        Row: {
          card_id: string;
          falsch: number;
          richtig: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          card_id: string;
          falsch?: number;
          richtig?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          card_id?: string;
          falsch?: number;
          richtig?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      topic_mastery: {
        Row: {
          falsch: number;
          richtig: number;
          topic_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          falsch?: number;
          richtig?: number;
          topic_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          falsch?: number;
          richtig?: number;
          topic_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_flashcard_progress: {
        Args: { p_card_id: string; p_correct: boolean };
        Returns: undefined;
      };
      increment_topic_mastery: {
        Args: { p_topic_id: string; p_correct: boolean };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
