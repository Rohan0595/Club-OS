import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create client if both URL and key are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          club: string
          avatar: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: string
          club: string
          avatar?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: string
          club?: string
          avatar?: string
          created_at?: string
        }
      }
      clubs: {
        Row: {
          id: string
          name: string
          color: string
          member_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          member_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          member_count?: number
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          assignee: string
          status: string
          priority: string
          due_date: string
          club: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          assignee: string
          status?: string
          priority: string
          due_date: string
          club: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          assignee?: string
          status?: string
          priority?: string
          due_date?: string
          club?: string
          created_at?: string
          updated_at?: string
        }
      }
      members: {
        Row: {
          id: string
          name: string
          role: string
          email: string
          avatar: string
          club: string
          status: string
          can_assign_tasks: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          role: string
          email: string
          avatar?: string
          club: string
          status?: string
          can_assign_tasks?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string
          email?: string
          avatar?: string
          club?: string
          status?: string
          can_assign_tasks?: boolean
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          date: string
          attendees: number
          status: string
          club: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          date: string
          attendees?: number
          status?: string
          club: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          date?: string
          attendees?: number
          status?: string
          club?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender: string
          content: string
          timestamp: string
          sender_avatar: string
          sender_name: string
          chat_id: string
          created_at: string
        }
        Insert: {
          id?: string
          sender: string
          content: string
          timestamp?: string
          sender_avatar?: string
          sender_name: string
          chat_id: string
          created_at?: string
        }
        Update: {
          id?: string
          sender?: string
          content?: string
          timestamp?: string
          sender_avatar?: string
          sender_name?: string
          chat_id?: string
          created_at?: string
        }
      }
    }
  }
} 