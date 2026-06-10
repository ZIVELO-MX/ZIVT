'use client'

// Central data hook: fetches all app tables and wires Supabase realtime.
// Use in the root page only — pass data down as props from there.

import { useState, useEffect } from 'react'
import { createClient } from './client'
import {
  getClients,
  getLearningTasks,
  getNotifications,
  getProfiles,
  getProjects,
  getTasks,
} from './queries'
import type { Client, LearningTask, Notification, Profile, Project, Task } from './types'

export type AppData = {
  tasks:        Task[]
  setTasks:     React.Dispatch<React.SetStateAction<Task[]>>
  projects:     Project[]
  setProjects:  React.Dispatch<React.SetStateAction<Project[]>>
  clients:      Client[]
  setClients:   React.Dispatch<React.SetStateAction<Client[]>>
  profiles:     Profile[]
  setProfiles:  React.Dispatch<React.SetStateAction<Profile[]>>
  notifications:     Notification[]
  setNotifications:  React.Dispatch<React.SetStateAction<Notification[]>>
  teams:    any[]
  setTeams: React.Dispatch<React.SetStateAction<any[]>>
  learning:    LearningTask[]
  setLearning: React.Dispatch<React.SetStateAction<LearningTask[]>>
  loading: boolean
}

export function useAppData(): AppData {
  const [tasks,         setTasks]         = useState<Task[]>([])
  const [projects,      setProjects]      = useState<Project[]>([])
  const [clients,       setClients]       = useState<Client[]>([])
  const [profiles,      setProfiles]      = useState<Profile[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [teams,         setTeams]         = useState<any[]>([])
  const [learning,      setLearning]      = useState<LearningTask[]>([])
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      getProjects().then(setProjects),
      getTasks().then(setTasks),
      getClients().then(setClients),
      getProfiles().then(setProfiles),
      getNotifications().then(setNotifications),
      getLearningTasks().then(setLearning),
    ]).finally(() => setLoading(false))

    const supabase = createClient()
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' },       () => getProjects().then(setProjects))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' },          () => getTasks().then(setTasks))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' },        () => getClients().then(setClients))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' },       () => getProfiles().then(setProfiles))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' },  () => getNotifications().then(setNotifications))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'learning_tasks' }, () => getLearningTasks().then(setLearning))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return { tasks, setTasks, projects, setProjects, clients, setClients, profiles, setProfiles, notifications, setNotifications, teams, setTeams, learning, setLearning, loading }
}
