import { createClient as createSupabaseClient } from './client'
import {
  clientRowToClient,
  clientToClientRow,
  notificationRowToNotification,
  profileRowToProfile,
  profileToProfileRow,
  projectRowToProject,
  projectToProjectRow,
  taskRowToTask,
  taskToTaskRow,
} from './types'
import type { Client, Notification, Profile, Project, Task } from './types'

export async function getProjects(): Promise<Project[]> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(projectRowToProject)
}

export async function createProject(data: Partial<Project>): Promise<Project> {
  const supabase = createSupabaseClient()
  const row = projectToProjectRow(data)
  const { data: inserted, error } = await supabase
    .from('projects')
    .insert(row)
    .select()
    .single()
  if (error) throw error
  return projectRowToProject(inserted)
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  const supabase = createSupabaseClient()
  const row = projectToProjectRow(data)
  const { data: updated, error } = await supabase
    .from('projects')
    .update(row)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return projectRowToProject(updated)
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = createSupabaseClient()
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export async function getTasks(): Promise<Task[]> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(taskRowToTask)
}

export async function createTask(data: Partial<Task>): Promise<Task> {
  const supabase = createSupabaseClient()
  const row = taskToTaskRow({ id: crypto.randomUUID(), ...data })
  const { data: inserted, error } = await supabase
    .from('tasks')
    .insert(row)
    .select()
    .single()
  if (error) throw error
  return taskRowToTask(inserted)
}

export async function updateTask(id: string, data: Partial<Task>): Promise<Task> {
  const supabase = createSupabaseClient()
  const row = taskToTaskRow(data)
  const { data: updated, error } = await supabase
    .from('tasks')
    .update(row)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return taskRowToTask(updated)
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = createSupabaseClient()
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function moveTask(
  id: string,
  col: string,
  progress?: Record<string, string>,
): Promise<Task> {
  return updateTask(id, { col, ...(progress ? { progress: progress as Record<string, import('./types').MemberProgress> } : {}) })
}

// ─── Clients ─────────────────────────────────────────────────────────────────

export async function getClients(): Promise<Client[]> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(clientRowToClient)
}

export async function createClient(data: Partial<Client>): Promise<Client> {
  const supabase = createSupabaseClient()
  const row = clientToClientRow({ id: crypto.randomUUID(), ...data })
  const { data: inserted, error } = await supabase
    .from('clients')
    .insert(row)
    .select()
    .single()
  if (error) throw error
  return clientRowToClient(inserted)
}

export async function updateClient(id: string, data: Partial<Client>): Promise<Client> {
  const supabase = createSupabaseClient()
  const row = clientToClientRow(data)
  const { data: updated, error } = await supabase
    .from('clients')
    .update(row)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return clientRowToClient(updated)
}

export async function deleteClient(id: string): Promise<void> {
  const supabase = createSupabaseClient()
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ─── Profiles ────────────────────────────────────────────────────────────────

export async function getProfiles(): Promise<Profile[]> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('joined_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(profileRowToProfile)
}

export async function updateProfile(id: string, data: Partial<Profile>): Promise<Profile> {
  const supabase = createSupabaseClient()
  const row = profileToProfileRow(data)
  const { data: updated, error } = await supabase
    .from('profiles')
    .update(row)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return profileRowToProfile(updated)
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getNotifications(): Promise<Notification[]> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []).map(notificationRowToNotification)
}

export async function markNotificationRead(id: string): Promise<void> {
  const supabase = createSupabaseClient()
  const { error } = await supabase
    .from('notifications')
    .update({ unread: false })
    .eq('id', id)
  if (error) throw error
}

export async function markAllNotificationsRead(): Promise<void> {
  const supabase = createSupabaseClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return
  const { error } = await supabase
    .from('notifications')
    .update({ unread: false })
    .eq('user_id', user.user.id)
    .eq('unread', true)
  if (error) throw error
}
