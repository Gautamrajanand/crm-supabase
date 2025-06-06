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
          full_name: string | null
          email: string | null
          email_notifications: boolean
          dark_mode: boolean
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          email_notifications?: boolean
          dark_mode?: boolean
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          email_notifications?: boolean
          dark_mode?: boolean
          timezone?: string | null
          updated_at?: string | null
        }
      }
      revenue_streams: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      revenue_stream_members: {
        Row: {
          id: string
          stream_id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          stream_id: string
          user_id: string
          role: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          stream_id?: string
          user_id?: string
          role?: string
          created_at?: string
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      track_contribution: {
        Args: {
          p_user_name: string
          p_user_email: string
          p_contribution_type: 'deal_created' | 'deal_updated' | 'customer_created' | 'customer_updated' | 'task_created' | 'task_completed' | 'outreach_created' | 'outreach_updated'
          p_entity_id: string
          p_entity_name: string
          p_details?: Json
        }
        Returns: {
          id: string
          created_at: string
          user_id: string | null
          user_name: string
          user_email: string
          contribution_type: string
          entity_id: string
          entity_name: string
          details: Json
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
