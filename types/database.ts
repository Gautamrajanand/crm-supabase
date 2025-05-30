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
      activities: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          notes: string
          prospect_id: string
          scheduled_at: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes: string
          prospect_id: string
          scheduled_at?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string
          prospect_id?: string
          scheduled_at?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      board: {
        Row: {
          id: number
          title: string
        }
        Insert: {
          id?: never
          title: string
        }
        Update: {
          id?: never
          title?: string
        }
        Relationships: []
      }
      board_column: {
        Row: {
          board_id: number | null
          id: number
          name: string
          position: number
        }
        Insert: {
          board_id?: number | null
          id?: never
          name: string
          position: number
        }
        Update: {
          board_id?: number | null
          id?: never
          name?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "board_column_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "tiles"
            referencedColumns: ["id"]
          },
        ]
      }
      board_columns: {
        Row: {
          board_id: string | null
          created_at: string | null
          id: string
          name: string
          position: number
          stream_id: string
        }
        Insert: {
          board_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          position: number
          stream_id: string
        }
        Update: {
          board_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          position?: number
          stream_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_columns_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      board_entrie: {
        Row: {
          assigned_to: number | null
          column_id: number | null
          company: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          description: string | null
          id: number
          last_contacted: string | null
          next_followup: string | null
          priority: string | null
          revenue_potential: number | null
          title: string
        }
        Insert: {
          assigned_to?: number | null
          column_id?: number | null
          company?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          description?: string | null
          id?: never
          last_contacted?: string | null
          next_followup?: string | null
          priority?: string | null
          revenue_potential?: number | null
          title: string
        }
        Update: {
          assigned_to?: number | null
          column_id?: number | null
          company?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          description?: string | null
          id?: never
          last_contacted?: string | null
          next_followup?: string | null
          priority?: string | null
          revenue_potential?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_entrie_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "team_member"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_entrie_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "board_column"
            referencedColumns: ["id"]
          },
        ]
      }
      board_entries: {
        Row: {
          board_id: string | null
          column_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          position: number
          priority: string | null
          revenue_potential: number | null
          stream_id: string
          title: string
        }
        Insert: {
          board_id?: string | null
          column_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          position: number
          priority?: string | null
          revenue_potential?: number | null
          stream_id: string
          title: string
        }
        Update: {
          board_id?: string | null
          column_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number
          priority?: string | null
          revenue_potential?: number | null
          stream_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_entries_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_entries_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "board_columns"
            referencedColumns: ["id"]
          },
        ]
      }
      boardcolumn: {
        Row: {
          board_id: number | null
          id: number
          title: string
        }
        Insert: {
          board_id?: number | null
          id?: never
          title: string
        }
        Update: {
          board_id?: number | null
          id?: never
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "boardcolumn_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "board"
            referencedColumns: ["id"]
          },
        ]
      }
      boardentries: {
        Row: {
          assigned_to_id: number | null
          column_id: number | null
          id: number
          title: string
        }
        Insert: {
          assigned_to_id?: number | null
          column_id?: number | null
          id?: never
          title: string
        }
        Update: {
          assigned_to_id?: number | null
          column_id?: number | null
          id?: never
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "boardentries_assigned_to_id_fkey"
            columns: ["assigned_to_id"]
            isOneToOne: false
            referencedRelation: "teammember"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boardentries_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "boardcolumn"
            referencedColumns: ["id"]
          },
        ]
      }
      boards: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          stream_id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          stream_id: string
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          stream_id?: string
          type?: string
        }
        Relationships: []
      }
      calendar_notes: {
        Row: {
          created_at: string | null
          date: string
          id: string
          note: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          note: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          note?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          annual_revenue: number | null
          company: string | null
          created_at: string
          email: string | null
          employee_count: number | null
          id: string
          industry: string | null
          last_contacted: string | null
          lifetime_value: number | null
          linkedin: string | null
          name: string
          notes: string | null
          phone: string | null
          status: string | null
          stream_id: string
          tags: string[] | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          annual_revenue?: number | null
          company?: string | null
          created_at?: string
          email?: string | null
          employee_count?: number | null
          id?: string
          industry?: string | null
          last_contacted?: string | null
          lifetime_value?: number | null
          linkedin?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          stream_id: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          annual_revenue?: number | null
          company?: string | null
          created_at?: string
          email?: string | null
          employee_count?: number | null
          id?: string
          industry?: string | null
          last_contacted?: string | null
          lifetime_value?: number | null
          linkedin?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          stream_id?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      deals: {
        Row: {
          created_at: string
          customer_id: string
          description: string | null
          expected_close_date: string | null
          id: string
          notes: string | null
          stage: string | null
          stream_id: string
          title: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          customer_id: string
          description?: string | null
          expected_close_date?: string | null
          id?: string
          notes?: string | null
          stage?: string | null
          stream_id: string
          title: string
          updated_at?: string
          user_id: string
          value?: number
        }
        Update: {
          created_at?: string
          customer_id?: string
          description?: string | null
          expected_close_date?: string | null
          id?: string
          notes?: string | null
          stage?: string | null
          stream_id?: string
          title?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "deals_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendees: {
        Row: {
          created_at: string | null
          event_id: string
          team_member_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          team_member_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          all_day: boolean | null
          created_at: string | null
          description: string | null
          end_time: string
          event_type: string | null
          id: string
          related_to_id: string | null
          related_to_type: string | null
          start_time: string
          stream_id: string
          title: string
          updated_at: string | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          all_day?: boolean | null
          created_at?: string | null
          description?: string | null
          end_time: string
          event_type?: string | null
          id?: string
          related_to_id?: string | null
          related_to_type?: string | null
          start_time: string
          stream_id: string
          title: string
          updated_at?: string | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          all_day?: boolean | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          event_type?: string | null
          id?: string
          related_to_id?: string | null
          related_to_type?: string | null
          start_time?: string
          stream_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          calendar_access: string
          created_at: string
          customers_access: string
          deals_access: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          outreach_access: string
          people_access: string
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          stream_id: string
          tasks_access: string
          token: string
          updated_at: string
        }
        Insert: {
          calendar_access?: string
          created_at?: string
          customers_access?: string
          deals_access?: string
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          outreach_access?: string
          people_access?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          stream_id: string
          tasks_access?: string
          token: string
          updated_at?: string
        }
        Update: {
          calendar_access?: string
          created_at?: string
          customers_access?: string
          deals_access?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          outreach_access?: string
          people_access?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          stream_id?: string
          tasks_access?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "revenue_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          person_id: string | null
          role: Database["public"]["Enums"]["access_level"]
          status: string
          stream_id: string
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          person_id?: string | null
          role?: Database["public"]["Enums"]["access_level"]
          status?: string
          stream_id: string
          token?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          person_id?: string | null
          role?: Database["public"]["Enums"]["access_level"]
          status?: string
          stream_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "revenue_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          access_level: Database["public"]["Enums"]["access_level"]
          avatar_url: string | null
          calendar_access: Database["public"]["Enums"]["permission_level"]
          created_at: string
          customers_access: Database["public"]["Enums"]["permission_level"]
          deals_access: Database["public"]["Enums"]["permission_level"]
          email: string
          id: string
          name: string
          outreach_access: Database["public"]["Enums"]["permission_level"]
          people_access: Database["public"]["Enums"]["permission_level"]
          role: string | null
          status: Database["public"]["Enums"]["person_status"]
          stream_id: string
          tasks_access: Database["public"]["Enums"]["permission_level"]
          updated_at: string
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["access_level"]
          avatar_url?: string | null
          calendar_access?: Database["public"]["Enums"]["permission_level"]
          created_at?: string
          customers_access?: Database["public"]["Enums"]["permission_level"]
          deals_access?: Database["public"]["Enums"]["permission_level"]
          email: string
          id?: string
          name: string
          outreach_access?: Database["public"]["Enums"]["permission_level"]
          people_access?: Database["public"]["Enums"]["permission_level"]
          role?: string | null
          status?: Database["public"]["Enums"]["person_status"]
          stream_id: string
          tasks_access?: Database["public"]["Enums"]["permission_level"]
          updated_at?: string
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_level"]
          avatar_url?: string | null
          calendar_access?: Database["public"]["Enums"]["permission_level"]
          created_at?: string
          customers_access?: Database["public"]["Enums"]["permission_level"]
          deals_access?: Database["public"]["Enums"]["permission_level"]
          email?: string
          id?: string
          name?: string
          outreach_access?: Database["public"]["Enums"]["permission_level"]
          people_access?: Database["public"]["Enums"]["permission_level"]
          role?: string | null
          status?: Database["public"]["Enums"]["person_status"]
          stream_id?: string
          tasks_access?: Database["public"]["Enums"]["permission_level"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "people_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "revenue_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          dark_mode: boolean | null
          email: string | null
          email_notifications: boolean | null
          full_name: string | null
          id: string
          role: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          dark_mode?: boolean | null
          email?: string | null
          email_notifications?: boolean | null
          full_name?: string | null
          id: string
          role?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          dark_mode?: boolean | null
          email?: string | null
          email_notifications?: boolean | null
          full_name?: string | null
          id?: string
          role?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_members: {
        Row: {
          created_at: string | null
          project_id: string
          team_member_id: string
        }
        Insert: {
          created_at?: string | null
          project_id: string
          team_member_id: string
        }
        Update: {
          created_at?: string | null
          project_id?: string
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      prospects: {
        Row: {
          company: string
          created_at: string | null
          deal_value: number | null
          email: string | null
          id: string
          linkedin_url: string | null
          name: string
          notes: string | null
          phone: string | null
          status: string
          stream_id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string | null
          deal_value?: number | null
          email?: string | null
          id?: string
          linkedin_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          status?: string
          stream_id: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string | null
          deal_value?: number | null
          email?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
          stream_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      revenue_stream_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          created_by: string
          email: string
          expires_at: string
          id: string
          permissions: Json
          role: string
          stream_id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          created_by: string
          email: string
          expires_at?: string
          id?: string
          permissions?: Json
          role?: string
          stream_id: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          created_by?: string
          email?: string
          expires_at?: string
          id?: string
          permissions?: Json
          role?: string
          stream_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_stream_invites_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "revenue_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_stream_members: {
        Row: {
          calendar_access: string
          created_at: string
          customers_access: string
          deals_access: string
          id: string
          outreach_access: string
          people_access: string
          profile_id: string
          role: Database["public"]["Enums"]["user_role"]
          stream_id: string
          tasks_access: string
          updated_at: string
        }
        Insert: {
          calendar_access?: string
          created_at?: string
          customers_access?: string
          deals_access?: string
          id?: string
          outreach_access?: string
          people_access?: string
          profile_id: string
          role?: Database["public"]["Enums"]["user_role"]
          stream_id: string
          tasks_access?: string
          updated_at?: string
        }
        Update: {
          calendar_access?: string
          created_at?: string
          customers_access?: string
          deals_access?: string
          id?: string
          outreach_access?: string
          people_access?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          stream_id?: string
          tasks_access?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_stream_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_stream_members_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "revenue_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_streams: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stream_invitations: {
        Row: {
          access_level: string
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          inviter_id: string | null
          status: string
          stream_id: string | null
        }
        Insert: {
          access_level: string
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          inviter_id?: string | null
          status?: string
          stream_id?: string | null
        }
        Update: {
          access_level?: string
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          inviter_id?: string | null
          status?: string
          stream_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stream_invitations_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "revenue_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_members: {
        Row: {
          created_at: string
          id: string
          role: string
          status: string
          stream_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          status?: string
          stream_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          status?: string
          stream_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed: boolean | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          related_to_id: string | null
          related_to_type: string | null
          stream_id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          related_to_id?: string | null
          related_to_type?: string | null
          stream_id: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          related_to_id?: string | null
          related_to_type?: string | null
          stream_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      team_invites: {
        Row: {
          created_at: string | null
          created_by: string
          email: string
          expires_at: string
          id: string
          role: string
          token: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          email: string
          expires_at?: string
          id?: string
          role: string
          token: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          email?: string
          expires_at?: string
          id?: string
          role?: string
          token?: string
          workspace_id?: string
        }
        Relationships: []
      }
      team_member: {
        Row: {
          email: string
          full_name: string
          id: number
          role: string
        }
        Insert: {
          email: string
          full_name: string
          id?: never
          role: string
        }
        Update: {
          email?: string
          full_name?: string
          id?: never
          role?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          full_name: string
          id: string
          role: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          full_name: string
          id?: string
          role?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          role?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      teammember: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: never
          name: string
        }
        Update: {
          id?: never
          name?: string
        }
        Relationships: []
      }
      tiles: {
        Row: {
          id: number
          name: string
          type: string
        }
        Insert: {
          id?: never
          name: string
          type: string
        }
        Update: {
          id?: never
          name?: string
          type?: string
        }
        Relationships: []
      }
      user_emails: {
        Row: {
          created_at: string | null
          email: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      workspace_calendar_events: {
        Row: {
          attendees: Json
          created_at: string
          created_by: string
          description: string | null
          end_time: string
          id: string
          location: string | null
          start_time: string
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          attendees?: Json
          created_at?: string
          created_by: string
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          start_time: string
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          attendees?: Json
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          start_time?: string
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      workspace_customers: {
        Row: {
          company: string | null
          created_at: string
          created_by: string
          email: string | null
          id: string
          last_contact: string | null
          name: string
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          created_by: string
          email?: string | null
          id?: string
          last_contact?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          created_by?: string
          email?: string | null
          id?: string
          last_contact?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      workspace_deals: {
        Row: {
          company: string | null
          created_at: string
          created_by: string
          expected_close_date: string | null
          id: string
          name: string
          notes: string | null
          probability: number
          stage: string
          updated_at: string
          value: number
          workspace_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          created_by: string
          expected_close_date?: string | null
          id?: string
          name: string
          notes?: string | null
          probability?: number
          stage?: string
          updated_at?: string
          value?: number
          workspace_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          created_by?: string
          expected_close_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          probability?: number
          stage?: string
          updated_at?: string
          value?: number
          workspace_id?: string
        }
        Relationships: []
      }
      workspace_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          permissions: Json
          role: string
          status: string
          token: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          permissions?: Json
          role?: string
          status?: string
          token?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          permissions?: Json
          role?: string
          status?: string
          token?: string
          workspace_id?: string
        }
        Relationships: []
      }
      workspace_outreach: {
        Row: {
          company: string | null
          created_at: string
          created_by: string
          email: string | null
          id: string
          last_contact: string | null
          name: string
          next_follow_up: string | null
          notes: string | null
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          created_by: string
          email?: string | null
          id?: string
          last_contact?: string | null
          name: string
          next_follow_up?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          created_by?: string
          email?: string | null
          id?: string
          last_contact?: string | null
          name?: string
          next_follow_up?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      workspace_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: { invitation_id: string }
        Returns: string
      }
      accept_invite: {
        Args: { p_token: string }
        Returns: string
      }
      check_workspace_access: {
        Args: { workspace: string; requesting_user: string }
        Returns: boolean
      }
      check_workspace_admin: {
        Args: { workspace: string; requesting_user: string }
        Returns: boolean
      }
      check_workspace_admin_v2: {
        Args: { workspace_id: string; user_id: string }
        Returns: boolean
      }
      check_workspace_owner_v2: {
        Args: { workspace_id: string; user_id: string }
        Returns: boolean
      }
      create_invite: {
        Args: {
          p_email: string
          p_stream_id: string
          p_person_id: string
          p_role?: Database["public"]["Enums"]["access_level"]
        }
        Returns: {
          id: string
          token: string
          magic_link: string
        }[]
      }
      create_invite_and_send_email: {
        Args: {
          p_email: string
          p_stream_id: string
          p_role: Database["public"]["Enums"]["access_level"]
          p_person_id?: string
        }
        Returns: {
          invite_id: string
          invite_link: string
        }[]
      }
      create_workspace: {
        Args: { workspace_name: string }
        Returns: string
      }
      delete_workspace_member: {
        Args: { p_member_id: string }
        Returns: undefined
      }
      ensure_user_workspace: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_default_workspace: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_workspaces: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
        }[]
      }
      get_workspace_members: {
        Args: { workspace_id: string }
        Returns: {
          id: string
          workspace_id: string
          user_id: string
          role: string
          created_at: string
          name: string
          email: string
          permissions: Json
        }[]
      }
      has_stream_access: {
        Args: { stream_id: string; feature: string; required_access?: string }
        Returns: boolean
      }
      initialize_workspace_data: {
        Args: { workspace_id: string; user_id: string }
        Returns: undefined
      }
      is_workspace_admin: {
        Args: { workspace_id: string }
        Returns: boolean
      }
      send_stream_invitation: {
        Args: { p_stream_id: string; p_email: string }
        Returns: string
      }
      set_authenticated_context: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_workspace_member: {
        Args: { p_member_id: string; p_role: string; p_permissions: Json }
        Returns: undefined
      }
      user_is_stream_member: {
        Args: { check_stream_id: string }
        Returns: boolean
      }
      user_is_stream_member_with_role: {
        Args: { check_stream_id: string; required_role: string[] }
        Returns: boolean
      }
    }
    Enums: {
      access_level: "admin" | "member" | "viewer"
      invitation_status: "pending" | "accepted" | "expired"
      invite_status: "pending" | "accepted" | "expired"
      permission_level: "none" | "view" | "edit"
      person_status: "active" | "inactive"
      user_role: "owner" | "admin" | "member" | "viewer"
      workspace_role: "owner" | "admin" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      access_level: ["admin", "member", "viewer"],
      invitation_status: ["pending", "accepted", "expired"],
      invite_status: ["pending", "accepted", "expired"],
      permission_level: ["none", "view", "edit"],
      person_status: ["active", "inactive"],
      user_role: ["owner", "admin", "member", "viewer"],
      workspace_role: ["owner", "admin", "member"],
    },
  },
} as const
