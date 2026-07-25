export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'user' | 'case_manager' | 'admin'
          reading_level: string
          state_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'user' | 'case_manager' | 'admin'
          reading_level?: string
          state_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'user' | 'case_manager' | 'admin'
          reading_level?: string
          state_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      intake_responses: {
        Row: {
          id: string
          user_id: string
          has_bank_account: boolean
          has_state_id: boolean
          has_ssn_card: boolean
          has_restitution_debt: boolean
          employment_status: string
          raw_responses: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          has_bank_account: boolean
          has_state_id: boolean
          has_ssn_card: boolean
          has_restitution_debt: boolean
          employment_status: string
          raw_responses?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          has_bank_account?: boolean
          has_state_id?: boolean
          has_ssn_card?: boolean
          has_restitution_debt?: boolean
          employment_status?: string
          raw_responses?: Json
          created_at?: string
        }
      }
      user_timelines: {
        Row: {
          id: string
          user_id: string
          current_month_step: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_month_step?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_month_step?: number
          is_active?: boolean
          created_at?: string
        }
      }
      timeline_milestones: {
        Row: {
          id: string
          timeline_id: string
          title: string
          description: string
          target_month: number
          step_order: number
          is_completed: boolean
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          timeline_id: string
          title: string
          description: string
          target_month: number
          step_order: number
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          timeline_id?: string
          title?: string
          description?: string
          target_month?: number
          step_order?: number
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
      }
      product_directory: {
        Row: {
          id: string
          name: string
          provider_name: string
          type: 'checking' | 'secured_card' | 'credit_builder_loan' | 'counseling_org'
          supported_states: string[]
          requires_permanent_address: boolean
          requires_credit_check: boolean
          monthly_fee: number
          affiliate_link: string | null
          red_flags: string[] | null
          is_vetted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          provider_name: string
          type: 'checking' | 'secured_card' | 'credit_builder_loan' | 'counseling_org'
          supported_states?: string[]
          requires_permanent_address?: boolean
          requires_credit_check?: boolean
          monthly_fee?: number
          affiliate_link?: string | null
          red_flags?: string[] | null
          is_vetted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          provider_name?: string
          type?: 'checking' | 'secured_card' | 'credit_builder_loan' | 'counseling_org'
          supported_states?: string[]
          requires_permanent_address?: boolean
          requires_credit_check?: boolean
          monthly_fee?: number
          affiliate_link?: string | null
          red_flags?: string[] | null
          is_vetted?: boolean
          created_at?: string
        }
      }
      knowledge_embeddings: {
        Row: {
          id: string
          title: string
          category: string
          content: string
          embedding: number[]
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          category: string
          content: string
          embedding: number[]
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          category?: string
          content?: string
          embedding?: number[]
          created_at?: string
        }
      }
    }
  }
}
