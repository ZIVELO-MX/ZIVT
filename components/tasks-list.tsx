'use client'

import { useState, useMemo, useReducer, useRef, useEffect } from 'react'
import { Ic } from '@/components/icons'
import { Button, Avatar, Badge, Tag, Skeleton } from './ui'
import { COLUMNS, PRIORITY, daysUntil } from '@/lib/constants'
import { updateTask } from '@/lib/supabase/queries'
import { FiltersDrawer } from './modals'
import { ExportButton } from './export-modal'

const SORT_OPTIONS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'due', label: 'Por fecha' },
  { value: 'priority', label: 'Por prioridad' },
  { value: 'alpha', label: 'Alfabético' },
]

const INIT = {
  search: '',
  projectFilter: 'all',
  filtersOpen: false,
  filters: { assignees: [] as string[], tags: [] as string[], priorities: [] as string[], due: 'all', sort: 'recent' },
  draft: { assignees: [] as string[], tags: [] as string[], priorities: [] as string[], due: 'all', sort: 'recent' },
  sortKey: '' as string,
  sortDir: 'asc' as 'asc' | 'desc',
  editingStatus: null as string | null,
  editingAssignee: null as string | null,
}

function reducer(state: any, action: any) {
  switch (action.type) {
    case 'SET_SEARCH': return { ...state, search: action.value }
    case 'SET_PROJECT_FILTER': return { ...state, projectFilter: action.value }
    case 'SET_FILTERS_OPEN': return { ...state, filtersOpen: action.value }
    case 'SET_FILTERS': return { ...state, filters: action.value }
    case 'SET_DRAFT': return { ...state, draft: action.value }
    case 'SET_SORT': return { ...state, sortKey: action.key, sortDir: action.dir }
    case 'EDIT_STATUS': return { ...state, editingStatus: action.value, editingAssignee: null }
    case 'EDIT_ASSIGNEE': return { ...state, editingAssignee: action.value, editingStatus: null }
    case 'CLEAR_EDITING': return { ...state, editingStatus: null, editingAssignee: null }
    default: return state
  }
}

export default function TaskList({ tasks, setTasks, projects, profiles = [], loading, onOpenTask }: any) {
  const [state, dispatch] = useReducer(reducer, INIT)
  const listRef = useRef(tasks)
  useEffect(() => { listRef.current = tasks }, [tasks])

  const activeFilterCount = state.filters.assignees.length + state.filters.tags.length + state.filters.priorities.length + (state.filters.due !== 'all' ? 1 : 0)

  const filtered = useMemo(() => {
    let result = tasks.filter(t => {
      if (state.projectFilter !== 'all' && t.project !== state.projectFilter) return false
      if (state.search && !t.title.toLowerCase().includes(state.search.toLowerCase())) return false
      if (state.filters.assignees.length > 0 && !t.assignee.some(a => state.filters.assignees.includes(a))) return false
      if (state.filters.tags.length > 0 && !state.filters.tags.includes(t.tag)) return false
      if (state.filters.priorities.length > 0 && !state.filters.priorities.includes(t.priority)) return false
      if (state.filters.due !== 'all') {
        const days = t.due ? daysUntil(t.due) : null
        if (state.filters.due === 'none' && t.due) return false
        if (state.filters.due === 'overdue' && (!t.due || days >= 0 || t.col === 'done')) return false
        if (state.filters.due === 'today' && days !== 0) return false
        if (state.filters.due === 'week' && (days === null || days < 0 || days > 7)) return false
      }
      return true
    })

    if (state.sortKey) {
      result.sort((a, b) => {
        let cmp = 0
        if (state.sortKey === 'title') cmp = a.title.localeCompare(b.title)
        else if (state.sortKey === 'project') cmp = (projects.find(p => p.id === a.project)?.name || '').localeCompare(projects.find(p => p.id === b.project)?.name || '')
        else if (state.sortKey === 'col') cmp = a.col.localeCompare(b.col)
        else if (state.sortKey === 'priority') { const order = { high: 0, med: 1, low: 2 }; cmp = (order[a.priority] ?? 1) - (order[b.priority] ?? 1) }
        else if (state.sortKey === 'due') cmp = (a.due || '9999-99-99').localeCompare(b.due || '9999-99-99')
        else if (state.sortKey === 'assignee') cmp = (a.assignee?.[0] || '').localeCompare(b.assignee?.[0] || '')
        else if (state.sortKey === 'tag') cmp = a.tag.localeCompare(b.tag)
        return state.sortDir === 'asc' ? cmp : -cmp
      })
    } else if (state.filters.sort === 'due') {
      result.sort((a, b) => (a.due || '9999-99-99').localeCompare(b.due || '9999-99-99'))
    } else if (state.filters.sort === 'priority') {
      const order = { high: 0, med: 1, low: 2 }; result.sort((a, b) => (order[a.priority] ?? 1) - (order[b.priority] ?? 1))
    } else if (state.filters.sort === 'alpha') {
      result.sort((a, b) => a.title.localeCompare(b.title))
    } else {
      result.sort((a, b) => b.id.localeCompare(a.id))
    }
    return result
  }, [tasks, state.search, state.projectFilter, state.filters, state.sortKey, state.sortDir, projects])

  function toggleSort(key: string) {
    if (state.sortKey === key) {
      dispatch({ type: 'SET_SORT', key, dir: state.sortDir === 'asc' ? 'desc' : 'asc' })
    } else {
      dispatch({ type: 'SET_SORT', key, dir: 'asc' })
    }
  }

  function SortIcon({ col }: any) {
    if (state.sortKey !== col) return null
    return (
      <span className="inline-block ml-1">
        {state.sortDir === 'asc' ? <Ic.Up width="12" height="12" /> : <Ic.Down width="12" height="12" />}
      </span>
    )
  }

  async function updateField(taskId: string, field: string, value: any) {
    const snapshot = listRef.current
    setTasks((prev: any[]) => prev.map(t => t.id === taskId ? { ...t, [field]: value } : t))
    dispatch({ type: 'CLEAR_EDITING' })
    try {
      await updateTask(taskId, { [field]: value })
    } catch {
      setTasks(snapshot)
    }
  }

  const columns = [
    { key: 'title', label: 'Título', sortable: true, hideMobile: false },
    { key: 'project', label: 'Proyecto', sortable: true, hideMobile: true },
    { key: 'col', label: 'Estado', sortable: true, hideMobile: false },
    { key: 'tag', label: 'Etiqueta', sortable: true, hideMobile: true },
    { key: 'priority', label: 'Prioridad', sortable: true, hideMobile: true },
    { key: 'assignee', label: 'Asignados', sortable: true, hideMobile: true },
    { key: 'due', label: 'Vence', sortable: true, hideMobile: false },
  ]

  function StatusSelect({ task, onClose }: any) {
    const [val, setVal] = useState(task.col)
    return (
      <div className="relative">
        <select value={val} onChange={(e) => setVal(e.target.value)}
          onBlur={() => { updateField(task.id, 'col', val); onClose() }}
          autoFocus
          className="h-8 px-2 rounded border border-line text-[12px] bg-white outline-none focus:border-zred min-w-[100px]"
        >
          {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>
    )
  }

  function AssigneePicker({ task, onClose }: any) {
    function toggle(uid: string) {
      const next = task.assignee.includes(uid)
        ? task.assignee.filter((x: string) => x !== uid)
        : [...task.assignee, uid]
      updateField(task.id, 'assignee', next)
    }
    return (
      <div className="flex flex-wrap gap-1 p-2 bg-white border border-line rounded-md shadow-pop min-w-[180px]" onMouseLeave={onClose}>
        {profiles.map(u => {
          const on = task.assignee.includes(u.id)
          return (
            <button key={u.id} type="button" onClick={() => toggle(u.id)}
              className={`flex items-center gap-1.5 px-2 h-7 rounded-full text-[11px] font-semibold border transition-all ${on ? 'bg-carbon text-white border-carbon' : 'bg-white text-carbon border-line hover:border-zred/40'}`}>
              <Avatar user={u} size={18} />
              {u.name.split(' ')[0]}
            </button>
          )
        })}
      </div>
    )
  }

  const colStyles: Record<string, string> = {
    todo: 'bg-[#F0F0EE] text-[#6B6B6B]',
    progress: 'bg-[#EEF0FF] text-[#3A47B5]',
    review: 'bg-[#FFF4DE] text-[#7A5A12]',
    done: 'bg-[#ECFDF3] text-[#1E6B3C]',
    blocked: 'bg-[#FFE8E8] text-[#B53A3A]',
  }

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-4 md:py-6 space-y-4" style={{minHeight:'calc(100vh - 72px)'}}>
        <div className="flex items-center gap-3">
          <Skeleton variant="text" className="h-10 w-72 !rounded-full" />
          <Skeleton variant="text" className="h-10 w-96 !rounded-full" />
        </div>
        <div className="bg-white border border-line rounded-lg overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="table-row" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 py-4 md:py-6 flex flex-col" style={{minHeight:'calc(100vh - 72px)'}}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 md:mb-5">
        <div className="flex items-center gap-2 h-10 px-4 rounded-full bg-white border border-line w-full max-w-[320px]">
          <Ic.Search width="15" height="15" className="text-muted"/>
          <input value={state.search} onChange={(e) => dispatch({ type: 'SET_SEARCH', value: e.target.value })}
            placeholder="Buscar tarea..." aria-label="Buscar tarea"
            className="bg-transparent outline-none text-[13.5px] flex-1" />
        </div>

        <div className="flex items-center gap-1 bg-white border border-line rounded-full p-1 overflow-x-auto no-scrollbar max-w-[calc(100vw-6rem)]">
          <button type="button" onClick={() => dispatch({ type: 'SET_PROJECT_FILTER', value: 'all' })}
            className={`px-3 h-8 rounded-full text-[12.5px] font-semibold ${state.projectFilter === 'all' ? 'bg-carbon text-white' : 'text-muted hover:text-carbon'}`}>Todos</button>
          {projects.slice(0, 4).map(p => (
            <button type="button" key={p.id} onClick={() => dispatch({ type: 'SET_PROJECT_FILTER', value: p.id })}
              className={`px-3 h-8 rounded-full text-[12.5px] font-semibold flex items-center gap-1.5 ${state.projectFilter === p.id ? 'bg-carbon text-white' : 'text-muted hover:text-carbon'}`}>
              <span className="size-1.5 rounded-full" style={{ background: p.accent }} />
              {p.name.split('—')[0].trim()}
            </button>
          ))}
        </div>

        <div className="hidden md:flex flex-1" />

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" onClick={() => { dispatch({ type: 'SET_DRAFT', value: state.filters }); dispatch({ type: 'SET_FILTERS_OPEN', value: true }) }}>
            <Ic.Filter width="14" height="14" /> <span className="hidden md:inline">Filtros</span>
            {activeFilterCount > 0 && <span className="ml-1 px-1.5 rounded-full bg-zred text-white text-[10.5px] font-bold nums">{activeFilterCount}</span>}
          </Button>
          <ExportButton data={filtered} projects={projects} profiles={profiles} filename="tareas" viewName="tareas" />
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white border border-line rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line2 bg-soft/50">
                {columns.map(col => (
                  <th key={col.key}
                    onClick={() => col.sortable && toggleSort(col.key)}
                    className={`${col.sortable ? 'cursor-pointer hover:bg-soft' : ''} px-4 h-11 text-[11px] font-bold uppercase tracking-wider text-muted text-left whitespace-nowrap select-none`}>
                    <span className="inline-flex items-center">
                      {col.label}
                      {col.sortable && <SortIcon col={col.key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => {
                const project = projects.find(p => p.id === task.project)
                const days = task.due ? daysUntil(task.due) : null
                const overdue = task.due && days < 0 && task.col !== 'done'
                const team = (task.assignee || []).flatMap((id: string) => { const u = profiles.find(m => m.id === id); return u ? [u] : [] })
                const subDone = (task.subtasks || []).filter((s: any) => s.d).length
                return (
                  <tr key={task.id} onClick={() => onOpenTask?.(task)} className="border-b border-line2 last:border-0 hover:bg-soft/50 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[13px] text-carbon leading-snug max-w-[280px] truncate">{task.title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {project && <span className="size-1.5 rounded-full shrink-0" style={{ background: project.accent }} />}
                        <span className="text-muted truncate max-w-[140px]">{project?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {state.editingStatus === task.id ? (
                        <StatusSelect task={task} onClose={() => dispatch({ type: 'CLEAR_EDITING' })} />
                      ) : (
                        <button type="button" onClick={(e) => { e.stopPropagation(); dispatch({ type: 'EDIT_STATUS', value: task.id }) }}
                          className={`px-2.5 h-7 rounded-full text-[11px] font-semibold border border-transparent hover:border-line ${colStyles[task.col] || 'bg-soft text-muted'}`}>
                          {COLUMNS.find(c => c.id === task.col)?.title || task.col}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Tag tag={task.tag} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityDisplay priority={task.priority} />
                    </td>
                    <td className="px-4 py-3">
                      {state.editingAssignee === task.id ? (
                        <AssigneePicker task={task} onClose={() => dispatch({ type: 'CLEAR_EDITING' })} />
                      ) : (
                        <button type="button" onClick={(e) => { e.stopPropagation(); dispatch({ type: 'EDIT_ASSIGNEE', value: task.id }) }}
                          className="flex items-center -space-x-1 hover:opacity-80 transition-opacity">
                          {team.length === 0 ? (
                            <span className="text-muted text-[12px]">—</span>
                          ) : (
                            team.slice(0, 3).map(u => <Avatar key={u.id} user={u} size={22} ring />)
                          )}
                          {team.length > 3 && <span className="text-[10px] text-muted ml-1">+{team.length - 3}</span>}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {task.due ? (
                        <span className={`inline-flex items-center gap-1 text-[12px] font-semibold nums ${overdue ? 'text-zred' : 'text-muted'}`}>
                          <Ic.Clock width="11" height="11" />
                          {new Date(task.due).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <Ic.Search width="32" height="32" className="mb-3 opacity-30" />
            <div className="text-[14px] font-medium">No se encontraron tareas</div>
            <div className="text-[12px] mt-1">Intenta ajustar los filtros o la búsqueda.</div>
          </div>
        )}
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {filtered.map(task => {
          const project = projects.find(p => p.id === task.project)
          const days = task.due ? daysUntil(task.due) : null
          const overdue = task.due && days < 0 && task.col !== 'done'
          const team = (task.assignee || []).flatMap((id: string) => { const u = profiles.find(m => m.id === id); return u ? [u] : [] })
          const subDone = (task.subtasks || []).filter((s: any) => s.d).length
          return (
            <div key={task.id} onClick={() => onOpenTask?.(task)} className="bg-white border border-line rounded-lg p-4 space-y-3 cursor-pointer">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {project && <span className="size-1.5 rounded-full shrink-0" style={{ background: project.accent }} />}
                    <span className="text-[11px] font-semibold text-muted truncate">{project?.name || 'Sin proyecto'}</span>
                    <Tag tag={task.tag} />
                  </div>
                  <h4 className="text-[14px] font-semibold leading-snug text-carbon">{task.title}</h4>
                </div>
                <div className={`px-2.5 h-7 rounded-full text-[11px] font-semibold inline-flex items-center shrink-0 ${colStyles[task.col] || 'bg-soft text-muted'}`}>
                  {COLUMNS.find(c => c.id === task.col)?.title || task.col}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PriorityDisplay priority={task.priority} />
                  {task.due && (
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold nums ${overdue ? 'text-zred' : 'text-muted'}`}>
                      <Ic.Clock width="10" height="10" />
                      {new Date(task.due).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                    </span>
                  )}
                </div>
                {team.length > 0 && (
                  <div className="flex items-center -space-x-1">
                    {team.slice(0, 3).map(u => <Avatar key={u.id} user={u} size={22} ring />)}
                    {team.length > 3 && <span className="text-[10px] text-muted ml-1">+{team.length - 3}</span>}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <Ic.Search width="32" height="32" className="mb-3 opacity-30" />
            <div className="text-[14px] font-medium">No se encontraron tareas</div>
            <div className="text-[12px] mt-1">Intenta ajustar los filtros o la búsqueda.</div>
          </div>
        )}
      </div>

      <div className="mt-4 text-[12px] text-muted">{filtered.length} de {tasks.length} tareas visibles</div>

      <FiltersDrawer
        open={state.filtersOpen}
        context="kanban"
        value={state.draft}
        profiles={profiles}
        onChange={(v: any) => dispatch({ type: 'SET_DRAFT', value: v })}
        onApply={() => dispatch({ type: 'SET_FILTERS', value: state.draft })}
        onReset={() => { const empty = { assignees: [], tags: [], priorities: [], due: 'all', sort: 'recent' }; dispatch({ type: 'SET_DRAFT', value: empty }); dispatch({ type: 'SET_FILTERS', value: empty }) }}
        onClose={() => dispatch({ type: 'SET_FILTERS_OPEN', value: false })}
      />
    </div>
  )
}

function PriorityDisplay({ priority }: any) {
  const p = PRIORITY[priority]
  return (
    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-muted">
      <span className={`size-1.5 rounded-full ${p?.dot || ''}`} />
      {p?.label || priority}
    </span>
  )
}
