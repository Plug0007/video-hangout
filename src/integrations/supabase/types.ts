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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string
          expires_at: string | null
          id: string
          read: boolean
          sender_id: string
          session_type: Database["public"]["Enums"]["session_type"]
        }
        Insert: {
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          read?: boolean
          sender_id: string
          session_type?: Database["public"]["Enums"]["session_type"]
        }
        Update: {
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          read?: boolean
          sender_id?: string
          session_type?: Database["public"]["Enums"]["session_type"]
        }
        Relationships: []
      }
      chat_presence: {
        Row: {
          expires_at: string | null
          id: string
          is_online: boolean
          is_typing: boolean
          last_seen: string
          nickname: string
          session_type: Database["public"]["Enums"]["session_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          id?: string
          is_online?: boolean
          is_typing?: boolean
          last_seen?: string
          nickname: string
          session_type?: Database["public"]["Enums"]["session_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          id?: string
          is_online?: boolean
          is_typing?: boolean
          last_seen?: string
          nickname?: string
          session_type?: Database["public"]["Enums"]["session_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_rooms: {
        Row: {
          created_at: string
          last_activity: string
          participant1_token: string
          participant2_token: string
          room_id: string
        }
        Insert: {
          created_at?: string
          last_activity?: string
          participant1_token: string
          participant2_token: string
          room_id: string
        }
        Update: {
          created_at?: string
          last_activity?: string
          participant1_token?: string
          participant2_token?: string
          room_id?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      event_types: {
        Row: {
          color: string
          created_at: string
          id: number
          name: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          coordinator_contact: string | null
          coordinator_name: string
          created_at: string
          department_id: number | null
          description: string | null
          end_time: string
          event_type_id: number
          id: string
          location: string
          poster_url: string | null
          start_time: string
          status: Database["public"]["Enums"]["event_status"]
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          coordinator_contact?: string | null
          coordinator_name: string
          created_at?: string
          department_id?: number | null
          description?: string | null
          end_time: string
          event_type_id: number
          id?: string
          location: string
          poster_url?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["event_status"]
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          coordinator_contact?: string | null
          coordinator_name?: string
          created_at?: string
          department_id?: number | null
          description?: string | null
          end_time?: string
          event_type_id?: number
          id?: string
          location?: string
          poster_url?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["event_status"]
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_log: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          feature_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          feature_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          feature_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      field_detection_patterns: {
        Row: {
          created_at: string
          field_type: string
          id: string
          pattern: string
          priority: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          field_type: string
          id?: string
          pattern: string
          priority?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          field_type?: string
          id?: string
          pattern?: string
          priority?: number
          updated_at?: string
        }
        Relationships: []
      }
      fixtures: {
        Row: {
          away_team_id: string
          away_team_score: number | null
          created_at: string
          home_team_id: string
          home_team_score: number | null
          id: string
          match_date: string
          status: string
          venue: string
        }
        Insert: {
          away_team_id: string
          away_team_score?: number | null
          created_at?: string
          home_team_id: string
          home_team_score?: number | null
          id?: string
          match_date: string
          status: string
          venue: string
        }
        Update: {
          away_team_id?: string
          away_team_score?: number | null
          created_at?: string
          home_team_id?: string
          home_team_score?: number | null
          id?: string
          match_date?: string
          status?: string
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "fixtures_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      form_fills: {
        Row: {
          created_at: string
          field_mappings: Json
          filled_data: Json
          form_html: string | null
          form_name: string
          form_url: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          field_mappings: Json
          filled_data: Json
          form_html?: string | null
          form_name: string
          form_url: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          field_mappings?: Json
          filled_data?: Json
          form_html?: string | null
          form_name?: string
          form_url?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      match_events: {
        Row: {
          additional_info: string | null
          created_at: string
          event_type: string
          fixture_id: string
          id: string
          minute: number
          player_id: string
        }
        Insert: {
          additional_info?: string | null
          created_at?: string
          event_type: string
          fixture_id: string
          id?: string
          minute: number
          player_id: string
        }
        Update: {
          additional_info?: string | null
          created_at?: string
          event_type?: string
          fixture_id?: string
          id?: string
          minute?: number
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_events_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          expires_at: string | null
          id: string
          is_temporary: boolean | null
          receiver_token: string
          room_id: string
          sender_token: string
          status: Database["public"]["Enums"]["message_status"]
          timestamp: string
        }
        Insert: {
          content: string
          expires_at?: string | null
          id?: string
          is_temporary?: boolean | null
          receiver_token: string
          room_id: string
          sender_token: string
          status?: Database["public"]["Enums"]["message_status"]
          timestamp?: string
        }
        Update: {
          content?: string
          expires_at?: string | null
          id?: string
          is_temporary?: boolean | null
          receiver_token?: string
          room_id?: string
          sender_token?: string
          status?: Database["public"]["Enums"]["message_status"]
          timestamp?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          related_event_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          related_event_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          related_event_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_event_id_fkey"
            columns: ["related_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string
          date_of_birth: string | null
          first_name: string
          id: string
          jersey_number: number | null
          last_name: string
          nationality: string | null
          photo_url: string | null
          position: string
          team_id: string | null
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          first_name: string
          id?: string
          jersey_number?: number | null
          last_name: string
          nationality?: string | null
          photo_url?: string | null
          position: string
          team_id?: string | null
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          first_name?: string
          id?: string
          jersey_number?: number | null
          last_name?: string
          nationality?: string | null
          photo_url?: string | null
          position?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      product_changes: {
        Row: {
          ai_tips: string[] | null
          change_type: string
          detected_at: string | null
          id: string
          new_value: string | null
          old_value: string | null
          product_id: string | null
          telegram_sent: boolean | null
        }
        Insert: {
          ai_tips?: string[] | null
          change_type: string
          detected_at?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          product_id?: string | null
          telegram_sent?: boolean | null
        }
        Update: {
          ai_tips?: string[] | null
          change_type?: string
          detected_at?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          product_id?: string | null
          telegram_sent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "product_changes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          chat_id: string
          check_count: number | null
          created_at: string | null
          id: string
          last_checked: string | null
          last_description: string | null
          last_image_url: string | null
          name: string
          status: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          chat_id: string
          check_count?: number | null
          created_at?: string | null
          id?: string
          last_checked?: string | null
          last_description?: string | null
          last_image_url?: string | null
          name: string
          status?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          chat_id?: string
          check_count?: number | null
          created_at?: string | null
          id?: string
          last_checked?: string | null
          last_description?: string | null
          last_image_url?: string | null
          name?: string
          status?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department_id: number | null
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department_id?: number | null
          email: string
          id: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department_id?: number | null
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          created_at: string
          id: string
          subscription_json: string
          updated_at: string
          user_token: string
        }
        Insert: {
          created_at?: string
          id?: string
          subscription_json: string
          updated_at?: string
          user_token: string
        }
        Update: {
          created_at?: string
          id?: string
          subscription_json?: string
          updated_at?: string
          user_token?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          hint_text: string | null
          id: string
          order_number: number
          question_text: string
          task_id: string | null
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          hint_text?: string | null
          id?: string
          order_number: number
          question_text: string
          task_id?: string | null
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          hint_text?: string | null
          id?: string
          order_number?: number
          question_text?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          credits: string | null
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          duration: string
          id: string
          title: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          credits?: string | null
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          duration: string
          id?: string
          title: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          credits?: string | null
          description?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          duration?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "sim_users"
            referencedColumns: ["id"]
          },
        ]
      }
      secret_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          room_id: string
          timestamp: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          room_id: string
          timestamp?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          room_id?: string
          timestamp?: string
        }
        Relationships: []
      }
      sim_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      tasks: {
        Row: {
          content_markdown: string
          created_at: string | null
          id: string
          order_number: number
          room_id: string | null
          title: string
        }
        Insert: {
          content_markdown: string
          created_at?: string | null
          id?: string
          order_number: number
          room_id?: string | null
          title: string
        }
        Update: {
          content_markdown?: string
          created_at?: string | null
          id?: string
          order_number?: number
          room_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          short_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          short_name: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          short_name?: string
        }
        Relationships: []
      }
      user_answers: {
        Row: {
          id: string
          is_correct: boolean
          question_id: string | null
          submitted_answer: string
          submitted_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          is_correct: boolean
          question_id?: string | null
          submitted_answer: string
          submitted_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          is_correct?: boolean
          question_id?: string | null
          submitted_answer?: string
          submitted_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "sim_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_presence: {
        Row: {
          is_online: boolean
          is_typing: boolean
          last_active: string
          nickname: string
          typing_in_room: string | null
          user_token: string
        }
        Insert: {
          is_online?: boolean
          is_typing?: boolean
          last_active?: string
          nickname: string
          typing_in_room?: string | null
          user_token: string
        }
        Update: {
          is_online?: boolean
          is_typing?: boolean
          last_active?: string
          nickname?: string
          typing_in_room?: string | null
          user_token?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          aadhar_number: string | null
          account_number: string | null
          account_type: string | null
          alternate_phone: string | null
          annual_income: string | null
          bank_name: string | null
          city: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          driving_license: string | null
          email: string | null
          employer_name: string | null
          first_name: string | null
          gender: string | null
          highest_qualification: string | null
          id: string
          ifsc_code: string | null
          last_name: string | null
          marital_status: string | null
          nationality: string | null
          occupation: string | null
          pan_number: string | null
          passport_number: string | null
          permanent_city: string | null
          permanent_country: string | null
          permanent_pin_code: string | null
          permanent_state: string | null
          permanent_street_address: string | null
          phone: string | null
          pin_code: string | null
          signature: string | null
          state: string | null
          street_address: string | null
          updated_at: string | null
          voter_id: string | null
        }
        Insert: {
          aadhar_number?: string | null
          account_number?: string | null
          account_type?: string | null
          alternate_phone?: string | null
          annual_income?: string | null
          bank_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          driving_license?: string | null
          email?: string | null
          employer_name?: string | null
          first_name?: string | null
          gender?: string | null
          highest_qualification?: string | null
          id: string
          ifsc_code?: string | null
          last_name?: string | null
          marital_status?: string | null
          nationality?: string | null
          occupation?: string | null
          pan_number?: string | null
          passport_number?: string | null
          permanent_city?: string | null
          permanent_country?: string | null
          permanent_pin_code?: string | null
          permanent_state?: string | null
          permanent_street_address?: string | null
          phone?: string | null
          pin_code?: string | null
          signature?: string | null
          state?: string | null
          street_address?: string | null
          updated_at?: string | null
          voter_id?: string | null
        }
        Update: {
          aadhar_number?: string | null
          account_number?: string | null
          account_type?: string | null
          alternate_phone?: string | null
          annual_income?: string | null
          bank_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          driving_license?: string | null
          email?: string | null
          employer_name?: string | null
          first_name?: string | null
          gender?: string | null
          highest_qualification?: string | null
          id?: string
          ifsc_code?: string | null
          last_name?: string | null
          marital_status?: string | null
          nationality?: string | null
          occupation?: string | null
          pan_number?: string | null
          passport_number?: string | null
          permanent_city?: string | null
          permanent_country?: string | null
          permanent_pin_code?: string | null
          permanent_state?: string | null
          permanent_street_address?: string | null
          phone?: string | null
          pin_code?: string | null
          signature?: string | null
          state?: string | null
          street_address?: string | null
          updated_at?: string | null
          voter_id?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed_at: string | null
          completed_percent: number | null
          id: string
          room_id: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_percent?: number | null
          id?: string
          room_id?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_percent?: number | null
          id?: string
          room_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "sim_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_secret_locks: {
        Row: {
          created_at: string
          id: string
          password_hash: string
          updated_at: string
          user_token: string
        }
        Insert: {
          created_at?: string
          id?: string
          password_hash: string
          updated_at?: string
          user_token: string
        }
        Update: {
          created_at?: string
          id?: string
          password_hash?: string
          updated_at?: string
          user_token?: string
        }
        Relationships: []
      }
      vanish_messages: {
        Row: {
          content: string
          expires_at: string | null
          id: string
          is_seen: boolean | null
          receiver_token: string
          room_id: string
          sender_token: string
          timestamp: string | null
        }
        Insert: {
          content: string
          expires_at?: string | null
          id?: string
          is_seen?: boolean | null
          receiver_token: string
          room_id: string
          sender_token: string
          timestamp?: string | null
        }
        Update: {
          content?: string
          expires_at?: string | null
          id?: string
          is_seen?: boolean | null
          receiver_token?: string
          room_id?: string
          sender_token?: string
          timestamp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_chat_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_messages: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_event_reminders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_has_role: {
        Args: { role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
    }
    Enums: {
      difficulty_level: "Easy" | "Medium" | "Hard"
      event_status:
        | "pending"
        | "approved"
        | "rejected"
        | "completed"
        | "cancelled"
      message_status: "sent" | "delivered" | "read"
      session_type: "permanent" | "temporary"
      user_role: "admin" | "teacher"
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
    Enums: {
      difficulty_level: ["Easy", "Medium", "Hard"],
      event_status: [
        "pending",
        "approved",
        "rejected",
        "completed",
        "cancelled",
      ],
      message_status: ["sent", "delivered", "read"],
      session_type: ["permanent", "temporary"],
      user_role: ["admin", "teacher"],
    },
  },
} as const
