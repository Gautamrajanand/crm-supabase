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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
