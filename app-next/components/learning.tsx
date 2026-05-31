'use client'

import { useState, useReducer, useMemo } from 'react'
import { Ic } from '@/components/icons'
import { Avatar, AvatarStack, Badge, Button, Modal, Input, Select, Textarea } from '@/components/ui'
import { ConfirmDialog } from '@/components/modals'
import { LEARNING_COLS, LEARNING_RESOURCE, formatDate, daysUntil } from '@/lib/constants'
import type { LearningTask, LearningResourceType } from '@/lib/supabase/types'

// ─── Resource type icon ────────────────────────────────────────────────────────

function ResourceIcon({ type, size = 16 }: { type: LearningResourceType; size?: number }) {
  const s = { width: size, height: size }
  if (type === 'video')   return <Ic.Arrow {...s} />
  if (type === 'course')  return <Ic.Sparkle {...s} />
  if (type === 'article') return <Ic.Search {...s} />
  if (type === 'book')    return <Ic.Folder {...s} />
  if (type === 'podcast') return <Ic.Bell {...s} />
  return <Ic.Folder {...s} />
}

// ─── Per-member progress ──────────────────────────────────────────────────────

const PROG_COLOR: Record<string, string> = {
  todo:     '#D1D1CE',
  progress: '#E0B84A',
  done:     '#3CB371',
}
const PROG_STATUS = [
  { value: 'todo',     label: 'Pendiente',  color: '#9B9B98' },
  { value: 'progress', label: 'En curso',   color: '#E0B84A' },
  { value: 'done',     label: 'Completado', color: '#3CB371' },
]

const COL_COLORS: Record<string, string> = {
  todo: '#6B6B6B', progress: '#3A47B5', done: '#1E6B3C',
}

function LearningProgressStack({ members, progress }: { members: any[]; progress: Record<string, string> }) {
  const doneCount = members.filter(u => progress?.[u.id] === 'done').length
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {members.slice(0, 3).map((u, i) => (
          <div key={u.id} className={i > 0 ? '-ml-1.5' : ''} style={{ borderRadius: '50%', border: `2px solid ${PROG_COLOR[progress?.[u.id] || 'todo']}` }}>
            <Avatar user={u} size={22} />
          </div>
        ))}
        {members.length > 3 && <span className="text-[10px] text-muted ml-2">+{members.length - 3}</span>}
      </div>
      {members.length > 1 && (
        <span className="text-[10.5px] text-muted font-medium">{doneCount}/{members.length}</span>
      )}
    </div>
  )
}

// ─── Learning Card ─────────────────────────────────────────────────────────────

function LearningCard({ task, onClick, onDragStart, onDragEnd, dragging, profiles = [] }: any) {
  const res = LEARNING_RESOURCE[task.type]
  const assignees = task.assignee.flatMap((id: string) => { const m = profiles.find(u => u.id === id); return m ? [m] : [] })
  const days = task.due ? daysUntil(task.due) : null
  const overdue = days !== null && days < 0 && task.col !== 'done'

  return (
    <button
      type="button"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`bg-white border border-line2 rounded-lg p-4 cursor-pointer select-none transition-all hover:-translate-y-0.5 hover:shadow-card hover:border-zred/20 text-left w-full ${dragging ? 'dragging' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <Badge className={res.cls}>
          <ResourceIcon type={task.type} size={11} />
          {res.label}
        </Badge>
        {task.col !== 'done' && task.url && (
          <a
            href={task.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="size-7 rounded-full border border-line2 hover:border-zred hover:text-zred inline-flex items-center justify-center text-muted transition-colors shrink-0"
            title="Abrir recurso"
          >
            <Ic.Arrow width="13" height="13" />
          </a>
        )}
      </div>

      <h3 className="text-[13.5px] font-semibold text-carbon leading-snug mb-1.5 line-clamp-2">{task.title}</h3>

      {task.description && (
        <p className="text-[12px] text-muted leading-relaxed mb-3 line-clamp-2">{task.description}</p>
      )}

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((t: string) => (
            <span key={t} className="text-[10.5px] font-medium bg-soft text-muted px-2 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <LearningProgressStack members={assignees} progress={task.progress} />
        <div className="flex items-center gap-2">
          {task.duration && (
            <span className="flex items-center gap-1 text-[11px] text-muted">
              <Ic.Clock width="12" height="12" />
              {task.duration}
            </span>
          )}
          {task.due && (
            <span className={`text-[11px] font-semibold ${overdue ? 'text-zred' : 'text-muted'}`}>
              {overdue ? `Venció hace ${Math.abs(days!)} d` : days === 0 ? 'Hoy' : `${days} d`}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Task Detail Modal ─────────────────────────────────────────────────────────

const RESOURCE_OPTIONS: { value: LearningResourceType; label: string }[] = [
  { value: 'video',   label: 'Video' },
  { value: 'course',  label: 'Curso' },
  { value: 'article', label: 'Artículo' },
  { value: 'book',    label: 'Libro' },
]

function LearningDetailModal({ task, open, onClose, onUpdate, onDelete, profiles = [] }: any) {
  const [edit, setEdit] = useState({ ...task })
  const [saved, setSaved] = useState(false)
  const set = (k: string, v: any) => setEdit((f: any) => ({ ...f, [k]: v }))

  // edit state is reset via key={task.id} on parent

  function save() {
    const prog = edit.progress || {}
    const allDone = edit.assignee?.length > 0 && edit.assignee.every((id: string) => prog[id] === 'done')
    onUpdate({ ...edit, ...(allDone ? { col: 'done' } : {}) })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const res = LEARNING_RESOURCE[edit.type as LearningResourceType]
  const assignees = edit.assignee.flatMap((id: string) => { const m = profiles.find(u => u.id === id); return m ? [m] : [] })

  return (
    <Modal open={open} onClose={onClose} title="Detalle del recurso" width={560}
      footer={
        <div className="flex items-center justify-between gap-2 w-full">
          <Button variant="danger" size="sm" onClick={() => { onDelete(task.id); onClose() }}>
            <Ic.Trash width="14" height="14" /> Eliminar
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={save}>
              {saved ? 'Guardado ✓' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
      }>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className={res.cls}><ResourceIcon type={edit.type} size={11} />{res.label}</Badge>
        </div>

        <Input label="Título" value={edit.title} onChange={(e: any) => set('title', e.target.value)} />

        <Textarea label="Descripción" value={edit.description} onChange={(e: any) => set('description', e.target.value)} rows={3} />

        <div>
          <span className="block text-[12px] font-semibold text-carbon mb-1.5 uppercase tracking-wider">URL del recurso</span>
          <div className="flex gap-2">
            <input
              type="url"
              value={edit.url}
              onChange={(e: any) => set('url', e.target.value)}
              placeholder="https://..."
              aria-label="URL del recurso"
              className="flex-1 h-11 px-4 rounded-md border border-line bg-white text-[14px] placeholder:text-muted/70 transition-all font-mono text-[13px]"
            />
            {edit.url && (
              <a href={edit.url} target="_blank" rel="noopener noreferrer"
                className="h-11 px-4 rounded-md border border-line bg-white hover:border-zred hover:text-zred inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted transition-colors shrink-0">
                <Ic.Arrow width="14" height="14" /> Abrir
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Tipo de recurso" value={edit.type} onChange={(e: any) => set('type', e.target.value)}
            options={RESOURCE_OPTIONS} />
          <div>
            <span className="block text-[12px] font-semibold text-carbon mb-1.5 uppercase tracking-wider">Estado</span>
            <select value={edit.col} onChange={(e: any) => set('col', e.target.value)}
              className="w-full h-11 px-4 rounded-md border border-line bg-white text-[14px] transition-all appearance-none">
              {LEARNING_COLS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Duración estimada" placeholder="Ej: 2 h, 45 min" value={edit.duration}
            onChange={(e: any) => set('duration', e.target.value)} />
          <div>
            <span className="block text-[12px] font-semibold text-carbon mb-1.5 uppercase tracking-wider">Fecha límite</span>
            <input type="date" value={edit.due || ''} onChange={(e: any) => set('due', e.target.value || null)}
              aria-label="Fecha límite"
              className="w-full h-11 px-4 rounded-md border border-line bg-white text-[14px] transition-all" />
          </div>
        </div>

        <div>
          <span className="block text-[12px] font-semibold text-carbon mb-2 uppercase tracking-wider">Asignados</span>
          <div className="flex flex-wrap gap-2">
            {profiles.map(u => {
              if (u.status !== 'active') return null
              const on = edit.assignee.includes(u.id)
              return (
                <button key={u.id} type="button"
                  onClick={() => set('assignee', on ? edit.assignee.filter((x: string) => x !== u.id) : [...edit.assignee, u.id])}
                  className={`flex items-center gap-2 px-3 h-8 rounded-full border text-[12.5px] font-medium transition-all ${
                    on ? 'bg-carbon text-white border-carbon' : 'border-line hover:border-zred/40 text-carbon'
                  }`}>
                  <Avatar user={u} size={18} />
                  {u.name.split(' ')[0]}
                </button>
              )
            })}
          </div>
        </div>

        {edit.assignee.length > 0 && (
          <div>
            <span className="block text-[12px] font-semibold text-carbon mb-2 uppercase tracking-wider">Progreso por persona</span>
            <div className="space-y-2">
              {edit.assignee.map((uid: string) => {
                const u = profiles.find(m => m.id === uid)
                if (!u) return null
                const status = edit.progress?.[uid] || 'todo'
                return (
                  <div key={uid} className="flex items-center gap-3">
                    <Avatar user={u} size={28} />
                    <span className="text-[13px] font-medium flex-1 min-w-0 truncate">{u.name.split(' ')[0]}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {PROG_STATUS.map(s => (
                        <button type="button" key={s.value} onClick={() => set('progress', { ...(edit.progress || {}), [uid]: s.value })}
                          title={s.label}
                          className={`px-2.5 h-7 rounded-full text-[11px] font-semibold border transition-all ${
                            status === s.value ? 'text-white border-transparent' : 'bg-white border-line text-muted hover:border-line2'
                          }`}
                          style={status === s.value ? { background: s.color, borderColor: s.color } : undefined}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ─── New Task Modal ────────────────────────────────────────────────────────────

const EMPTY_FORM = (): Omit<LearningTask, 'id'> => ({
  col: 'todo', title: '', description: '', url: '',
  type: 'video', assignee: [], due: null, duration: '', tags: [], progress: {},
})

function NewLearningModal({ open, onClose, onCreate, profiles = [] }: any) {
  const [form, setForm] = useState(() => EMPTY_FORM())
  const [tagInput, setTagInput] = useState('')
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  // form is reset via key={String(open)} on parent

  function addTag() {
    const t = tagInput.trim()
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t])
    setTagInput('')
  }

  function submit() {
    if (!form.title.trim()) return
    onCreate({ ...form, id: 'l' + Date.now(), title: form.title.trim(), progress: {} })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo recurso de aprendizaje" width={540}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={submit} disabled={!form.title.trim()}>
            <Ic.Plus width="14" height="14" /> Añadir recurso
          </Button>
        </>
      }>
      <div className="space-y-4">
        <Input label="Título" placeholder="¿Qué se va a aprender?" value={form.title}
          onChange={(e: any) => set('title', e.target.value)} autoFocus />

        <Textarea label="Descripción (opcional)" placeholder="Breve descripción del contenido..."
          value={form.description} onChange={(e: any) => set('description', e.target.value)} rows={2} />

        <div>
          <span className="block text-[12px] font-semibold text-carbon mb-1.5 uppercase tracking-wider">URL del recurso</span>
          <input type="url" value={form.url} onChange={(e: any) => set('url', e.target.value)}
            placeholder="https://..."
            aria-label="URL del recurso"
            className="w-full h-11 px-4 rounded-md border border-line bg-white text-[14px] placeholder:text-muted/70 transition-all font-mono text-[13px]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Tipo" value={form.type} onChange={(e: any) => set('type', e.target.value)}
            options={RESOURCE_OPTIONS} />
          <Input label="Duración" placeholder="Ej: 2 h, 45 min" value={form.duration}
            onChange={(e: any) => set('duration', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="block text-[12px] font-semibold text-carbon mb-1.5 uppercase tracking-wider">Fecha límite</span>
            <input type="date" value={form.due || ''} onChange={(e: any) => set('due', e.target.value || null)}
              aria-label="Fecha límite"
              className="w-full h-11 px-4 rounded-md border border-line bg-white text-[14px] transition-all" />
          </div>
          <div>
            <span className="block text-[12px] font-semibold text-carbon mb-1.5 uppercase tracking-wider">Etiquetas</span>
            <div className="flex gap-1.5">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Ej: Frontend"
                aria-label="Etiqueta"
                className="flex-1 h-11 px-3 rounded-md border border-line bg-white text-[13px] placeholder:text-muted/70 transition-all" />
              <button type="button" onClick={addTag} className="size-11 rounded-md border border-line hover:border-zred hover:text-zred inline-flex items-center justify-center text-muted transition-colors">
                <Ic.Plus width="14" height="14" />
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {form.tags.map(t => (
                  <span key={t} className="text-[11px] bg-soft text-muted px-2 py-0.5 rounded-full flex items-center gap-1">
                    {t}
                    <button type="button" onClick={() => set('tags', form.tags.filter(x => x !== t))} className="hover:text-zred">
                      <Ic.X width="10" height="10" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <span className="block text-[12px] font-semibold text-carbon mb-2 uppercase tracking-wider">Asignar a</span>
          <div className="flex flex-wrap gap-2">
            {profiles.map(u => {
              if (u.status !== 'active') return null
              const on = form.assignee.includes(u.id)
              return (
                <button key={u.id} type="button"
                  onClick={() => set('assignee', on ? form.assignee.filter(x => x !== u.id) : [...form.assignee, u.id])}
                  className={`flex items-center gap-2 px-3 h-8 rounded-full border text-[12.5px] font-medium transition-all ${
                    on ? 'bg-carbon text-white border-carbon' : 'border-line hover:border-zred/40 text-carbon'
                  }`}>
                  <Avatar user={u} size={18} />
                  {u.name.split(' ')[0]}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─── Column ────────────────────────────────────────────────────────────────────

function LearningColumn({ col, tasks, onDrop, onDragOver, onDragLeave, isOver, onCardClick, onCardDragStart, onCardDragEnd, draggingId, onAdd, profiles = [] }: any) {

  return (
    <div
      onDragOver={e => onDragOver(e, col.id)}
      onDragLeave={onDragLeave}
      onDrop={e => onDrop(e, col.id)}
      className={`w-[320px] shrink-0 bg-soft/70 rounded-lg p-3 flex flex-col gap-3 border border-transparent transition-colors ${isOver ? 'drag-over' : ''}`}
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: COL_COLORS[col.id] }} />
          <h3 className="text-[13px] font-bold tracking-tight">{col.title}</h3>
          <span className="inline-flex items-center justify-center min-w-[22px] h-[20px] px-1.5 rounded-full bg-white border border-line2 text-[11px] font-bold nums">{tasks.length}</span>
        </div>
        <button type="button" onClick={() => onAdd(col.id)} className="size-7 rounded hover:bg-white inline-flex items-center justify-center text-muted hover:text-carbon transition-colors">
          <Ic.Plus width="14" height="14" />
        </button>
      </div>
      <div className="text-[11px] text-muted px-1 -mt-1">{col.hint}</div>

      <div className="flex-1 overflow-y-auto scroll-thin space-y-2 pb-1">
        {tasks.map((t: LearningTask) => (
          <LearningCard
            key={t.id}
            task={t}
            dragging={draggingId === t.id}
            onClick={() => onCardClick(t)}
            onDragStart={() => onCardDragStart(t.id)}
            onDragEnd={onCardDragEnd}
            profiles={profiles}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-8 px-3 border-2 border-dashed border-line rounded-md text-muted">
            <div className="size-8 rounded-full bg-white border border-line2 inline-flex items-center justify-center mb-2">
              <Ic.Plus width="14" height="14" />
            </div>
            <div className="text-[11.5px]">Arrastra recursos aquí</div>
          </div>
        )}
      </div>

      <button type="button" onClick={() => onAdd(col.id)} className="text-[12px] font-semibold text-muted hover:text-zred text-left px-1 py-1.5 transition-colors">
        + Añadir recurso
      </button>
    </div>
  )
}

// ─── Main export ───────────────────────────────────────────────────────────────

type LearningState = {
  draggingId: string | null
  overCol: string | null
  selected: LearningTask | null
  newOpen: boolean
  confirmDelete: string | null
}

type LearningAction =
  | { type: 'DRAG_START'; id: string }
  | { type: 'DRAG_END' }
  | { type: 'DRAG_OVER'; colId: string }
  | { type: 'DRAG_LEAVE' }
  | { type: 'SELECT'; task: LearningTask | null }
  | { type: 'OPEN_NEW' }
  | { type: 'CLOSE_NEW' }
  | { type: 'CONFIRM_DELETE'; id: string | null }

const initialState: LearningState = {
  draggingId: null, overCol: null, selected: null,
  newOpen: false, confirmDelete: null,
}

function learningReducer(state: LearningState, action: LearningAction): LearningState {
  switch (action.type) {
    case 'DRAG_START': return { ...state, draggingId: action.id }
    case 'DRAG_END': return { ...state, draggingId: null, overCol: null }
    case 'DRAG_OVER': return { ...state, overCol: action.colId }
    case 'DRAG_LEAVE': return { ...state, overCol: null }
    case 'SELECT': return { ...state, selected: action.task }
    case 'OPEN_NEW': return { ...state, newOpen: true }
    case 'CLOSE_NEW': return { ...state, newOpen: false }
    case 'CONFIRM_DELETE': return { ...state, confirmDelete: action.id }
  }
}

export default function Learning({ tasks, setTasks, profiles = [] }: { tasks: LearningTask[]; setTasks: (t: LearningTask[]) => void; profiles?: any[] }) {
  const [state, dispatch] = useReducer(learningReducer, initialState)
  const { draggingId, overCol, selected, newOpen, confirmDelete } = state

  const stats = useMemo(() => ({
    total: tasks.length,
    done: tasks.filter(t => t.col === 'done').length,
    inProgress: tasks.filter(t => t.col === 'progress').length,
    hours: tasks.reduce((sum, t) => {
      const m = t.duration.match(/(\d+(?:\.\d+)?)\s*h/)
      const m2 = t.duration.match(/(\d+)\s*min/)
      return sum + (m ? parseFloat(m[1]) : 0) + (m2 ? parseInt(m2[1]) / 60 : 0)
    }, 0),
  }), [tasks])

  function onDragStart(id: string) { dispatch({ type: 'DRAG_START', id }) }
  function onDragEnd() { dispatch({ type: 'DRAG_END' }) }
  function onDragOver(e: React.DragEvent, colId: string) { e.preventDefault(); dispatch({ type: 'DRAG_OVER', colId }) }
  function onDragLeave() { dispatch({ type: 'DRAG_LEAVE' }) }
  function onDrop(e: React.DragEvent, colId: string) {
    e.preventDefault()
    if (!draggingId) return
    setTasks(tasks.map(t => {
      if (t.id !== draggingId) return t
      if (colId === 'done') {
        const prog = { ...t.progress }
        t.assignee.forEach(uid => { prog[uid] = 'done' })
        return { ...t, col: colId as LearningTask['col'], progress: prog }
      }
      return { ...t, col: colId as LearningTask['col'] }
    }))
    dispatch({ type: 'DRAG_END' })
  }

  function handleUpdate(updated: LearningTask) {
    setTasks(tasks.map(t => t.id === updated.id ? updated : t))
    dispatch({ type: 'SELECT', task: updated })
  }

  function handleDelete(id: string) {
    setTasks(tasks.filter(t => t.id !== id))
    dispatch({ type: 'SELECT', task: null })
  }

  function handleCreate(task: LearningTask) {
    setTasks([...tasks, task])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-72px)]">
      {/* Header */}
      <div className="px-8 pt-6 pb-4 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-6">
          {[
            { label: 'Total recursos', value: stats.total },
            { label: 'En curso', value: stats.inProgress, accent: '#3A47B5' },
            { label: 'Completados', value: stats.done, accent: '#1E6B3C' },
            { label: 'Horas de contenido', value: `~${Math.round(stats.hours)} h` },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-[22px] font-extrabold nums leading-none" style={s.accent ? { color: s.accent } : undefined}>{s.value}</div>
              <div className="text-[11px] text-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <Button variant="primary" onClick={() => dispatch({ type: 'OPEN_NEW' })}>
          <Ic.Plus width="15" height="15" /> Nuevo recurso
        </Button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 px-8 pb-6 h-full" style={{ minWidth: 'max-content' }}>
          {LEARNING_COLS.map(col => (
            <LearningColumn
              key={col.id}
              col={col}
              tasks={tasks.filter(t => t.col === col.id)}
              draggingId={draggingId}
              isOver={overCol === col.id}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onCardClick={(t: LearningTask) => dispatch({ type: 'SELECT', task: t })}
              onCardDragStart={onDragStart}
              onCardDragEnd={onDragEnd}
              onAdd={() => dispatch({ type: 'OPEN_NEW' })}
              profiles={profiles}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      {selected && (
        <LearningDetailModal
          key={selected.id}
          task={selected}
          open={!!selected}
          onClose={() => dispatch({ type: 'SELECT', task: null })}
          onUpdate={handleUpdate}
          onDelete={(id: string) => dispatch({ type: 'CONFIRM_DELETE', id })}
          profiles={profiles}
        />
      )}

      <NewLearningModal
        key={String(newOpen)}
        open={newOpen}
        onClose={() => dispatch({ type: 'CLOSE_NEW' })}
        onCreate={handleCreate}
        profiles={profiles}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="¿Eliminar recurso?"
        message="Se eliminará este recurso de aprendizaje del tablero."
        confirmLabel="Eliminar"
        tone="danger"
        onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete); dispatch({ type: 'CONFIRM_DELETE', id: null }) }}
        onCancel={() => dispatch({ type: 'CONFIRM_DELETE', id: null })}
      />
    </div>
  )
}
