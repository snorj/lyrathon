export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      disputes: {
        Row: {
          created_at: string
          evidence: string | null
          id: string
          job_id: string
          reason: string
          reporter_id: string
          resolution: string | null
          resolved_at: string | null
          status: string
          target_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          evidence?: string | null
          id?: string
          job_id: string
          reason: string
          reporter_id: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          target_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          evidence?: string | null
          id?: string
          job_id?: string
          reason?: string
          reporter_id?: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          target_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      job_views: {
        Row: {
          id: string
          job_id: string
          user_agent: string | null
          viewed_at: string
          viewer_id: string | null
          viewer_ip: unknown | null
        }
        Insert: {
          id?: string
          job_id: string
          user_agent?: string | null
          viewed_at?: string
          viewer_id?: string | null
          viewer_ip?: unknown | null
        }
        Update: {
          id?: string
          job_id?: string
          user_agent?: string | null
          viewed_at?: string
          viewer_id?: string | null
          viewer_ip?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "job_views_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      jobs: {
        Row: {
          accumulated_spam: number
          closed_at: string | null
          created_at: string
          creator_id: string
          description: string
          id: string
          initial_bounty: number
          onchain_id: number | null
          state: Database["public"]["Enums"]["job_state"]
          title: string
          updated_at: string
        }
        Insert: {
          accumulated_spam?: number
          closed_at?: string | null
          created_at?: string
          creator_id: string
          description: string
          id?: string
          initial_bounty: number
          onchain_id?: number | null
          state?: Database["public"]["Enums"]["job_state"]
          title: string
          updated_at?: string
        }
        Update: {
          accumulated_spam?: number
          closed_at?: string | null
          created_at?: string
          creator_id?: string
          description?: string
          id?: string
          initial_bounty?: number
          onchain_id?: number | null
          state?: Database["public"]["Enums"]["job_state"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          created_at: string
          dispute_count: number
          id: string
          is_company: boolean
          reputation_score: number
          total_earnings: number
          updated_at: string
          username: string | null
          wallet_address: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string
          dispute_count?: number
          id: string
          is_company?: boolean
          reputation_score?: number
          total_earnings?: number
          updated_at?: string
          username?: string | null
          wallet_address: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string
          dispute_count?: number
          id?: string
          is_company?: boolean
          reputation_score?: number
          total_earnings?: number
          updated_at?: string
          username?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          candidate_id: string | null
          claim_hash: string | null
          created_at: string
          id: string
          job_id: string
          onchain_id: number | null
          pitch: string
          referrer_id: string
          stake_amount: number
          state: Database["public"]["Enums"]["referral_state"]
          updated_at: string
        }
        Insert: {
          candidate_id?: string | null
          claim_hash?: string | null
          created_at?: string
          id: string
          job_id: string
          onchain_id?: number | null
          pitch: string
          referrer_id: string
          stake_amount?: number
          state?: Database["public"]["Enums"]["referral_state"]
          updated_at?: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string | null
          claim_hash?: string | null
          created_at?: string
          id?: string
          job_id?: string
          onchain_id?: number | null
          pitch?: string
          referrer_id?: string
          stake_amount?: number
          state?: Database["public"]["Enums"]["referral_state"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_job_total_pot: {
        Args: {
          job_uuid: string
        }
        Returns: number
      }
    }
    Enums: {
      job_state: "draft" | "open" | "closed"
      referral_state: "pending_claim" | "submitted" | "rejected" | "spam" | "hired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Job = Database['public']['Tables']['jobs']['Row'] & {
  creator?: Database['public']['Tables']['profiles']['Row']
  referrals?: Database['public']['Tables']['referrals']['Row'][]
}

export type Referral = Database['public']['Tables']['referrals']['Row'] & {
  job?: Job
  referrer?: Database['public']['Tables']['profiles']['Row']
  candidate?: Database['public']['Tables']['profiles']['Row']
}

export type Profile = Database['public']['Tables']['profiles']['Row']

export type Dispute = Database['public']['Tables']['disputes']['Row']
