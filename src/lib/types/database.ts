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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          description: Json | null
          id: string
          image_url: string | null
          intent_id: string | null
          name: Json
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: Json | null
          id?: string
          image_url?: string | null
          intent_id?: string | null
          name: Json
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: Json | null
          id?: string
          image_url?: string | null
          intent_id?: string | null
          name?: Json
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_intent_id_fkey"
            columns: ["intent_id"]
            isOneToOne: false
            referencedRelation: "intents"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          bio: Json | null
          created_at: string | null
          experience_years: number | null
          hospital_id: string | null
          id: string
          languages: string[] | null
          name: Json
          photo_url: string | null
          publications: Json | null
          slug: string
          specialty: Json | null
        }
        Insert: {
          bio?: Json | null
          created_at?: string | null
          experience_years?: number | null
          hospital_id?: string | null
          id?: string
          languages?: string[] | null
          name: Json
          photo_url?: string | null
          publications?: Json | null
          slug: string
          specialty?: Json | null
        }
        Update: {
          bio?: Json | null
          created_at?: string | null
          experience_years?: number | null
          hospital_id?: string | null
          id?: string
          languages?: string[] | null
          name?: Json
          photo_url?: string | null
          publications?: Json | null
          slug?: string
          specialty?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence: {
        Row: {
          created_at: string | null
          description: string | null
          hospital_procedure_id: string | null
          id: string
          source_type: string
          source_url: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          hospital_procedure_id?: string | null
          id?: string
          source_type: string
          source_url?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          hospital_procedure_id?: string | null
          id?: string
          source_type?: string
          source_url?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_hospital_procedure_id_fkey"
            columns: ["hospital_procedure_id"]
            isOneToOne: false
            referencedRelation: "hospital_procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: Json
          created_at: string | null
          id: string
          question: Json
          service_id: string | null
          sort_order: number | null
        }
        Insert: {
          answer: Json
          created_at?: string | null
          id?: string
          question: Json
          service_id?: string | null
          sort_order?: number | null
        }
        Update: {
          answer?: Json
          created_at?: string | null
          id?: string
          question?: Json
          service_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faqs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_procedures: {
        Row: {
          annual_volume: number | null
          cost_currency: string | null
          cost_max: number | null
          cost_min: number | null
          created_at: string | null
          evidence_score: number | null
          hospital_id: string | null
          id: string
          intl_patient_support: boolean | null
          is_featured: boolean | null
          languages: string[] | null
          procedure_id: string | null
          specialist_count: number | null
          waiting_time_days: number | null
        }
        Insert: {
          annual_volume?: number | null
          cost_currency?: string | null
          cost_max?: number | null
          cost_min?: number | null
          created_at?: string | null
          evidence_score?: number | null
          hospital_id?: string | null
          id?: string
          intl_patient_support?: boolean | null
          is_featured?: boolean | null
          languages?: string[] | null
          procedure_id?: string | null
          specialist_count?: number | null
          waiting_time_days?: number | null
        }
        Update: {
          annual_volume?: number | null
          cost_currency?: string | null
          cost_max?: number | null
          cost_min?: number | null
          created_at?: string | null
          evidence_score?: number | null
          hospital_id?: string | null
          id?: string
          intl_patient_support?: boolean | null
          is_featured?: boolean | null
          languages?: string[] | null
          procedure_id?: string | null
          specialist_count?: number | null
          waiting_time_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hospital_procedures_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospital_procedures_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          accreditation: string | null
          address: Json | null
          annual_patients: number | null
          awards: Json | null
          city: string | null
          created_at: string | null
          description: Json | null
          email: string | null
          founded_year: number | null
          gallery_images: Json | null
          hero_image_url: string | null
          id: string
          international_center: boolean | null
          is_featured: boolean | null
          languages: string[] | null
          logo_url: string | null
          name: Json
          phone: string | null
          slug: string
          videos: Json | null
          website: string | null
        }
        Insert: {
          accreditation?: string | null
          address?: Json | null
          annual_patients?: number | null
          awards?: Json | null
          city?: string | null
          created_at?: string | null
          description?: Json | null
          email?: string | null
          founded_year?: number | null
          gallery_images?: Json | null
          hero_image_url?: string | null
          id?: string
          international_center?: boolean | null
          is_featured?: boolean | null
          languages?: string[] | null
          logo_url?: string | null
          name: Json
          phone?: string | null
          slug: string
          videos?: Json | null
          website?: string | null
        }
        Update: {
          accreditation?: string | null
          address?: Json | null
          annual_patients?: number | null
          awards?: Json | null
          city?: string | null
          created_at?: string | null
          description?: Json | null
          email?: string | null
          founded_year?: number | null
          gallery_images?: Json | null
          hero_image_url?: string | null
          id?: string
          international_center?: boolean | null
          is_featured?: boolean | null
          languages?: string[] | null
          logo_url?: string | null
          name?: Json
          phone?: string | null
          slug?: string
          videos?: Json | null
          website?: string | null
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          created_at: string | null
          email: string
          hospital_id: string | null
          id: string
          message: string | null
          name: string
          nationality: string | null
          phone: string | null
          procedure_id: string | null
          service_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          hospital_id?: string | null
          id?: string
          message?: string | null
          name: string
          nationality?: string | null
          phone?: string | null
          procedure_id?: string | null
          service_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          hospital_id?: string | null
          id?: string
          message?: string | null
          name?: string
          nationality?: string | null
          phone?: string | null
          procedure_id?: string | null
          service_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      intents: {
        Row: {
          created_at: string | null
          id: string
          name: Json
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: Json
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: Json
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      procedures: {
        Row: {
          created_at: string | null
          description: Json | null
          id: string
          name: Json
          service_id: string | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: Json | null
          id?: string
          name: Json
          service_id?: string | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: Json | null
          id?: string
          name?: Json
          service_id?: string | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "procedures_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_provider: string | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          hospital_id: string | null
          id: string
          nationality: string | null
          phone: string | null
          role: string | null
        }
        Insert: {
          auth_provider?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          hospital_id?: string | null
          id: string
          nationality?: string | null
          phone?: string | null
          role?: string | null
        }
        Update: {
          auth_provider?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          hospital_id?: string | null
          id?: string
          nationality?: string | null
          phone?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      review_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_comments_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          content: string
          created_at: string | null
          hospital_id: string
          id: string
          is_verified: boolean | null
          media: Json | null
          procedure_id: string | null
          rating: number
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          hospital_id: string
          id?: string
          is_verified?: boolean | null
          media?: Json | null
          procedure_id?: string | null
          rating: number
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          hospital_id?: string
          id?: string
          is_verified?: boolean | null
          media?: Json | null
          procedure_id?: string | null
          rating?: number
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          id: string
          profile_id: string
          company_name: string | null
          country: string | null
          commission_rate: number | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          company_name?: string | null
          country?: string | null
          commission_rate?: number | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          company_name?: string | null
          country?: string | null
          commission_rate?: number | null
          status?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      case_notes: {
        Row: {
          id: string
          case_id: string
          author_id: string
          content: string
          created_at: string | null
        }
        Insert: {
          id?: string
          case_id: string
          author_id: string
          content: string
          created_at?: string | null
        }
        Update: {
          id?: string
          case_id?: string
          author_id?: string
          content?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          id: string
          agent_id: string
          cure_partner_id: string | null
          hospital_id: string
          patient_name: string
          patient_email: string
          patient_phone: string | null
          patient_nationality: string | null
          service_id: string | null
          procedure_id: string | null
          source: string | null
          status: string | null
          checklist: Json | null
          arrived_at: string | null
          in_treatment_at: string | null
          completed_at: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          agent_id: string
          cure_partner_id?: string | null
          hospital_id: string
          patient_name: string
          patient_email: string
          patient_phone?: string | null
          patient_nationality?: string | null
          service_id?: string | null
          procedure_id?: string | null
          source?: string | null
          status?: string | null
          checklist?: Json | null
          arrived_at?: string | null
          in_treatment_at?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          agent_id?: string
          cure_partner_id?: string | null
          hospital_id?: string
          patient_name?: string
          patient_email?: string
          patient_phone?: string | null
          patient_nationality?: string | null
          service_id?: string | null
          procedure_id?: string | null
          source?: string | null
          status?: string | null
          checklist?: Json | null
          arrived_at?: string | null
          in_treatment_at?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_cure_partner_id_fkey"
            columns: ["cure_partner_id"]
            isOneToOne: false
            referencedRelation: "cure_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          id: string
          case_id: string
          agent_id: string
          amount: number
          currency: string | null
          status: string | null
          paid_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          case_id: string
          agent_id: string
          amount: number
          currency?: string | null
          status?: string | null
          paid_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          case_id?: string
          agent_id?: string
          amount?: number
          currency?: string | null
          status?: string | null
          paid_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      cure_partners: {
        Row: {
          id: string
          profile_id: string
          full_name: string | null
          languages: string[] | null
          specialty_areas: string[] | null
          status: string | null
          created_at: string | null
          photo_url: string | null
          title: Json | null
          bio: Json | null
          nationality: string | null
          base_country: string | null
          service_regions: string[] | null
          certifications: string[] | null
          years_experience: number | null
          patient_count: number | null
          contact_whatsapp: string | null
          contact_wechat: string | null
          vip_level: string | null
          protocol_features: string[] | null
          partner_hospitals: string[] | null
          intro_video_url: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          full_name?: string | null
          languages?: string[] | null
          specialty_areas?: string[] | null
          status?: string | null
          created_at?: string | null
          photo_url?: string | null
          title?: Json | null
          bio?: Json | null
          nationality?: string | null
          base_country?: string | null
          service_regions?: string[] | null
          certifications?: string[] | null
          years_experience?: number | null
          patient_count?: number | null
          contact_whatsapp?: string | null
          contact_wechat?: string | null
          vip_level?: string | null
          protocol_features?: string[] | null
          partner_hospitals?: string[] | null
          intro_video_url?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          full_name?: string | null
          languages?: string[] | null
          specialty_areas?: string[] | null
          status?: string | null
          created_at?: string | null
          photo_url?: string | null
          title?: Json | null
          bio?: Json | null
          nationality?: string | null
          base_country?: string | null
          service_regions?: string[] | null
          certifications?: string[] | null
          years_experience?: number | null
          patient_count?: number | null
          contact_whatsapp?: string | null
          contact_wechat?: string | null
          vip_level?: string | null
          protocol_features?: string[] | null
          partner_hospitals?: string[] | null
          intro_video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cure_partners_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          value: string | null
        }
        Insert: {
          key: string
          value?: string | null
        }
        Update: {
          key?: string
          value?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: Json | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          name: Json
          overview: Json | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: Json | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          name: Json
          overview?: Json | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: Json | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          name?: Json
          overview?: Json | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      user_agent_id: { Args: never; Returns: string }
      user_cure_partner_id: { Args: never; Returns: string }
      user_hospital_id: { Args: never; Returns: string }
      user_role: { Args: never; Returns: string }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
