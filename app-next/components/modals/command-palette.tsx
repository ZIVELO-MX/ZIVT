'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Ic } from '@/components/icons'

const KIND_LABEL: Record<string, string> = {
  page: 'Navegar', action: 'Acción', project: 'Proyecto', client: 'Cliente', task: 'Tarea',
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

  const projs = dynamicProjects || []
  const clis = dynamicClients || []
  const tks = dynamicTasks || []

  const all = useMemo(() => {
    const items = []
    items.push(
      { id: 'go-dashboard', kind: 'page',   label: 'Ir al Dashboard',    sub: 'Resumen del workspace', icon: <Ic.Dashboard width="16" height="16" />, action: () => onNavigate('dashboard') },
      { id: 'go-kanban',    kind: 'page',   label: 'Ir a Pendientes',    sub: 'Tablero kanban',        icon: <Ic.Kanban    width="16" height="16" />, action: () => onNavigate('kanban') },
      { id: 'go-projects',  kind: 'page',   label: 'Ir a Proyectos',     sub: 'Métricas por proyecto', icon: <Ic.Folder    width="16" height="16" />, action: () => onNavigate('projects') },
      { id: 'go-clients',   kind: 'page',   label: 'Ir a Clientes',      sub: 'Cartera',               icon: <Ic.Briefcase width="16" height="16" />, action: () => onNavigate('clients') },
    )
    items.push(
      { id: 'act-new-task',    kind: 'action', label: 'Crear nueva tarea',    sub: 'Nuevo pendiente en el tablero', icon: <Ic.Plus width="16" height="16" />, action: () => onNavigate('kanban') },
      { id: 'act-new-project', kind: 'action', label: 'Crear nuevo proyecto', sub: 'Iniciar un proyecto',           icon: <Ic.Plus width="16" height="16" />, action: () => onNavigate('projects') },
      { id: 'act-new-client',  kind: 'action', label: 'Agregar cliente',      sub: 'Nuevo cliente o prospecto',     icon: <Ic.Plus width="16" height="16" />, action: () => onNavigate('clients') },
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
