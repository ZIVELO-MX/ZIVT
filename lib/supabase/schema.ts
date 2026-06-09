// Raw Supabase database schema — auto-generated shape, do not write app logic here.
// When the DB schema changes, update this file and the domain types in types.ts.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ProfilePermission = 'founder' | 'admin' | 'editor' | 'viewer'
export type ProfileStatus = 'active' | 'invited' | 'suspended'
export type ProjectStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type ProjectHealth = 'on_track' | 'at_risk'
export type TaskColumn = 'todo' | 'progress' | 'review' | 'done' | 'blocked'
export type TaskPriority = 'low' | 'med' | 'high'
export type ClientStatus = 'active' | 'lead' | 'paused'
export type LearningColumn = 'todo' | 'progress' | 'done'
export type LearningResourceType = 'article' | 'video' | 'course' | 'book'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          initials: string | null
          color: string | null
          role: string | null
          phone: string | null
          permission: ProfilePermission | null
          status: ProfileStatus | null
          joined_at: string | null
          last_active: string | null
        }
        Insert: {
          id: string
          name: string
          initials?: string | null
          color?: string | null
          role?: string | null
          phone?: string | null
          permission?: ProfilePermission | null
          status?: ProfileStatus | null
          joined_at?: string | null
          last_active?: string | null
        }
        Update: {
          id?: string
          name?: string
          initials?: string | null
          color?: string | null
          role?: string | null
          phone?: string | null
          permission?: ProfilePermission | null
          status?: ProfileStatus | null
          joined_at?: string | null
          last_active?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          name: string
          client: string | null
          kind: string | null
          status: ProjectStatus | null
          health: ProjectHealth | null
          progress: number | null
          tasks_done: number | null
          tasks_total: number | null
          budget: number | null
          spent: number | null
          start_date: string | null
          due_date: string | null
          accent: string | null
          team: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          name: string
          client?: string | null
          kind?: string | null
          status?: ProjectStatus | null
          health?: ProjectHealth | null
          progress?: number | null
          tasks_done?: number | null
          tasks_total?: number | null
          budget?: number | null
          spent?: number | null
          start_date?: string | null
          due_date?: string | null
          accent?: string | null
          team?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          client?: string | null
          kind?: string | null
          status?: ProjectStatus | null
          health?: ProjectHealth | null
          progress?: number | null
          tasks_done?: number | null
          tasks_total?: number | null
          budget?: number | null
          spent?: number | null
          start_date?: string | null
          due_date?: string | null
          accent?: string | null
          team?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          col: TaskColumn
          project: string | null
          title: string
          tag: string | null
          priority: TaskPriority | null
          due: string | null
          assignee: string[] | null
          subtasks: Json | null
          comments: number | null
          progress: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          col?: TaskColumn
          project?: string | null
          title: string
          tag?: string | null
          priority?: TaskPriority | null
          due?: string | null
          assignee?: string[] | null
          subtasks?: Json | null
          comments?: number | null
          progress?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          col?: TaskColumn
          project?: string | null
          title?: string
          tag?: string | null
          priority?: TaskPriority | null
          due?: string | null
          assignee?: string[] | null
          subtasks?: Json | null
          comments?: number | null
          progress?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          name: string
          industry: string | null
          contact: string | null
          email: string | null
          phone: string | null
          city: string | null
          status: ClientStatus | null
          mrr: number | null
          since: string | null
          projects: number | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          name: string
          industry?: string | null
          contact?: string | null
          email?: string | null
          phone?: string | null
          city?: string | null
          status?: ClientStatus | null
          mrr?: number | null
          since?: string | null
          projects?: number | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          industry?: string | null
          contact?: string | null
          email?: string | null
          phone?: string | null
          city?: string | null
          status?: ClientStatus | null
          mrr?: number | null
          since?: string | null
          projects?: number | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          type: string
          title: string
          body: string | null
          unread: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: string
          title: string
          body?: string | null
          unread?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: string
          title?: string
          body?: string | null
          unread?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
      learning_tasks: {
        Row: {
          id: string
          col: LearningColumn | null
          title: string
          description: string | null
          url: string | null
          type: LearningResourceType | null
          assignee: string[] | null
          due: string | null
          duration: string | null
          tags: string[] | null
          progress: Json | null
          created_at: string | null
        }
        Insert: {
          id: string
          col?: LearningColumn | null
          title: string
          description?: string | null
          url?: string | null
          type?: LearningResourceType | null
          assignee?: string[] | null
          due?: string | null
          duration?: string | null
          tags?: string[] | null
          progress?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          col?: LearningColumn | null
          title?: string
          description?: string | null
          url?: string | null
          type?: LearningResourceType | null
          assignee?: string[] | null
          due?: string | null
          duration?: string | null
          tags?: string[] | null
          progress?: Json | null
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
