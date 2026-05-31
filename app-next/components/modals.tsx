'use client'

import { useState, useEffect, useRef, useMemo, useReducer } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Ic } from '@/components/icons'
import { Avatar, Drawer, Modal, Button, Badge, Input, Select, ProgressBar, Tag } from '@/components/ui'
import { PROJECTS_INIT, TASKS_INIT, CLIENTS_INIT, COLUMNS, TAG_STYLES, PRIORITY, STATUS_LABEL, TASK_TEMPLATES, formatDate, formatMoney, daysUntil } from '@/lib/data'
import type { Notification } from '@/lib/supabase/types'
import type { WorkTeam } from '@/lib/data'
import { CustomDatePicker } from './controls'

const EMPTY_NOTIFICATIONS: Notification[] = []
const EMPTY_TEAMS: WorkTeam[] = []

const KIND_LABEL: Record<string, string> = {
  page: 'Navegar', action: 'Acción', project: 'Proyecto', client: 'Cliente', task: 'Tarea',
}

const DENSITIES = [
  { id: 'compact', label: 'Compacto', desc: 'Menos espacio, más contenido' },
  { id: 'default', label: 'Normal', desc: 'Espaciado predeterminado' },
  { id: 'relaxed', label: 'Cómodo', desc: 'Más espacio para respirar' },
]

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getLinkDomain(url: string) {
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

function getExtLabel(type: string, name: string) {
  if (type.includes('pdf')) return 'PDF'
  if (type.includes('word') || type.includes('doc')) return 'DOC'
  if (type.includes('excel') || type.includes('sheet') || type.includes('xls')) return 'XLS'
  if (type.includes('powerpoint') || type.includes('ppt')) return 'PPT'
  if (type.includes('zip') || type.includes('rar')) return 'ZIP'
  return (name.split('.').pop()?.toUpperCase() || 'FILE').slice(0, 4)
}

function toggle<T>(arr: T[], v: T): T[] { return arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v] }

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', tone = 'danger', onConfirm, onCancel }: any) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onCancel() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])
  if (!open) return null
  const isDanger = tone === 'danger'
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-carbon/35 fade-in cursor-default" onClick={onCancel} aria-label="Cerrar" />
      <div className="relative bg-white rounded-lg shadow-pop border border-line2 pop-in w-[440px] overflow-hidden">
        <div className="p-6">
          <div className={`size-12 rounded-full mb-4 inline-flex items-center justify-center ${isDanger ? 'bg-tint text-zred' : 'bg-soft text-carbon'}`}>
            {isDanger ? <Ic.Trash width="22" height="22" /> : <Ic.Check width="22" height="22" />}
          </div>
          <h3 className="text-[18px] font-bold tracking-tight mb-2">{title}</h3>
          <p className="text-[13.5px] text-muted leading-relaxed">{message}</p>
        </div>
        <div className="px-6 py-4 bg-soft/60 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={isDanger ? 'primary' : 'dark'} size="sm" onClick={onConfirm}>
            {isDanger && <Ic.Trash width="14" height="14" />}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

const NOTIF_ICON: Record<string, { ic: React.ReactNode; bg: string; tx: string }> = {
  mention: { ic: <Ic.Chat width="13" height="13" />, bg: 'bg-tint', tx: 'text-zred' },
  assigned: { ic: <Ic.Arrow width="13" height="13" />, bg: 'bg-[#EEF2FF]', tx: 'text-[#3A47B5]' },
  comment: { ic: <Ic.Chat width="13" height="13" />, bg: 'bg-soft', tx: 'text-carbon' },
  review: { ic: <Ic.Clock width="13" height="13" />, bg: 'bg-[#FFF4DE]', tx: 'text-[#7A5A12]' },
  done: { ic: <Ic.Check width="13" height="13" />, bg: 'bg-[#E6F4EA]', tx: 'text-[#1E6B3C]' },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'ayer';
  if (days < 30) return `hace ${days} d`;
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
}

export function NotificationsDrawer({ open, onClose, notifications = EMPTY_NOTIFICATIONS, onMarkRead, onMarkAllRead, profiles = [] }: any) {
  const [tab, setTab] = useState('all')
  const unread = notifications.filter((n: Notification) => n.unread).length

  const visible = tab === 'unread' ? notifications.filter((n: Notification) => n.unread) : notifications
  const groups: Record<string, Notification[]> = {}
  visible.forEach((n: Notification) => {
    const diff = Date.now() - new Date(n.createdAt).getTime();
    const hrs = Math.floor(diff / 3600000);
    const key = hrs < 24 ? 'Hoy' : hrs < 168 ? 'Esta semana' : 'Anteriores';
    (groups[key] = groups[key] || []).push(n)
  })

  return (
    <Drawer open={open} onClose={onClose} title={`Notificaciones${unread ? ` · ${unread}` : ''}`} width={420}
      footer={
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] text-muted">{unread} sin leer · {notifications.length} totales</span>
          <Button variant="secondary" size="sm" onClick={() => onMarkAllRead?.()} disabled={unread === 0}>
            <Ic.Check width="14" height="14" /> Marcar todas leídas
          </Button>
        </div>
      }>
      <div className="px-6 pt-4 pb-2">
        <div className="flex items-center gap-1 bg-soft rounded-full p-1 w-fit">
          <button type="button" onClick={() => setTab('all')} className={`px-3 h-8 rounded-full text-[12.5px] font-semibold ${tab === 'all' ? 'bg-white text-carbon shadow-soft' : 'text-muted'}`}>Todas</button>
          <button type="button" onClick={() => setTab('unread')} className={`px-3 h-8 rounded-full text-[12.5px] font-semibold inline-flex items-center gap-1.5 ${tab === 'unread' ? 'bg-white text-carbon shadow-soft' : 'text-muted'}`}>
            Sin leer
            {unread > 0 && <span className="px-1.5 rounded-full bg-zred text-white text-[10.5px] nums">{unread}</span>}
          </button>
        </div>
      </div>
      <div className="px-3 pb-4">
        {Object.entries(groups).map(([label, arr]) => (
          <div key={label} className="mb-4">
            <div className="px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted">{label}</div>
            <div>
              {arr.map((n: Notification) => {
                const user = profiles.find(u => u.id === n.userId)
                const meta = NOTIF_ICON[n.type] || { ic: <Ic.Bell width="13" height="13" />, bg: 'bg-soft', tx: 'text-carbon' }
                return (
                  <button type="button" key={n.id} onClick={() => onMarkRead?.(n.id)}
                    className={`group w-full text-left p-3 rounded-md hover:bg-soft transition-colors flex items-start gap-3 relative`}>
                    {n.unread && <span className="absolute left-1 top-5 size-1.5 rounded-full bg-zred" />}
                    <div className="relative">
                      <Avatar user={user} size={36} />
                      <span className={`absolute -bottom-1 -right-1 size-5 rounded-full ring-2 ring-white inline-flex items-center justify-center ${meta.bg} ${meta.tx}`}>
                        {meta.ic}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] leading-snug text-carbon">
                        {n.title}
                      </div>
                      {n.body && (
                        <div className="text-[12px] text-muted mt-0.5">{n.body}</div>
                      )}
                      <div className="text-[11.5px] text-muted mt-1">{timeAgo(n.createdAt)}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">\n            <div className="size-12 rounded-full bg-soft inline-flex items-center justify-center text-muted mb-3">
              <Ic.Check width="20" height="20" />
            </div>
            <div className="text-[14px] font-semibold mb-1">Todo al día</div>
            <div className="text-[12.5px] text-muted">No tienes notificaciones nuevas.</div>
          </div>
        )}
      </div>
    </Drawer>
  )
}

export function UserMenu({ open, anchorRef, onClose, user, dark, onToggleDark, onNavigate, onOpenNotifs, onOpenShortcuts, onOpenPrefs }: any) {
  const router = useRouter()
  const popRef = useRef(null)
  useEffect(() => {
    function onDown(e) {
      if (!open) return
      if (popRef.current?.contains(e.target)) return
      if (anchorRef?.current?.contains(e.target)) return
      onClose()
    }
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open, onClose, anchorRef])

  if (!open) return null
  return (
    <div ref={popRef} className="absolute right-8 top-[68px] z-40 w-[300px] bg-white rounded-lg border border-line2 shadow-pop pop-in overflow-hidden">
      <div className="p-4 border-b border-line2 flex items-center gap-3">
        <Avatar user={user} size={44} />
        <div className="min-w-0">
          <div className="font-bold text-[14px] truncate">{user.name}</div>
          <div className="text-[12px] text-muted truncate">{user.email || 'raul@zivelo.dev'}</div>
        </div>
      </div>
      <div className="p-2">
        {[
          { ic: <Ic.Users width="15" height="15" />, l: 'Mi perfil', k: '⌘P', onClick: () => { onClose(); onNavigate?.('profile'); } },
          { ic: <Ic.Settings width="15" height="15" />, l: 'Preferencias', k: '⌘,', onClick: () => { onClose(); onOpenPrefs?.(); } },
          { ic: <Ic.Bell width="15" height="15" />, l: 'Notificaciones', k: '', onClick: () => { onClose(); onOpenNotifs?.(); } },
          { ic: <Ic.Sparkle width="15" height="15" />, l: 'Atajos de teclado', k: '?', onClick: () => { onClose(); onOpenShortcuts?.(); } },
        ].map(it => (
          <button type="button" key={it.l} onClick={it.onClick} className="w-full flex items-center gap-3 px-3 h-9 rounded-md hover:bg-soft text-[13px] text-left">
            <span className="text-muted">{it.ic}</span>
            <span className="flex-1">{it.l}</span>
            {it.k && <kbd className="font-mono text-[10.5px] text-muted bg-soft border border-line2 rounded px-1.5 py-0.5">{it.k}</kbd>}
          </button>
        ))}

        <button type="button" onClick={onToggleDark} className="w-full flex items-center gap-3 px-3 h-9 rounded-md hover:bg-soft text-[13px] text-left">
          <span className="text-muted">
            {dark ? (
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
            )}
          </span>
          <span className="flex-1">{dark ? 'Modo claro' : 'Modo oscuro'}</span>
          <span className={`inline-flex items-center w-9 h-5 rounded-full transition-colors ${dark ? 'bg-zred' : 'bg-soft border border-line'}`}>
            <span className={`size-4 rounded-full bg-white transition-transform shadow ${dark ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
          </span>
        </button>
      </div>
      <div className="p-2 border-t border-line2">
        <button type="button"
          onClick={async () => {
            try {
              localStorage.removeItem('zivelo-dark')
              localStorage.removeItem('zivelo-sidebar')
              localStorage.removeItem('zivelo-density')
              localStorage.removeItem('zivelo-remember')
            } catch {}
            await createClient().auth.signOut()
            router.push('/login')
          }}
          className="w-full flex items-center gap-3 px-3 h-9 rounded-md hover:bg-tint text-[13px] text-left text-zred font-semibold cursor-pointer">
          <Ic.Arrow width="15" height="15" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export function CommandPalette({ open, onClose, onNavigate, projects: dynamicProjects, clients: dynamicClients, tasks: dynamicTasks }: any) {
  if (!open) return null
  return <CommandPaletteInner key="cmd" onClose={onClose} onNavigate={onNavigate}
    projects={dynamicProjects} clients={dynamicClients} tasks={dynamicTasks} />
}

function CommandPaletteInner({ onClose, onNavigate, projects: dynamicProjects, clients: dynamicClients, tasks: dynamicTasks }: any) {
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => { const t = setTimeout(() => inputRef.current?.focus(), 50); return () => clearTimeout(t) }, [])

  const projs = dynamicProjects || PROJECTS_INIT;
  const clis = dynamicClients || CLIENTS_INIT;
  const tks = dynamicTasks || TASKS_INIT;

  const all = useMemo(() => {
    const items = []
    items.push(
      { id: 'go-dashboard', kind: 'page', label: 'Ir al Dashboard', sub: 'Resumen del workspace', icon: <Ic.Dashboard width="16" height="16" />, action: () => onNavigate('dashboard') },
      { id: 'go-kanban', kind: 'page', label: 'Ir a Pendientes', sub: 'Tablero kanban', icon: <Ic.Kanban width="16" height="16" />, action: () => onNavigate('kanban') },
      { id: 'go-projects', kind: 'page', label: 'Ir a Proyectos', sub: 'Métricas por proyecto', icon: <Ic.Folder width="16" height="16" />, action: () => onNavigate('projects') },
      { id: 'go-clients', kind: 'page', label: 'Ir a Clientes', sub: 'Cartera', icon: <Ic.Briefcase width="16" height="16" />, action: () => onNavigate('clients') },
    )
    items.push(
      { id: 'act-new-task', kind: 'action', label: 'Crear nueva tarea', sub: 'Nuevo pendiente en el tablero', icon: <Ic.Plus width="16" height="16" />, action: () => onNavigate('kanban') },
      { id: 'act-new-project', kind: 'action', label: 'Crear nuevo proyecto', sub: 'Iniciar un proyecto', icon: <Ic.Plus width="16" height="16" />, action: () => onNavigate('projects') },
      { id: 'act-new-client', kind: 'action', label: 'Agregar cliente', sub: 'Nuevo cliente o prospecto', icon: <Ic.Plus width="16" height="16" />, action: () => onNavigate('clients') },
    )
    projs.forEach(p => items.push({
      id: 'p-' + p.id, kind: 'project', label: p.name, sub: p.kind, accent: p.accent,
      icon: <Ic.Folder width="16" height="16" />, action: () => onNavigate('projects'),
    }))
    clis.forEach(c => items.push({
      id: 'c-' + c.id, kind: 'client', label: c.name, sub: `${c.industry} · ${c.contact}`,
      icon: <Ic.Briefcase width="16" height="16" />, action: () => onNavigate('clients'),
    }))
    tks.forEach(t => items.push({
      id: 't-' + t.id, kind: 'task', label: t.title, sub: 'Tarea',
      icon: <Ic.Kanban width="16" height="16" />, action: () => onNavigate('kanban'),
    }))
    return items
  }, [onNavigate, projs, clis, tks])

  const filtered = useMemo(() => {
    if (!q.trim()) return all.slice(0, 8)
    const term = q.toLowerCase()
    return all.filter(x => x.label.toLowerCase().includes(term) || x.sub.toLowerCase().includes(term)).slice(0, 12)
  }, [all, q])

  function onKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); filtered[idx]?.action(); onClose() }
  }

  const groups: Record<string, any[]> = {}
  filtered.forEach((it, i) => {
    groups[it.kind] = groups[it.kind] || []
    groups[it.kind].push({ ...it, _i: i })
  })

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]">
      <button type="button" className="absolute inset-0 bg-carbon/35 fade-in cursor-default" onClick={onClose} aria-label="Cerrar" />
      <div className="relative w-full max-w-[620px] bg-white rounded-lg shadow-pop border border-line2 pop-in overflow-hidden">
        <div className="flex items-center gap-3 px-5 h-14 border-b border-line2">
          <Ic.Search width="18" height="18" className="text-muted" />
          <input ref={inputRef} value={q} onChange={(e) => { setQ(e.target.value); setIdx(0) }} onKeyDown={onKey}
            placeholder="Buscar páginas, tareas, proyectos, clientes..."
            className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-muted" aria-label="Buscar" />
          <kbd className="font-mono text-[10.5px] text-muted bg-soft border border-line2 rounded px-1.5 py-0.5">Esc</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto scroll-thin py-2">
          {filtered.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="text-[14px] font-semibold mb-1">Sin resultados</div>
              <div className="text-[12.5px] text-muted">Prueba con otra palabra clave.</div>
            </div>
          ) : (
            Object.entries(groups).map(([kind, items]) => (
              <div key={kind} className="mb-1">
                <div className="px-5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted">{KIND_LABEL[kind]}</div>
                {items.map(it => (
                  <button type="button" key={it.id} onMouseEnter={() => setIdx(it._i)} onClick={() => { it.action(); onClose() }}
                    className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${idx === it._i ? 'bg-soft' : ''}`}>
                    <span className={`size-8 rounded-md inline-flex items-center justify-center ${it.accent ? '' : 'bg-soft text-carbon'}`}
                      style={it.accent ? { background: it.accent + '18', color: it.accent } : {}}>
                      {it.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-semibold truncate">{it.label}</div>
                      <div className="text-[11.5px] text-muted truncate">{it.sub}</div>
                    </div>
                    {idx === it._i && <Ic.Arrow width="14" height="14" className="text-muted" />}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
        <div className="px-5 py-2.5 bg-soft/60 border-t border-line2 flex items-center gap-4 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1.5"><kbd className="font-mono bg-white border border-line2 rounded px-1.5 py-0.5">↑↓</kbd> navegar</span>
          <span className="inline-flex items-center gap-1.5"><kbd className="font-mono bg-white border border-line2 rounded px-1.5 py-0.5">↵</kbd> seleccionar</span>
          <span className="inline-flex items-center gap-1.5"><kbd className="font-mono bg-white border border-line2 rounded px-1.5 py-0.5">esc</kbd> cerrar</span>
          <span className="ml-auto">{filtered.length} resultados</span>
        </div>
      </div>
    </div>
  )
}

const PROJECT_ACCENTS = ['#D72228', '#1D1D1B', '#2F4858', '#6B6B6B', '#B91C22', '#7A5A12', '#1E6B3C', '#3A47B5']

export function NewProjectModal({ open, onClose, onCreate, clients, presetClient, teams = EMPTY_TEAMS, setTeams, profiles = [] }: any) {
  if (!open) return null
  return <NewProjectForm key={'np-' + (presetClient?.id || 'new')} onClose={onClose} onCreate={onCreate} clients={clients} presetClient={presetClient} teams={teams} setTeams={setTeams} profiles={profiles} />
}

function NewProjectForm({ onClose, onCreate, clients, presetClient, teams, setTeams, profiles = [] }: any) {
  const [form, setForm] = useState({
    id: '', name: '', description: '', kind: 'Web development',
    client: presetClient?.id || '',
    status: 'todo',
    start: new Date().toISOString().slice(0, 10), due: '',
    budget: 0, team: ['u1'], accent: '#D72228',
  })
  const [useTemplate, setUseTemplate] = useState(true)

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  const template = TASK_TEMPLATES[form.kind] ?? []

  function toggleMember(id: string) {
    set('team', form.team.includes(id) ? form.team.filter(x => x !== id) : [...form.team, id])
  }

  function applyTeam(wt: WorkTeam) {
    const allIn = wt.members.every(m => form.team.includes(m))
    if (allIn) {
      set('team', form.team.filter(m => !wt.members.includes(m)))
    } else {
      set('team', Array.from(new Set([...form.team, ...wt.members])))
    }
  }

  function submit() {
    if (!form.name.trim()) return
    const pid = 'p' + Date.now()
    const templateTasks = useTemplate && template.length > 0
      ? template.map((t, i) => ({
          id: 'tt' + Date.now() + i,
          col: 'todo',
          project: pid,
          title: t.title,
          tag: t.tag,
          priority: t.priority,
          due: null,
          assignee: form.team.slice(0, 1),
          subtasks: [],
          comments: 0,
          progress: {},
        }))
      : []
    onCreate({
      id: pid,
      name: form.name.trim(),
      description: form.description.trim(),
      client: form.client || null,
      kind: form.kind,
      status: form.status,
      progress: form.status === 'done' ? 100 : form.status === 'review' ? 80 : 0,
      start: form.start, due: form.due || form.start,
      team: form.team,
      health: 'on_track',
      budget: Number(form.budget) || 0,
      spent: 0,
      tasksDone: 0, tasksTotal: 0,
      accent: form.accent,
    }, templateTasks)
    onClose()
  }

  return (
    <Modal open={true} onClose={onClose} title="Nuevo proyecto" width={600}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={submit} disabled={!form.name.trim()}>
          <Ic.Plus width="14" height="14" /> Crear proyecto
        </Button>
      </>}>
      <div className="space-y-5">

        <Input label="Nombre del proyecto" placeholder="Ej. Café Bruma — Web + reservas" value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus />

        <div>
          <label htmlFor="proj-desc" className="block text-[12px] font-semibold text-carbon mb-1.5 uppercase tracking-wider">
            Descripción <span className="text-muted font-normal normal-case tracking-normal">(opcional)</span>
          </label>
          <textarea
            id="proj-desc"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Contexto, objetivos, tecnologías, notas iniciales..."
            className="w-full rounded-md border border-line2 px-3 py-2.5 text-[13.5px] leading-relaxed resize-none outline-none focus:border-zred/50 focus:ring-2 focus:ring-zred/10 placeholder:text-muted transition-all"
            style={{ height: '72px' }}
            aria-label="Descripción del proyecto"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Tipo" value={form.kind} onChange={(e) => set('kind', e.target.value)}
            options={['Web development', 'Point of sale', 'Restaurant solutions', 'Web app', 'Producto interno', 'Consultoría', 'Otro'].map(v => ({ value: v, label: v }))} />
          <Select label="Cliente (opcional)" value={form.client} onChange={(e) => set('client', e.target.value)}
            options={[{ value: '', label: '— Proyecto interno —' }, ...clients.map(c => ({ value: c.id, label: c.name }))]} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <CustomDatePicker label="Inicio" value={form.start} onChange={(e) => set('start', e.target.value)} />
          <CustomDatePicker label="Entrega" value={form.due} onChange={(e) => set('due', e.target.value)} />
          <Input label="Presupuesto (MXN)" type="number" placeholder="0" value={form.budget} onChange={(e) => set('budget', e.target.value)} />
        </div>

        <Select label="Estado inicial" value={form.status} onChange={(e) => set('status', e.target.value)}
          options={[
            { value: 'todo', label: 'Por iniciar' },
            { value: 'in_progress', label: 'En progreso' },
            { value: 'review', label: 'En revisión' },
            { value: 'done', label: 'Terminado' },
          ]} />

        {/* Equipo */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[12px] font-semibold text-carbon uppercase tracking-wider">Equipo asignado</div>
            {teams.length === 0 && (
              <span className="text-[11.5px] text-muted">Crea grupos en Usuarios → Grupos</span>
            )}
          </div>

          {/* Quick-select por grupo */}
          {teams.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {teams.map((wt: WorkTeam) => {
                const allIn = wt.members.every(m => form.team.includes(m))
                return (
                  <button key={wt.id} type="button" onClick={() => applyTeam(wt)}
                    className={`inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full border text-[12px] font-semibold transition-all ${allIn ? 'text-white border-transparent' : 'bg-white text-carbon border-line hover:border-[var(--tc)]/60'}`}
                    style={allIn ? { background: wt.color, borderColor: wt.color } : { '--tc': wt.color } as React.CSSProperties}>
                    <span className="size-2 rounded-full" style={{ background: allIn ? 'rgba(255,255,255,0.7)' : wt.color }} />
                    {wt.name}
                    <span className="opacity-60 text-[10.5px]">·{wt.members.length}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Selección individual */}
          <div className="flex flex-wrap gap-2">
            {profiles.map(u => {
              const on = form.team.includes(u.id)
              return (
                <button key={u.id} type="button" onClick={() => toggleMember(u.id)}
                  className={`flex items-center gap-2 pl-1 pr-3 h-9 rounded-full border transition-all ${on ? 'bg-carbon text-white border-carbon' : 'bg-white text-carbon border-line hover:border-zred/40'}`}>
                  <Avatar user={u} size={26} />
                  <span className="text-[12.5px] font-semibold">{u.name.split(' ')[0]}</span>
                  {on && <Ic.Check width="13" height="13" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Template de tareas */}
        {template.length > 0 && (
          <div className="rounded-md border border-line2 overflow-hidden">
            <button type="button"
              onClick={() => setUseTemplate(v => !v)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${useTemplate ? 'bg-[#E6F4EA]' : 'bg-soft/60'}`}>
              <div className="flex items-center gap-2.5">
                <span className={`size-5 rounded border flex items-center justify-center transition-colors ${useTemplate ? 'bg-[#1E6B3C] border-[#1E6B3C]' : 'border-line bg-white'}`}>
                  {useTemplate && <Ic.Check width="11" height="11" className="text-white" />}
                </span>
                <span className="text-[13px] font-semibold">
                  Usar lista de tareas predeterminada
                </span>
              </div>
              <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${useTemplate ? 'bg-[#1E6B3C] text-white' : 'bg-soft text-muted'}`}>
                {template.length} tareas
              </span>
            </button>

            {useTemplate && (
              <div className="px-4 py-3 space-y-1.5 border-t border-line2 max-h-48 overflow-y-auto scroll-thin">
                {template.map(t => {
                  const tagMeta = TAG_STYLES[t.tag]
                  return (
                    <div key={t.title} className="flex items-center gap-2.5 py-1">
                      <span className="size-4 rounded-full border border-line flex items-center justify-center shrink-0">
                        <span className="size-1.5 rounded-full bg-muted" />
                      </span>
                      <span className="flex-1 text-[12.5px] text-carbon">{t.title}</span>
                      {tagMeta && (
                        <span className={`text-[10.5px] font-semibold px-1.5 py-0.5 rounded ${tagMeta.cls}`}>{tagMeta.label}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Color de acento */}
        <div>
          <div className="text-[12px] font-semibold text-carbon mb-2 uppercase tracking-wider">Color de acento</div>
          <div className="flex gap-2">
            {PROJECT_ACCENTS.map(c => (
              <button key={c} type="button" onClick={() => set('accent', c)} aria-label={`Color ${c}`}
                className={`size-8 rounded-md transition-transform ${form.accent === c ? 'ring-2 ring-offset-2 ring-carbon scale-110' : 'hover:scale-105'}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>

      </div>
    </Modal>
  )
}

type DetailTab = 'details' | 'files' | 'notes'

interface DetailState {
  activeTab: DetailTab
  files: any[]
  notes: string
  dragging: boolean
  noteSaved: boolean
  links: { id: string; label: string; url: string }[]
  addingLink: boolean
  newLink: { label: string; url: string }
}

type DetailAction =
  | { type: 'SET_ACTIVE_TAB'; tab: DetailTab }
  | { type: 'ADD_FILES'; files: any[] }
  | { type: 'REMOVE_FILE'; id: string }
  | { type: 'SET_NOTES'; notes: string }
  | { type: 'SET_DRAGGING'; dragging: boolean }
  | { type: 'SET_NOTE_SAVED'; saved: boolean }
  | { type: 'ADD_LINK'; link: { id: string; label: string; url: string } }
  | { type: 'REMOVE_LINK'; id: string }
  | { type: 'SET_ADDING_LINK'; adding: boolean }
  | { type: 'SET_NEW_LINK'; link: { label: string; url: string } }
  | { type: 'RESET'; notes: string }

function detailReducer(state: DetailState, action: DetailAction): DetailState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB': return { ...state, activeTab: action.tab }
    case 'ADD_FILES': return { ...state, files: [...state.files, ...action.files] }
    case 'REMOVE_FILE': {
      const f = state.files.find(x => x.id === action.id)
      if (f) URL.revokeObjectURL(f.url)
      return { ...state, files: state.files.filter(x => x.id !== action.id) }
    }
    case 'SET_NOTES': return { ...state, notes: action.notes }
    case 'SET_DRAGGING': return { ...state, dragging: action.dragging }
    case 'SET_NOTE_SAVED': return { ...state, noteSaved: action.saved }
    case 'ADD_LINK': return { ...state, links: [...state.links, action.link], addingLink: false, newLink: { label: '', url: '' } }
    case 'REMOVE_LINK': return { ...state, links: state.links.filter(l => l.id !== action.id) }
    case 'SET_ADDING_LINK': return { ...state, addingLink: action.adding }
    case 'SET_NEW_LINK': return { ...state, newLink: action.link }
    case 'RESET': return { activeTab: 'details', files: [], notes: action.notes, dragging: false, noteSaved: false, links: [], addingLink: false, newLink: { label: '', url: '' } }
    default: return state
  }
}

export function ProjectDetailDrawer({ open, project, clients, onClose, onEdit, profiles = [] }: any) {
  const [state, dispatch] = useReducer(detailReducer, {
    activeTab: 'details' as DetailTab,
    files: [],
    notes: project?.description || '',
    dragging: false,
    noteSaved: false,
    links: [],
    addingLink: false,
    newLink: { label: '', url: '' },
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const noteSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => { if (noteSaveRef.current) clearTimeout(noteSaveRef.current) }
  }, [])

  const [todayMs, setTodayMs] = useState(Date.now())
  useEffect(() => { setTodayMs(Date.now()) }, [])
  const startTs = project ? new Date(project.start).getTime() : 0
  const dueTs = project ? new Date(project.due).getTime() : 0
  const totalTs = dueTs - startTs
  const elapsedTs = todayMs - startTs
  const pctTimeline = Math.min(Math.max(Math.round((elapsedTs / totalTs) * 100), 0), 100)

  if (!project) return null

  const { activeTab, files, notes, dragging, noteSaved, links, addingLink, newLink } = state

  const client = clients.find(c => c.id === project.client)
  const team = project.team.flatMap((id: string) => { const u = profiles.find((t: any) => t.id === id); return u ? [u] : [] })
  const status = STATUS_LABEL[project.status]
  const days = daysUntil(project.due)
  const overdue = days < 0 && project.status !== 'done'
  const tasks = TASKS_INIT.filter(t => t.project === project.id)

  function addFiles(fileList: FileList) {
    const added = Array.from(fileList).map(f => ({
      id: 'f' + Date.now() + Math.random().toString(36).slice(2, 5),
      name: f.name,
      size: f.size,
      type: f.type,
      url: URL.createObjectURL(f),
      isImage: f.type.startsWith('image/'),
    }))
    dispatch({ type: 'ADD_FILES', files: added })
  }

  function removeFile(id: string) {
    dispatch({ type: 'REMOVE_FILE', id })
  }

  function saveNotes() {
    dispatch({ type: 'SET_NOTE_SAVED', saved: true })
    if (noteSaveRef.current) clearTimeout(noteSaveRef.current)
    noteSaveRef.current = setTimeout(() => dispatch({ type: 'SET_NOTE_SAVED', saved: false }), 2000)
  }

  function addLink() {
    if (!newLink.url.trim()) return
    const label = newLink.label.trim() || getLinkDomain(newLink.url)
    const href = newLink.url.startsWith('http') ? newLink.url : 'https://' + newLink.url
    dispatch({ type: 'ADD_LINK', link: { id: 'l' + Date.now(), label, url: href } })
  }

  const images = files.filter(f => f.isImage)
  const docs = files.filter(f => !f.isImage)

  const TABS = [
    { id: 'details', label: 'Resumen' },
    { id: 'files', label: files.length > 0 ? `Archivos · ${files.length}` : 'Archivos' },
    { id: 'notes', label: 'Notas' },
  ]

  return (
    <Drawer open={open} onClose={onClose} title="Detalle del proyecto" width={600}
      footer={
        <div className="flex justify-between gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>Cerrar</Button>
        </div>
      }>

      {/* Fixed header */}
      <div className="px-6 pt-5 pb-4 border-b border-line2">
        <div className="flex items-start gap-4 mb-4">
          <div className="size-14 rounded-md flex items-center justify-center shrink-0" style={{ background: project.accent + '18' }}>
            <Ic.Folder width="24" height="24" style={{ color: project.accent }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge className={status.cls}>{status.label}</Badge>
              {project.health === 'at_risk' && <Badge className="bg-tint text-zred">En riesgo</Badge>}
            </div>
            <h2 className="text-[20px] font-bold tracking-tight leading-tight mb-1">{project.name}</h2>
            <div className="text-[13px] text-muted">
              {client ? client.name : 'Proyecto interno'} · {project.kind}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-soft rounded-full p-1 w-fit">
          {TABS.map(t => (
            <button type="button" key={t.id} onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: t.id as DetailTab })}
              className={`px-4 h-8 rounded-full text-[12.5px] font-semibold transition-all ${activeTab === t.id ? 'bg-white text-carbon shadow-soft' : 'text-muted hover:text-carbon'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resumen */}
      {activeTab === 'details' && (
        <div className="p-6 space-y-6">
          <div className="rounded-md border border-line2 p-5 bg-gradient-to-br from-white to-soft/40">
            <div className="flex items-end justify-between mb-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">Progreso</div>
                <div className="text-[40px] font-extrabold nums leading-none">{project.progress}<span className="text-[20px] text-muted">%</span></div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">Tareas</div>
                <div className="text-[18px] font-bold nums">{project.tasksDone}<span className="text-muted font-normal">/{project.tasksTotal}</span></div>
              </div>
            </div>
            <ProgressBar value={project.progress} color={project.accent} />
          </div>

          {/* Timeline */}
          {(() => {
            const timelineColor = overdue ? '#D72228' : project.accent
            return (
              <div className="p-4 rounded-md border border-line2">
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted mb-3">Línea de tiempo</div>
                <div className="flex items-center justify-between text-[12px] mb-2">
                  <span className="text-muted">{formatDate(project.start)}</span>
                  <span className={`font-semibold ${overdue ? 'text-zred' : 'text-carbon'}`}>
                    {overdue ? `Atrasado ${Math.abs(days)}d` : `${days}d restantes`}
                  </span>
                  <span className="text-muted">{formatDate(project.due)}</span>
                </div>
                <div className="relative h-2 rounded-full bg-soft overflow-visible">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${pctTimeline}%`, background: timelineColor }} />
                  <div
                    className="absolute size-3.5 rounded-full border-2 border-white shadow-pop top-1/2 -translate-y-1/2 -translate-x-1/2"
                    style={{ left: `${Math.min(pctTimeline, 97)}%`, background: timelineColor }}
                  />
                </div>
                <div className="text-[10.5px] text-muted mt-2 text-right">{pctTimeline}% del tiempo transcurrido</div>
              </div>
            )
          })()}

          {/* Budget gauge */}
          {project.budget > 0 ? (() => {
            const pct = Math.round((project.spent / project.budget) * 100)
            const gaugeColor = pct >= 90 ? '#D72228' : pct >= 70 ? '#7A5A12' : '#1E6B3C'
            return (
              <div className="p-4 rounded-md border border-line2">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted">Presupuesto</div>
                  <span className={`text-[11px] font-bold nums px-2 py-0.5 rounded-full ${pct >= 90 ? 'bg-tint text-zred' : pct >= 70 ? 'bg-[#FFF4DE] text-[#7A5A12]' : 'bg-[#E6F4EA] text-[#1E6B3C]'}`}>
                    {pct}% usado
                  </span>
                </div>
                <div className="relative h-3 rounded-full bg-soft overflow-hidden mb-3">
                  <div className="h-3 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: gaugeColor }} />
                </div>
                <div className="flex items-center justify-between text-[12.5px]">
                  <div>
                    <div className="text-muted text-[10.5px] mb-0.5">Ejecutado</div>
                    <div className="font-bold nums">{formatMoney(project.spent).replace('MX$', '$')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-muted text-[10.5px] mb-0.5">Total</div>
                    <div className="font-bold nums">{formatMoney(project.budget).replace('MX$', '$')}</div>
                  </div>
                </div>
              </div>
            )
          })() : (
            <div className="p-4 rounded-md border border-line2">
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted mb-1">Presupuesto</div>
              <div className="text-[14px] font-semibold text-muted">Proyecto interno</div>
            </div>
          )}

          <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Equipo asignado</div>
            <div className="flex flex-wrap gap-2">
              {team.map(u => (
                <div key={u.id} className="flex items-center gap-2 pl-1 pr-3 h-9 rounded-full bg-soft">
                  <Avatar user={u} size={26} />
                  <div className="leading-tight">
                    <div className="text-[12.5px] font-semibold">{u.name.split(' ')[0]}</div>
                    <div className="text-[10.5px] text-muted">{u.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Links útiles */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-semibold text-muted uppercase tracking-wider">Links útiles</div>
              {!addingLink && (
                <button type="button" onClick={() => dispatch({ type: 'SET_ADDING_LINK', adding: true })}
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-zred hover:opacity-75 transition-opacity">
                  <Ic.Plus width="13" height="13" /> Agregar
                </button>
              )}
            </div>

            {addingLink && (
              <div className="rounded-md border border-line2 p-3 space-y-2 mb-2 bg-soft/40">
                <input
                  value={newLink.label}
                  onChange={(e) => dispatch({ type: 'SET_NEW_LINK', link: { ...state.newLink, label: e.target.value } })}
                  placeholder="Nombre (ej. Figma, GitHub, Staging...)"
                  className="w-full rounded border border-line2 px-3 py-2 text-[13px] outline-none focus:border-zred/50 bg-white"
                  aria-label="Nombre del enlace"
                />
                <input
                  value={newLink.url}
                  onChange={(e) => dispatch({ type: 'SET_NEW_LINK', link: { ...state.newLink, url: e.target.value } })}
                  onKeyDown={(e) => { if (e.key === 'Enter') addLink(); if (e.key === 'Escape') dispatch({ type: 'SET_ADDING_LINK', adding: false }) }}
                  placeholder="https://..."
                  className="w-full rounded border border-line2 px-3 py-2 text-[13px] outline-none focus:border-zred/50 bg-white"
                  aria-label="URL del enlace"
                />
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={addLink}>Agregar</Button>
                  <Button variant="ghost" size="sm" onClick={() => { dispatch({ type: 'SET_ADDING_LINK', adding: false }); dispatch({ type: 'SET_NEW_LINK', link: { label: '', url: '' } }) }}>Cancelar</Button>
                </div>
              </div>
            )}

            {links.length === 0 && !addingLink ? (
              <div className="rounded-md border border-dashed border-line p-3 text-center text-[12.5px] text-muted">
                Agrega links al repositorio, Figma, staging u otros recursos.
              </div>
            ) : (
              <div className="space-y-1.5">
                {links.map(lk => (
                  <div key={lk.id} className="group flex items-center gap-3 px-3 py-2.5 rounded-md border border-line2 hover:bg-soft/60 transition-colors">
                    <div className="size-7 rounded bg-soft border border-line2 flex items-center justify-center shrink-0">
                      <Ic.Arrow width="12" height="12" className="text-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold truncate">{lk.label}</div>
                      <div className="text-[11px] text-muted truncate">{getLinkDomain(lk.url)}</div>
                    </div>
                    <a href={lk.url} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 text-[11.5px] font-semibold text-zred hover:underline transition-opacity">
                      Abrir
                    </a>
                    <button type="button" onClick={() => dispatch({ type: 'REMOVE_LINK', id: lk.id })} aria-label="Eliminar enlace"
                      className="opacity-0 group-hover:opacity-100 size-7 rounded hover:bg-tint text-muted hover:text-zred flex items-center justify-center transition-all">
                      <Ic.Trash width="12" height="12" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-semibold text-muted uppercase tracking-wider">Tareas recientes</div>
              <span className="text-[11.5px] text-muted">{tasks.length} totales</span>
            </div>
            {tasks.length === 0 ? (
              <div className="rounded-md border border-dashed border-line p-4 text-center text-[13px] text-muted">
                Aún no hay tareas en este proyecto.
              </div>
            ) : (
              <div className="space-y-1.5">
                {tasks.slice(0, 6).map(t => {
                  const col = COLUMNS.find(c => c.id === t.col)
                  const isDone = t.col === 'done'
                  return (
                    <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-soft transition-colors">
                      <span className={`size-[18px] rounded-full border flex items-center justify-center ${isDone ? 'bg-[#1E6B3C] border-[#1E6B3C] text-white' : 'border-line'}`}>
                        {isDone && <Ic.Check width="11" height="11" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[13px] truncate ${isDone ? 'line-through text-muted' : 'text-carbon'}`}>{t.title}</div>
                      </div>
                      <Tag tag={t.tag} />
                      <span className="text-[11.5px] text-muted w-[80px] text-right">{col?.title}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Archivos */}
      {activeTab === 'files' && (
        <div className="p-6 space-y-5">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.csv"
            className="hidden"
            onChange={(e) => { if (e.target.files?.length) { addFiles(e.target.files); e.target.value = '' } }}
            aria-label="Subir archivos"
          />

          <button
            type="button"
            onDragOver={(e) => { e.preventDefault(); dispatch({ type: 'SET_DRAGGING', dragging: true }) }}
            onDragLeave={() => dispatch({ type: 'SET_DRAGGING', dragging: false })}
            onDrop={(e) => { e.preventDefault(); dispatch({ type: 'SET_DRAGGING', dragging: false }); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all select-none ${dragging ? 'border-zred bg-tint scale-[1.01]' : 'border-line hover:border-zred/50 hover:bg-soft/50'}`}>
            <div className="size-12 rounded-full bg-soft flex items-center justify-center mx-auto mb-3">
              <Ic.Plus width="22" height="22" className="text-muted" />
            </div>
            <div className="text-[14px] font-semibold mb-1">Subir archivos</div>
            <div className="text-[12.5px] text-muted">Arrastra aquí o haz clic para seleccionar</div>
            <div className="text-[11.5px] text-muted mt-1">Imágenes · PDF · Word · Excel · PowerPoint · ZIP</div>
          </button>

          {files.length === 0 ? (
            <div className="text-center py-6 text-[13px] text-muted">
              Aún no hay archivos adjuntos en este proyecto.
            </div>
          ) : (
            <>
              {images.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-3">
                    Imágenes · {images.length}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {images.map(f => (
                      <div key={f.id} className="group relative rounded-md overflow-hidden border border-line2 bg-soft" style={{ aspectRatio: '16/10' }}>
                        <Image src={f.url} alt={f.name} fill className="object-cover" unoptimized />
                        <div className="absolute inset-0 bg-carbon/0 group-hover:bg-carbon/45 transition-all" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <button type="button" aria-label="Eliminar imagen"
                            onClick={(e) => { e.stopPropagation(); removeFile(f.id) }}
                            className="size-8 rounded-full bg-white text-zred flex items-center justify-center shadow-pop">
                            <Ic.Trash width="13" height="13" />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-carbon/70 to-transparent opacity-0 group-hover:opacity-100 transition-all">
                          <div className="text-white text-[10.5px] font-medium truncate">{f.name}</div>
                          <div className="text-white/70 text-[10px]">{formatSize(f.size)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {docs.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-3">
                    Documentos · {docs.length}
                  </div>
                  <div className="space-y-2">
                    {docs.map(f => {
                      const ext = getExtLabel(f.type, f.name)
                      return (
                        <div key={f.id} className="group flex items-center gap-3 px-4 py-3 rounded-md border border-line2 hover:bg-soft/60 transition-colors">
                          <div className="size-10 rounded-md bg-soft border border-line2 flex items-center justify-center shrink-0">
                            <span className="text-[9.5px] font-bold text-muted tracking-wide">{ext}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold truncate">{f.name}</div>
                            <div className="text-[11.5px] text-muted">{formatSize(f.size)}</div>
                          </div>
                          <button type="button" aria-label="Eliminar archivo"
                            onClick={() => removeFile(f.id)}
                            className="opacity-0 group-hover:opacity-100 size-8 rounded-full hover:bg-tint text-muted hover:text-zred flex items-center justify-center transition-all">
                            <Ic.Trash width="13" height="13" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Notas */}
      {activeTab === 'notes' && (
        <div className="p-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-3">Notas del proyecto</div>
          <textarea
            value={notes}
            onChange={(e) => dispatch({ type: 'SET_NOTES', notes: e.target.value })}
            placeholder="Agrega contexto, links, requerimientos, decisiones importantes o cualquier documentación relevante del proyecto..."
            className="w-full rounded-md border border-line2 p-4 text-[13.5px] leading-relaxed resize-none outline-none focus:border-zred/50 focus:ring-2 focus:ring-zred/10 placeholder:text-muted transition-all"
            style={{ minHeight: '280px' }}
            aria-label="Notas del proyecto"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[11.5px] text-muted">{notes.length} caracteres</span>
            <Button variant={noteSaved ? 'secondary' : 'primary'} size="sm" onClick={saveNotes}>
              <Ic.Check width="14" height="14" />
              {noteSaved ? 'Guardado' : 'Guardar notas'}
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  )
}

export function InviteModal({ open, onClose, onSave }: any) {
  if (!open) return null
  return <InviteForm key="invite" onClose={onClose} onSave={onSave} />
}

function InviteForm({ onClose, onSave }: any) {
  const [form, setForm] = useState({ email: '', role: 'editor' });
  const [sent, setSent] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const timerRef = useRef(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  function submit() {
    const email = form.email.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    const user = {
      id: 'u' + Date.now(),
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      initials: email.charAt(0).toUpperCase() + email.charAt(1).toUpperCase(),
      color: ['#D72228','#1D1D1B','#2F4858','#6B6B6B','#B91C22','#7A5A12','#3A47B5','#1E6B3C'][Math.floor(Math.random() * 8)],
      email, phone: '', role: 'Developer',
      status: 'invited', permission: form.role,
      joined: new Date().toISOString().slice(0, 10), lastActive: '—',
    };
    setSent(true);
    timerRef.current = setTimeout(() => { setSent(false); setForm({ email: '', role: 'editor' }); onSave?.(user); onClose(); }, 800);
  }

  return (
    <Modal open={true} onClose={onClose} title="Invitar al equipo" width={480}
      footer={
        sent ? (
          <span className="flex items-center gap-2 text-[13px] font-semibold text-[#1E6B3C]"><Ic.Check width="16" height="16"/> Invitación enviada a {form.email}</span>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" onClick={submit} disabled={!form.email.trim()}>
              <Ic.Mail width="14" height="14"/> Enviar invitación
            </Button>
          </>
        )
      }>
      <div className="space-y-4">
        <p className="text-[13.5px] text-muted leading-relaxed">
          Enviaremos un correo de invitación al usuario para que se una al workspace.
        </p>
        <Input label="Email corporativo" type="email" placeholder="nombre@zivelo.dev" value={form.email} onChange={(e) => set('email', e.target.value)} autoFocus />
        <Select label="Rol de acceso" value={form.role} onChange={(e) => set('role', e.target.value)}
          options={[
            { value: 'admin', label: 'Admin — Control total del workspace' },
            { value: 'editor', label: 'Editor — Crear y editar contenido' },
            { value: 'viewer', label: 'Lectura — Solo visualizar' },
          ]} />
        <div className="rounded-md bg-tint border border-zred/15 p-3.5 flex items-start gap-3">
          <div className="size-8 rounded-full bg-zred text-white flex items-center justify-center shrink-0">
            <Ic.Mail width="15" height="15"/>
          </div>
          <div className="text-[12.5px] text-carbon leading-snug">
            <div className="font-bold mb-0.5">Invitación por email</div>
            <div className="text-muted">El usuario recibirá un correo para crear su contraseña. El registro público está deshabilitado.</div>
          </div>
        </div>
      </div>
    </Modal>
  );
}


export function PreferencesDrawer({ open, onClose, dark, onToggleDark }: any) {
  if (!open) return null
  return <PreferencesContent key="prefs" onClose={onClose} dark={dark} onToggleDark={onToggleDark} />
}

function PreferencesContent({ onClose, dark, onToggleDark }: any) {
  const [density, setDensity] = useState(() => {
    try { return localStorage.getItem('zivelo-density') || 'default'; } catch { return 'default'; }
  });

  function changeDensity(v) {
    setDensity(v);
    try { localStorage.setItem('zivelo-density', v); } catch {}
    document.documentElement.setAttribute('data-density', v);
  }

  return (
    <Drawer open={true} onClose={onClose} title="Preferencias" width={420}
      footer={<Button variant="ghost" size="sm" onClick={onClose}>Cerrar</Button>}>
      <div className="px-6 py-5 space-y-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-3">Apariencia</div>
          <div className="rounded-md border border-line2 p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="font-semibold text-[13.5px]">Tema oscuro</div>
              <button type="button" onClick={onToggleDark} aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                className={`inline-flex items-center w-10 h-6 rounded-full transition-colors ${dark ? 'bg-zred' : 'bg-soft border border-line'}`}>
                <span className={`size-5 rounded-full bg-white transition-transform shadow-sm ${dark ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <p className="text-[12px] text-muted">{dark ? 'Modo oscuro activo' : 'Modo claro activo'}</p>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-3">Densidad de interfaz</div>
          <div className="space-y-2">
            {DENSITIES.map(d => (
              <button type="button" key={d.id} onClick={() => changeDensity(d.id)}
                className={`w-full text-left p-3.5 rounded-md border transition-all ${density === d.id ? 'border-zred bg-tint' : 'border-line hover:border-zred/40'}`}>
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-[13.5px]">{d.label}</div>
                  {density === d.id && <span className="size-5 rounded-full bg-zred text-white inline-flex items-center justify-center"><Ic.Check width="11" height="11"/></span>}
                </div>
                <div className="text-[12px] text-muted mt-0.5">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export function FiltersDrawer({ open, onClose, context = 'kanban', value, onChange, onApply, onReset, profiles = [] }: any) {
  if (!open) return null
  const tagKeys = Object.keys(TAG_STYLES)

  return (
    <Drawer open={open} onClose={onClose} title="Filtros avanzados" width={420}
      footer={
        <div className="flex justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => { onReset() }}>Limpiar</Button>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={() => { onApply(); onClose() }}>Aplicar filtros</Button>
          </div>
        </div>
      }>
      <div className="px-6 py-5 space-y-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">Asignados a</div>
          <div className="flex flex-wrap gap-2">
            {profiles.map(u => {
              const on = value.assignees.includes(u.id)
              return (
                <button type="button" key={u.id} onClick={() => onChange({ ...value, assignees: toggle(value.assignees, u.id) })}
                  className={`flex items-center gap-2 pl-1 pr-3 h-9 rounded-full border transition-all ${on ? 'bg-carbon text-white border-carbon' : 'bg-white border-line hover:border-zred/40'}`}>
                  <Avatar user={u} size={26} />
                  <span className="text-[12.5px] font-semibold">{u.name.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>
        </div>

        {context === 'kanban' && (
          <>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">Etiquetas</div>
              <div className="flex flex-wrap gap-2">
                {tagKeys.map(k => {
                  const on = value.tags.includes(k)
                  return (
                    <button type="button" key={k} onClick={() => onChange({ ...value, tags: toggle(value.tags, k) })}
                      className={`px-3 h-8 rounded-full border text-[12.5px] font-semibold transition-all ${on ? 'bg-carbon text-white border-carbon' : 'bg-white text-carbon border-line hover:border-zred/40'}`}>
                      {TAG_STYLES[k].label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">Prioridad</div>
              <div className="flex gap-2">
                {Object.keys(PRIORITY).map(k => {
                  const on = value.priorities.includes(k)
                  const p = PRIORITY[k]
                  return (
                    <button type="button" key={k} onClick={() => onChange({ ...value, priorities: toggle(value.priorities, k) })}
                      className={`inline-flex items-center gap-2 px-3 h-9 rounded-full border text-[12.5px] font-semibold transition-all ${on ? 'bg-carbon text-white border-carbon' : 'bg-white text-carbon border-line hover:border-zred/40'}`}>
                      <span className={`size-1.5 rounded-full ${p.dot}`} />
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">Vencimiento</div>
              <div className="flex flex-wrap gap-2">
                {[{ k: 'all', l: 'Cualquier fecha' }, { k: 'overdue', l: 'Atrasadas' }, { k: 'today', l: 'Hoy' }, { k: 'week', l: 'Esta semana' }, { k: 'none', l: 'Sin fecha' }].map(o => (
                  <button type="button" key={o.k} onClick={() => onChange({ ...value, due: o.k })}
                    className={`px-3 h-9 rounded-full border text-[12.5px] font-semibold transition-all ${value.due === o.k ? 'bg-carbon text-white border-carbon' : 'bg-white text-carbon border-line hover:border-zred/40'}`}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">Ordenar por</div>
          <Select value={value.sort} onChange={(e) => onChange({ ...value, sort: e.target.value })}
            options={[
              { value: 'recent', label: 'Más recientes' },
              { value: 'due', label: 'Por fecha de entrega' },
              { value: 'priority', label: 'Por prioridad' },
              { value: 'alpha', label: 'Alfabético' },
            ]} />
        </div>
      </div>
    </Drawer>
  )
}

const KEYBOARD_SHORTCUTS = [
  {
    title: 'Navegación',
    items: [
      { keys: ['⌘', 'K'], label: 'Abrir búsqueda rápida' },
      { keys: ['⌘', '/'], label: 'Mostrar atajos de teclado' },
      { keys: ['?'], label: 'Mostrar atajos de teclado' },
      { keys: ['Esc'], label: 'Cerrar modal o panel lateral' },
    ],
  },
  {
    title: 'General',
    items: [
      { keys: ['⌘', ','], label: 'Abrir preferencias' },
      { keys: ['⌘', 'P'], label: 'Ver mi perfil' },
    ],
  },
  {
    title: 'Kanban',
    items: [
      { keys: ['↑', '↓'], label: 'Navegar entre tareas' },
      { keys: ['↵'], label: 'Abrir detalle de tarea' },
      { keys: ['Esc'], label: 'Cerrar detalle de tarea' },
    ],
  },
  {
    title: 'Búsqueda',
    items: [
      { keys: ['↑', '↓'], label: 'Navegar resultados' },
      { keys: ['↵'], label: 'Ir al resultado seleccionado' },
      { keys: ['Esc'], label: 'Cerrar búsqueda' },
    ],
  },
]

export function KeyboardShortcutsModal({ open, onClose }: any) {
  return (
    <Modal open={open} onClose={onClose} title="Atajos de teclado" width={560}>
      <div className="space-y-5">
        {KEYBOARD_SHORTCUTS.map(section => (
          <div key={section.title}>
            <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted mb-2 px-1">{section.title}</div>
            <div className="bg-soft/50 rounded-lg overflow-hidden divide-y divide-line2">
              {section.items.map(item => (
                <div key={item.label} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[13.5px] text-carbon">{item.label}</span>
                  <div className="flex items-center gap-1">
                    {item.keys.map(k => (
                      <kbd key={k}
                        className="font-mono text-[11px] text-carbon bg-white border border-line2 shadow-soft rounded px-2 py-0.5 min-w-[28px] text-center">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-line2 text-[12px] text-muted text-center">
        Más atajos disponibles próximamente
      </div>
    </Modal>
  )
}
