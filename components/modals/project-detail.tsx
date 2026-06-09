'use client'

import { useState, useEffect, useRef, useReducer } from 'react'
import Image from 'next/image'
import { Ic } from '@/components/icons'
import { Avatar, Drawer, Button, Badge, ProgressBar, Tag } from '@/components/ui'
import { COLUMNS, STATUS_LABEL, formatDate, formatMoney, daysUntil } from '@/lib/constants'

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
    case 'SET_ACTIVE_TAB':   return { ...state, activeTab: action.tab }
    case 'ADD_FILES':        return { ...state, files: [...state.files, ...action.files] }
    case 'REMOVE_FILE': {
      const f = state.files.find(x => x.id === action.id)
      if (f) URL.revokeObjectURL(f.url)
      return { ...state, files: state.files.filter(x => x.id !== action.id) }
    }
    case 'SET_NOTES':        return { ...state, notes: action.notes }
    case 'SET_DRAGGING':     return { ...state, dragging: action.dragging }
    case 'SET_NOTE_SAVED':   return { ...state, noteSaved: action.saved }
    case 'ADD_LINK':         return { ...state, links: [...state.links, action.link], addingLink: false, newLink: { label: '', url: '' } }
    case 'REMOVE_LINK':      return { ...state, links: state.links.filter(l => l.id !== action.id) }
    case 'SET_ADDING_LINK':  return { ...state, addingLink: action.adding }
    case 'SET_NEW_LINK':     return { ...state, newLink: action.link }
    case 'RESET':            return { activeTab: 'details', files: [], notes: action.notes, dragging: false, noteSaved: false, links: [], addingLink: false, newLink: { label: '', url: '' } }
    default:                 return state
  }
}

export function ProjectDetailDrawer({ open, project, clients, onClose, onEdit, profiles = [], tasks = [] }: any) {
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
  const projectTasks = tasks.filter(t => t.project === project.id)

  function addFiles(fileList: FileList) {
    const added = Array.from(fileList).map(f => ({
      id: 'f' + Date.now() + Math.random().toString(36).slice(2, 5),
      name: f.name, size: f.size, type: f.type,
      url: URL.createObjectURL(f),
      isImage: f.type.startsWith('image/'),
    }))
    dispatch({ type: 'ADD_FILES', files: added })
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
    { id: 'files',   label: files.length > 0 ? `Archivos · ${files.length}` : 'Archivos' },
    { id: 'notes',   label: 'Notas' },
  ]

  return (
    <Drawer open={open} onClose={onClose} title="Detalle del proyecto" width={600}
      footer={
        <div className="flex justify-between gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>Cerrar</Button>
          {onEdit && <Button variant="primary" size="sm" onClick={() => { onClose(); onEdit(project) }}><Ic.Edit width="14" height="14"/> Editar proyecto</Button>}
        </div>
      }>

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
                  <div className="absolute size-3.5 rounded-full border-2 border-white shadow-pop top-1/2 -translate-y-1/2 -translate-x-1/2"
                    style={{ left: `${Math.min(pctTimeline, 97)}%`, background: timelineColor }} />
                </div>
                <div className="text-[10.5px] text-muted mt-2 text-right">{pctTimeline}% del tiempo transcurrido</div>
              </div>
            )
          })()}

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
                    <a href={lk.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
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
              <span className="text-[11.5px] text-muted">{projectTasks.length} totales</span>
            </div>
            {projectTasks.length === 0 ? (
              <div className="rounded-md border border-dashed border-line p-4 text-center text-[13px] text-muted">
                Aún no hay tareas en este proyecto.
              </div>
            ) : (
              <div className="space-y-1.5">
                {projectTasks.slice(0, 6).map(t => {
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
            <div className="text-center py-6 text-[13px] text-muted">Aún no hay archivos adjuntos en este proyecto.</div>
          ) : (
            <>
              {images.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-3">Imágenes · {images.length}</div>
                  <div className="grid grid-cols-3 gap-3">
                    {images.map(f => (
                      <div key={f.id} className="group relative rounded-md overflow-hidden border border-line2 bg-soft" style={{ aspectRatio: '16/10' }}>
                        <Image src={f.url} alt={f.name} fill className="object-cover" unoptimized />
                        <div className="absolute inset-0 bg-carbon/0 group-hover:bg-carbon/45 transition-all" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <button type="button" aria-label="Eliminar imagen"
                            onClick={(e) => { e.stopPropagation(); dispatch({ type: 'REMOVE_FILE', id: f.id }) }}
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
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-3">Documentos · {docs.length}</div>
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
                            onClick={() => dispatch({ type: 'REMOVE_FILE', id: f.id })}
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
