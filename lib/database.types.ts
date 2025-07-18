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
      team_activity: {
        Row: {
          id: string
          user_id: string
          action: string
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          details: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          details?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_activity_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      team_invitations: {
        Row: {
          id: string
          email: string
          role: string
          invited_by: string
          status: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          email: string
          role: string
          invited_by: string
          status?: string
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          invited_by?: string
          status?: string
          created_at?: string
          expires_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_invited_by_fkey"
            columns: ["invited_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      team_members: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string
          role: string
          created_at: string
          updated_at: string
          joined_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name: string
          role: string
          created_at?: string
          updated_at?: string
          joined_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string
          role?: string
          created_at?: string
          updated_at?: string
          joined_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_initial_owner: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      handle_team_invitation_acceptance: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
