import type { Task } from './supabase/types'

export const MOCK_PROFILES = [
  { id: 'u1', name: 'Benjamín Rodríguez', initials: 'BR', color: '#D72228', role: 'Founder', status: 'active', permission: 'founder' as const },
  { id: 'u2', name: 'María García', initials: 'MG', color: '#3A47B5', role: 'Designer', status: 'active', permission: 'editor' as const },
  { id: 'u3', name: 'Carlos López', initials: 'CL', color: '#1E6B3C', role: 'Developer', status: 'active', permission: 'editor' as const },
  { id: 'u4', name: 'Ana Martínez', initials: 'AM', color: '#7A5A12', role: 'QA', status: 'active', permission: 'viewer' as const },
]

export const MOCK_EVENTS: (Partial<Task> & { start: string; end: string })[] = [
  {
    id: 'evt-1', title: 'Lanzamiento landing page', project: 'p-1',
    tag: 'frontend', priority: 'high', col: 'done',
    start: '2026-06-01T09:00', end: '2026-06-03T18:00',
    assignee: ['u1', 'u2'], due: '2026-06-03',
  },
  {
    id: 'evt-2', title: 'Revisión de diseño con cliente', project: 'p-2',
    tag: 'design', priority: 'med', col: 'progress',
    start: '2026-06-10T10:00', end: '2026-06-10T12:00',
    assignee: ['u1'], due: '2026-06-10',
  },
  {
    id: 'evt-3', title: 'Integración pasarela de pago', project: 'p-1',
    tag: 'backend', priority: 'high', col: 'todo',
    start: '2026-06-15T08:00', end: '2026-06-19T18:00',
    assignee: ['u3'], due: '2026-06-19',
  },
  {
    id: 'evt-4', title: 'QA del módulo de inventario', project: 'p-2',
    tag: 'qa', priority: 'med', col: 'review',
    start: '2026-06-12T14:00', end: '2026-06-12T17:00',
    assignee: ['u2', 'u4'], due: '2026-06-12',
  },
  {
    id: 'evt-5', title: 'Capacitación al equipo', project: 'p-3',
    tag: 'planning', priority: 'low', col: 'progress',
    start: '2026-06-20T09:00', end: '2026-06-20T13:00',
    assignee: ['u1', 'u3', 'u4'], due: '2026-06-20',
  },
  {
    id: 'evt-6', title: 'Deploy a producción', project: 'p-1',
    tag: 'backend', priority: 'high', col: 'todo',
    start: '2026-06-25T08:00', end: '2026-06-26T18:00',
    assignee: ['u3'], due: '2026-06-26',
  },
  {
    id: 'evt-7', title: 'Sprint review', project: null,
    tag: 'planning', priority: 'med', col: 'blocked',
    start: '2026-06-30T10:00', end: '2026-06-30T11:00',
    assignee: ['u1', 'u2', 'u3', 'u4'], due: '2026-06-30',
  },
  {
    id: 'evt-8', title: 'Diseño de nueva landing', project: 'p-2',
    tag: 'design', priority: 'med', col: 'todo',
    start: '2026-07-05T09:00', end: '2026-07-07T18:00',
    assignee: ['u2'], due: '2026-07-07',
  },
  {
    id: 'evt-9', title: 'Pruebas de carga', project: 'p-1',
    tag: 'qa', priority: 'high', col: 'todo',
    start: '2026-07-10T08:00', end: '2026-07-10T17:00',
    assignee: ['u4'], due: '2026-07-10',
  },
  {
    id: 'evt-10', title: 'Reunión de planning', project: null,
    tag: 'planning', priority: 'med', col: 'progress',
    start: '2026-06-08T10:00', end: '2026-06-08T11:00',
    assignee: ['u1', 'u2', 'u3', 'u4'], due: '2026-06-08',
  },
]
