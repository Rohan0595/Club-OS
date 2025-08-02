import { supabase } from './supabase'
import type { Database } from './supabase'

type User = Database['public']['Tables']['users']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
type Member = Database['public']['Tables']['members']['Row']
type Event = Database['public']['Tables']['events']['Row']
type Message = Database['public']['Tables']['messages']['Row']
type Club = Database['public']['Tables']['clubs']['Row']

// User operations
export const userService = {
  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error) {
      console.error('Error fetching user:', error)
      return null
    }
    return data
  },

  async createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating user:', error)
      return null
    }
    return data
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating user:', error)
      return null
    }
    return data
  }
}

// Task operations
export const taskService = {
  async getTasksByClub(club: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('club', club)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching tasks:', error)
      return []
    }
    return data || []
  },

  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating task:', error)
      return null
    }
    return data
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating task:', error)
      return null
    }
    return data
  },

  async deleteTask(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting task:', error)
      return false
    }
    return true
  }
}

// Member operations
export const memberService = {
  async getMembersByClub(club: string): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('club', club)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching members:', error)
      return []
    }
    return data || []
  },

  async createMember(memberData: Omit<Member, 'id' | 'created_at'>): Promise<Member | null> {
    const { data, error } = await supabase
      .from('members')
      .insert([memberData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating member:', error)
      return null
    }
    return data
  },

  async updateMember(id: string, updates: Partial<Member>): Promise<Member | null> {
    const { data, error } = await supabase
      .from('members')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating member:', error)
      return null
    }
    return data
  },

  async deleteMember(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting member:', error)
      return false
    }
    return true
  }
}

// Event operations
export const eventService = {
  async getEventsByClub(club: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('club', club)
      .order('date', { ascending: true })
    
    if (error) {
      console.error('Error fetching events:', error)
      return []
    }
    return data || []
  },

  async createEvent(eventData: Omit<Event, 'id' | 'created_at'>): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating event:', error)
      return null
    }
    return data
  },

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating event:', error)
      return null
    }
    return data
  },

  async deleteEvent(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting event:', error)
      return false
    }
    return true
  }
}

// Message operations
export const messageService = {
  async getMessagesByChatId(chatId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('timestamp', { ascending: true })
    
    if (error) {
      console.error('Error fetching messages:', error)
      return []
    }
    return data || []
  },

  async createMessage(messageData: Omit<Message, 'id' | 'created_at'>): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating message:', error)
      return null
    }
    return data
  },

  async getRecentMessages(limit: number = 50): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching recent messages:', error)
      return []
    }
    return data || []
  }
}

// Club operations
export const clubService = {
  async getClubs(): Promise<Club[]> {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching clubs:', error)
      return []
    }
    return data || []
  },

  async getClubByName(name: string): Promise<Club | null> {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('name', name)
      .single()
    
    if (error) {
      console.error('Error fetching club:', error)
      return null
    }
    return data
  },

  async createClub(clubData: Omit<Club, 'id' | 'created_at'>): Promise<Club | null> {
    const { data, error } = await supabase
      .from('clubs')
      .insert([clubData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating club:', error)
      return null
    }
    return data
  },

  async updateClubMemberCount(clubName: string, count: number): Promise<boolean> {
    const { error } = await supabase
      .from('clubs')
      .update({ member_count: count })
      .eq('name', clubName)
    
    if (error) {
      console.error('Error updating club member count:', error)
      return false
    }
    return true
  }
} 