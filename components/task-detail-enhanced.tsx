'use client'

import { useReducer } from 'react'
import { Ic } from '@/components/icons'
import { Drawer, Button, Avatar, Tag } from '@/components/ui'
import { COLUMNS, PRIORITY } from '@/lib/constants'
import { MOCK_PROFILES } from '@/lib/mock-roadmap'

type DetailTab = 'description' | 'subtasks' | 'comments' | 'attachments'

const TABS: { id: DetailTab; label: string; icon: keyof typeof Ic }[] = [
  { id: 'description', label: 'Descripción', icon: 'Edit' },
  { id: 'subtasks', label: 'Subtareas', icon: 'Check' },
  { id: 'comments', label: 'Comentarios', icon: 'Chat' },
  { id: 'attachments', label: 'Adjuntos', icon: 'Folder' },
]

const PROG_STATUS = [
  { value: 'todo', label: 'Por hacer', color: '#A1A1A1' },
  { value: 'progress', label: 'En curso', color: '#E0A800' },
  { value: 'done', label: 'Terminado', color: '#1E6B3C' },
]

function taskDetailReducer(state: any, action: any) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, edit: { ...state.edit, [action.key]: action.value } }
    case 'SET_SAVED':
      return { ...state, saved: action.value }
    case 'SET_NEW_SUBTASK':
      return { ...state, newSubtask: action.value }
    case 'SET_NEW_COMMENT':
      return { ...state, newComment: action.value }
    case 'SET_EDITING_SUB':
      return { ...state, editingSub: action.value }
    case 'TOGGLE_SUB':
      const subs = state.edit.subtasks.map((s: any, i: number) => i === action.idx ? { ...s, d: !s.d } : s)
      return { ...state, edit: { ...state.edit, subtasks: subs } }
    case 'ADD_SUBTASK':
      return { ...state, edit: { ...state.edit, subtasks: [...(state.edit.subtasks || []), { t: action.text.trim(), d: false }] }, newSubtask: '', editingSub: false }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.tab }
    case 'SET_NEW_ATTACHMENT':
      return { ...state, newAttachment: action.value }
    case 'SET_NEW_ATTACHMENT_LABEL':
      return { ...state, newAttachmentLabel: action.value }
    case 'ADD_ATTACHMENT':
      return { ...state, edit: { ...state.edit, attachments: [...(state.edit.attachments || []), { label: action.label, url: action.url }] }, newAttachment: '', newAttachmentLabel: '' }
    case 'REMOVE_ATTACHMENT':
      const atts = state.edit.attachments.filter((_: any, i: number) => i !== action.idx)
      return { ...state, edit: { ...state.edit, attachments: atts } }
    default:
      return state
  }
}

export default function TaskDetailEnhanced({ task, open, onClose, onUpdate }: any) {
  const [state, dispatch] = useReducer(taskDetailReducer, {
    edit: { ...(task || {}), description: task?.description || '', subtasks: task?.subtasks || [], attachments: task?.attachments || [] },
    saved: false,
    activeTab: 'description' as DetailTab,
    newSubtask: '',
    newComment: '',
    newAttachment: '',
    newAttachmentLabel: '',
    editingSub: false,
  })
  if (!task) return null

  const profiles = MOCK_PROFILES

  function save() {
    onUpdate({ ...state.edit })
    dispatch({ type: 'SET_SAVED', value: true })
    setTimeout(() => dispatch({ type: 'SET_SAVED', value: false }), 1500)
  }

  function toggleSub(idx: number) {
    dispatch({ type: 'TOGGLE_SUB', idx })
  }

  function addSubtask() {
    if (!state.newSubtask.trim()) return
    dispatch({ type: 'ADD_SUBTASK', text: state.newSubtask })
  }

  function addAttachment() {
    if (!state.newAttachment.trim()) return
    dispatch({ type: 'ADD_ATTACHMENT', label: state.newAttachmentLabel.trim() || state.newAttachment.trim(), url: state.newAttachment.trim() })
  }

  const activeTab = state.activeTab

  return (
    <Drawer open={open} onClose={onClose} title={task.title || 'Detalle de tarea'} width={580}
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cerrar</Button>
          <Button variant="primary" size="sm" onClick={save}>
            {state.saved ? 'Guardado ✓' : 'Guardar cambios'}
          </Button>
        </div>
      }>
      <div className="px-6 py-5 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          {task.project && (
            <>
              <span className="size-2 rounded-full" style={{ background: '#1D1D1B' }} />
              <span className="text-[12px] font-semibold text-muted">{task.project}</span>
            </>
          )}
          <Tag tag={task.tag} />
        </div>

        <input value={state.edit.title} onChange={(e) => dispatch({ type: 'SET_FIELD', key: 'title', value: e.target.value })}
          aria-label="Título de la tarea"
          className="w-full text-[20px] font-bold tracking-tight leading-snug bg-transparent border-b border-transparent hover:border-line focus:border-zred outline-none transition-colors" />

        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[13px]">
          <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Estado</div>
            <select value={state.edit.col} onChange={(e) => dispatch({ type: 'SET_FIELD', key: 'col', value: e.target.value })}
              className="w-full h-9 px-2.5 rounded-md border border-line text-[13px] bg-white">
              {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Prioridad</div>
            <select value={state.edit.priority} onChange={(e) => dispatch({ type: 'SET_FIELD', key: 'priority', value: e.target.value })}
              className="w-full h-9 px-2.5 rounded-md border border-line text-[13px] bg-white">
              {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Vencimiento</div>
            <input type="date" value={state.edit.due || ''} onChange={(e) => dispatch({ type: 'SET_FIELD', key: 'due', value: e.target.value || null })}
              aria-label="Fecha de vencimiento"
              className="w-full h-9 px-2.5 rounded-md border border-line text-[13px] bg-white" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Asignados</div>
            <div className="flex flex-wrap gap-1">
              {profiles.map(u => {
                const on = state.edit.assignee?.includes(u.id)
                return (
                  <button key={u.id} type="button" onClick={() => dispatch({ type: 'SET_FIELD', key: 'assignee', value: on ? state.edit.assignee.filter((x: string) => x !== u.id) : [...(state.edit.assignee || []), u.id] })}
                    className={`size-7 rounded-full text-[10px] font-bold text-white transition-all ${on ? 'ring-2 ring-offset-1 ring-zred scale-110' : 'opacity-50 hover:opacity-100'}`}
                    style={{ background: u.color }} title={u.name}>
                    {u.initials}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {state.edit.assignee?.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Progreso por persona</div>
            <div className="space-y-2">
              {state.edit.assignee.map((uid: string) => {
                const u = profiles.find(m => m.id === uid)
                if (!u) return null
                const status = state.edit.progress?.[uid] || 'todo'
                return (
                  <div key={uid} className="flex items-center gap-3">
                    <Avatar user={u} size={28} />
                    <span className="text-[13px] font-medium flex-1 min-w-0 truncate">{u.name.split(' ')[0]}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {PROG_STATUS.map(s => (
                        <button type="button" key={s.value} onClick={() => dispatch({ type: 'SET_FIELD', key: 'progress', value: { ...(state.edit.progress || {}), [uid]: s.value } })}
                          title={s.label}
                          className={`px-2.5 h-7 rounded-full text-[11px] font-semibold border transition-all ${status === s.value ? 'text-white border-transparent' : 'bg-white border-line text-muted hover:border-line2'}`}
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

        <div className="flex items-center gap-1 bg-soft rounded-full p-1 w-fit">
          {TABS.map(t => (
            <button type="button" key={t.id}
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: t.id })}
              className={`inline-flex items-center gap-1.5 px-4 h-8 rounded-full text-[12.5px] font-semibold transition-all ${activeTab === t.id ? 'bg-white text-carbon shadow-soft' : 'text-muted hover:text-carbon'}`}>
              <Ic.Edit width="13" height="13" />
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div>
            <textarea value={state.edit.description || ''} onChange={(e) => dispatch({ type: 'SET_FIELD', key: 'description', value: e.target.value })}
              placeholder="Especifica los criterios de aceptación, mockups relevantes y dependencias técnicas."
              aria-label="Descripción de la tarea"
              className="w-full rounded-md border border-line2 p-3 text-[13.5px] text-carbon leading-relaxed bg-transparent resize-none min-h-[180px]" />
          </div>
        )}

        {activeTab === 'subtasks' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-semibold text-muted uppercase tracking-wider">Subtareas</div>
              {!state.editingSub && (
                <button type="button" onClick={() => dispatch({ type: 'SET_EDITING_SUB', value: true })} className="text-[12px] font-semibold text-zred hover:underline">+ Añadir</button>
              )}
            </div>
            {state.editingSub && (
              <div className="flex items-center gap-2 mb-2">
                <input value={state.newSubtask} onChange={(e) => dispatch({ type: 'SET_NEW_SUBTASK', value: e.target.value })}
                  onKeyDown={(e: any) => e.key === 'Enter' && addSubtask()}
                  placeholder="Nombre de la subtarea..."
                  aria-label="Nueva subtarea"
                  className="flex-1 h-9 px-3 rounded-md border border-line text-[13px] bg-white outline-none focus:border-zred" />
                <button type="button" onClick={addSubtask} className="size-9 rounded-md bg-zred text-white flex items-center justify-center hover:bg-zred2 transition-colors" aria-label="Confirmar subtarea">
                  <Ic.Check width="14" height="14" />
                </button>
                <button type="button" onClick={() => { dispatch({ type: 'SET_EDITING_SUB', value: false }); dispatch({ type: 'SET_NEW_SUBTASK', value: '' }) }} className="size-9 rounded-md border border-line flex items-center justify-center text-muted hover:text-carbon" aria-label="Cancelar">
                  <Ic.X width="14" height="14" />
                </button>
              </div>
            )}
            {(!state.edit.subtasks || state.edit.subtasks.length === 0) ? (
              <div className="text-[13px] text-muted">Sin subtareas aún.</div>
            ) : (
              <div className="space-y-1">
                {state.edit.subtasks.map((s: any, i: number) => (
                  <button type="button" key={`${s.t}-${i}`} onClick={() => toggleSub(i)} className="w-full flex items-center gap-3 p-2 rounded hover:bg-soft text-left">
                    <span className={`size-[18px] rounded border flex items-center justify-center transition-colors ${s.d ? 'bg-zred border-zred text-white' : 'border-line bg-white'}`}>
                      {s.d && <Ic.Check width="12" height="12" />}
                    </span>
                    <span className={`text-[13.5px] ${s.d ? 'line-through text-muted' : 'text-carbon'}`}>{s.t}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div>
            <div className="space-y-3 text-[13px] mb-3">
              {(task.comments || []).map((c: any) => {
                const user = profiles.find(u => u.id === c.userId)
                return (
                  <div key={c.id} className="flex items-start gap-3">
                    <Avatar user={user} size={26} />
                    <div className="flex-1 bg-soft rounded-md p-3">
                      <div className="text-[12px] text-muted mb-1">
                        <span className="font-semibold text-carbon">{user?.name?.split(' ')[0] || 'Usuario'}</span>
                        {' · '}{new Date(c.timestamp).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div>{c.text}</div>
                    </div>
                  </div>
                )
              })}
              {(task.comments || []).length === 0 && (
                <div className="text-[13px] text-muted text-center py-4">Sin comentarios aún.</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input value={state.newComment} onChange={(e) => dispatch({ type: 'SET_NEW_COMMENT', value: e.target.value })}
                placeholder="Escribe un comentario..."
                aria-label="Nuevo comentario"
                onKeyDown={(e: any) => e.key === 'Enter' && (() => { if (!state.newComment.trim()) return; dispatch({ type: 'SET_NEW_COMMENT', value: '' }) })()}
                className="flex-1 h-10 px-3.5 rounded-full bg-soft border border-transparent text-[13px] outline-none focus:border-zred/30" />
              <button type="button" disabled={!state.newComment.trim()}
                className="size-10 rounded-full bg-zred text-white flex items-center justify-center disabled:opacity-50 hover:bg-zred2 transition-colors" aria-label="Enviar comentario">
                <Ic.Arrow width="14" height="14" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'attachments' && (
          <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Archivos adjuntos</div>

            {(state.edit.attachments || []).length > 0 ? (
              <div className="space-y-2 mb-4">
                {(state.edit.attachments || []).map((a: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-md border border-line2 bg-white">
                    <Ic.Folder width="16" height="16" className="text-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <a href={a.url} target="_blank" rel="noopener noreferrer"
                        className="text-[13px] font-semibold text-zred hover:underline truncate block">{a.label}</a>
                      <span className="text-[11px] text-muted truncate block">{a.url}</span>
                    </div>
                    <button type="button" onClick={() => dispatch({ type: 'REMOVE_ATTACHMENT', idx: i })}
                      className="size-7 rounded hover:bg-soft flex items-center justify-center text-muted hover:text-zred transition-colors">
                      <Ic.X width="13" height="13" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[13px] text-muted text-center py-4">Sin archivos adjuntos.</div>
            )}

            <div className="flex items-center gap-2">
              <input value={state.newAttachmentLabel} onChange={(e) => dispatch({ type: 'SET_NEW_ATTACHMENT_LABEL', value: e.target.value })}
                placeholder="Nombre (opcional)..."
                aria-label="Nombre del adjunto"
                className="flex-1 h-9 px-3 rounded-md border border-line text-[13px] bg-white outline-none focus:border-zred" />
              <input value={state.newAttachment} onChange={(e) => dispatch({ type: 'SET_NEW_ATTACHMENT', value: e.target.value })}
                placeholder="URL..."
                aria-label="URL del adjunto"
                onKeyDown={(e: any) => e.key === 'Enter' && addAttachment()}
                className="flex-[2] h-9 px-3 rounded-md border border-line text-[13px] bg-white outline-none focus:border-zred" />
              <button type="button" onClick={addAttachment} disabled={!state.newAttachment.trim()}
                className="size-9 rounded-md bg-zred text-white flex items-center justify-center disabled:opacity-50 hover:bg-zred2 transition-colors shrink-0" aria-label="Agregar adjunto">
                <Ic.Plus width="14" height="14" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  )
}
