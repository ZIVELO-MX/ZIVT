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

export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type ProjectRow = Database['public']['Tables']['projects']['Row']
export type TaskRow = Database['public']['Tables']['tasks']['Row']
export type ClientRow = Database['public']['Tables']['clients']['Row']
export type NotificationRow = Database['public']['Tables']['notifications']['Row']
export type LearningTaskRow = Database['public']['Tables']['learning_tasks']['Row']

export type Profile = {
  id: string
  name: string
  initials: string
  color: string
  role: string
  email?: string
  phone: string | null
  status: ProfileStatus
  permission: ProfilePermission
  joined: string
  lastActive: string
}

export type Project = {
  id: string
  name: string
  client: string | null
  kind: string
  status: ProjectStatus
  progress: number
  start: string
  due: string
  team: string[]
  health: ProjectHealth
  budget: number
  spent: number
  tasksDone: number
  tasksTotal: number
  accent: string
  createdAt?: string | null
  updatedAt?: string | null
}

export type MemberProgress = 'todo' | 'progress' | 'done'
export type Subtask = { t: string; d: boolean }

export type Task = {
  id: string
  col: string
  project: string | null
  title: string
  tag: string
  priority: TaskPriority
  due: string | null
  assignee: string[]
  subtasks: Subtask[]
  comments: number
  progress: Record<string, MemberProgress>
  createdAt?: string | null
  updatedAt?: string | null
}

export type Client = {
  id: string
  name: string
  industry: string
  contact: string
  email: string
  phone: string
  city: string
  since: string
  status: ClientStatus
  projects: number
  mrr: number
  notes?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type Notification = {
  id: string
  userId: string | null
  type: string
  title: string
  body: string | null
  unread: boolean
  createdAt: string
}

export function notificationRowToNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    unread: row.unread ?? true,
    createdAt: row.created_at ?? new Date().toISOString(),
  }
}

export type LearningTask = {
  id: string
  col: LearningColumn
  title: string
  description: string
  url: string
  type: LearningResourceType
  assignee: string[]
  due: string | null
  duration: string
  tags: string[]
  progress: Record<string, MemberProgress>
  createdAt?: string | null
}

export function projectRowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    client: row.client,
    kind: row.kind ?? '',
    status: row.status ?? 'in_progress',
    progress: row.progress ?? 0,
    start: row.start_date ?? '',
    due: row.due_date ?? '',
    team: row.team ?? [],
    health: row.health ?? 'on_track',
    budget: row.budget ?? 0,
    spent: row.spent ?? 0,
    tasksDone: row.tasks_done ?? 0,
    tasksTotal: row.tasks_total ?? 0,
    accent: row.accent ?? '#D72228',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function profileRowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials ?? row.name.slice(0, 2).toUpperCase(),
    color: row.color ?? '#D72228',
    role: row.role ?? '',
    phone: row.phone,
    status: row.status ?? 'active',
    permission: row.permission ?? 'viewer',
    joined: row.joined_at ?? '',
    lastActive: row.last_active ?? '',
  }
}

export function profileToProfileRow(profile: Partial<Profile>): Partial<ProfileRow> {
  const row: Partial<ProfileRow> = {}
  if (profile.id !== undefined) row.id = profile.id
  if (profile.name !== undefined) row.name = profile.name
  if (profile.initials !== undefined) row.initials = profile.initials
  if (profile.color !== undefined) row.color = profile.color
  if (profile.role !== undefined) row.role = profile.role
  if (profile.phone !== undefined) row.phone = profile.phone
  if (profile.status !== undefined) row.status = profile.status
  if (profile.permission !== undefined) row.permission = profile.permission
  if (profile.joined !== undefined) row.joined_at = profile.joined
  if (profile.lastActive !== undefined) row.last_active = profile.lastActive
  return row
}

export function taskRowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    col: row.col,
    project: row.project,
    title: row.title,
    tag: row.tag ?? '',
    priority: row.priority ?? 'med',
    due: row.due,
    assignee: row.assignee ?? [],
    subtasks: (row.subtasks as Subtask[] | null) ?? [],
    comments: row.comments ?? 0,
    progress: (row.progress as Record<string, MemberProgress> | null) ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function taskToTaskRow(task: Partial<Task>): Partial<TaskRow> {
  const row: Partial<TaskRow> = {}
  if (task.id !== undefined) row.id = task.id
  if (task.col !== undefined) row.col = task.col as TaskColumn
  if (task.project !== undefined) row.project = task.project
  if (task.title !== undefined) row.title = task.title
  if (task.tag !== undefined) row.tag = task.tag
  if (task.priority !== undefined) row.priority = task.priority
  if (task.due !== undefined) row.due = task.due
  if (task.assignee !== undefined) row.assignee = task.assignee
  if (task.subtasks !== undefined) row.subtasks = task.subtasks as Json
  if (task.comments !== undefined) row.comments = task.comments
  if (task.progress !== undefined) row.progress = task.progress as Json
  return row
}

export function clientRowToClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    industry: row.industry ?? '',
    contact: row.contact ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    city: row.city ?? '',
    since: row.since ?? '',
    status: row.status ?? 'active',
    projects: row.projects ?? 0,
    mrr: row.mrr ?? 0,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function clientToClientRow(client: Partial<Client>): Partial<ClientRow> {
  const row: Partial<ClientRow> = {}

  if (client.id !== undefined) row.id = client.id
  if (client.name !== undefined) row.name = client.name
  if (client.industry !== undefined) row.industry = client.industry
  if (client.contact !== undefined) row.contact = client.contact
  if (client.email !== undefined) row.email = client.email
  if (client.phone !== undefined) row.phone = client.phone
  if (client.city !== undefined) row.city = client.city
  if (client.since !== undefined) row.since = client.since
  if (client.status !== undefined) row.status = client.status
  if (client.projects !== undefined) row.projects = client.projects
  if (client.mrr !== undefined) row.mrr = client.mrr
  if (client.notes !== undefined) row.notes = client.notes
  if (client.createdAt !== undefined) row.created_at = client.createdAt
  if (client.updatedAt !== undefined) row.updated_at = client.updatedAt

  return row
}

export function projectToProjectRow(project: Partial<Project>): Partial<ProjectRow> {
  const row: Partial<ProjectRow> = {}

  if (project.id !== undefined) row.id = project.id
  if (project.name !== undefined) row.name = project.name
  if (project.client !== undefined) row.client = project.client
  if (project.kind !== undefined) row.kind = project.kind
  if (project.status !== undefined) row.status = project.status
  if (project.progress !== undefined) row.progress = project.progress
  if (project.start !== undefined) row.start_date = project.start
  if (project.due !== undefined) row.due_date = project.due
  if (project.team !== undefined) row.team = project.team
  if (project.health !== undefined) row.health = project.health
  if (project.budget !== undefined) row.budget = project.budget
  if (project.spent !== undefined) row.spent = project.spent
  if (project.tasksDone !== undefined) row.tasks_done = project.tasksDone
  if (project.tasksTotal !== undefined) row.tasks_total = project.tasksTotal
  if (project.accent !== undefined) row.accent = project.accent
  if (project.createdAt !== undefined) row.created_at = project.createdAt
  if (project.updatedAt !== undefined) row.updated_at = project.updatedAt

  return row
}
