'use client'

import { useRef, useState, useEffect, useReducer } from 'react'
import { useRouter } from 'next/navigation'
import { Ic } from '@/components/icons'
import { Card, Badge, Button, ProgressBar, Avatar, AvatarStack } from './ui'
import { STATUS_LABEL, formatDate, formatMoney, daysUntil } from '@/lib/constants'
import { ConfirmDialog, NewProjectModal, ProjectDetailDrawer } from './modals'
import { createProject, createTask, deleteProject } from '@/lib/supabase/queries'

function ProjectMetricCard({ project, clients, onOpen, onDuplicate, onDelete, onSoon, profiles = [] }: any) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const client = clients.find(c => c.id === project.client);
  const status = STATUS_LABEL[project.status];
  const team = project.team.flatMap(id => { const u = profiles.find(t => t.id === id); return u ? [u] : [] });
  const days = daysUntil(project.due);
  const overdue = days < 0 && project.status !== 'done';

  useEffect(() => {
    function onDown(e) {
      if (!menuOpen) return;
      if (menuRef.current?.contains(e.target)) return;
      setMenuOpen(false);
    }
    function onKey(e) { if (e.key === 'Escape') setMenuOpen(false); }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [menuOpen]);

  function run(action) {
    setMenuOpen(false);
    action();
  }

  return (
    <Card hover className="p-5 relative cursor-pointer" onClick={() => onOpen(project)}>
      <span className="absolute left-0 top-0 bottom-0 w-1" style={{background: project.accent}}/>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge className={status.cls}>{status.label}</Badge>
            {project.health === 'at_risk' && <Badge className="bg-tint text-zred">En riesgo</Badge>}
          </div>
          <h3 className="font-bold text-[16px] leading-tight tracking-tight mb-1">{project.name}</h3>
          <p className="text-[12.5px] text-muted">
            {client ? client.name : 'Proyecto interno'} · {project.kind}
          </p>
        </div>
        <div ref={menuRef} className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => setMenuOpen(open => !open)} className="size-8 rounded-full hover:bg-soft flex items-center justify-center text-muted shrink-0">
            <Ic.Dots width="16" height="16"/>
          </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 z-30 w-40 rounded-md border border-line2 bg-white shadow-pop p-1 pop-in">
                <button type="button" onClick={() => run(() => onOpen(project))} className="w-full flex items-center gap-2 px-3 h-8 rounded text-[12.5px] hover:bg-soft text-left">
                  <Ic.Edit width="13" height="13" className="text-muted"/> Ver detalle
                </button>
                <button type="button" onClick={() => run(() => onDuplicate(project))} className="w-full flex items-center gap-2 px-3 h-8 rounded text-[12.5px] hover:bg-soft text-left">
                  <Ic.Plus width="13" height="13" className="text-muted"/> Duplicar
                </button>
                <button type="button" onClick={() => run(() => onDelete(project))} className="w-full flex items-center gap-2 px-3 h-8 rounded text-[12.5px] hover:bg-soft text-zred text-left">
                  <Ic.Trash width="13" height="13"/> Eliminar
                </button>
              </div>
            )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-[12px] mb-1.5">
          <span className="text-muted">Progreso</span>
          <span className="font-bold nums">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} color={project.accent}/>
      </div>

      <div className="grid grid-cols-3 gap-3 py-3 border-t border-line2 mb-3">
        <div>
          <div className="text-[10.5px] font-semibold text-muted uppercase tracking-wider mb-1">Tareas</div>
          <div className="text-[14px] font-bold nums">{project.tasksDone}<span className="text-muted font-normal">/{project.tasksTotal}</span></div>
        </div>
        <div>
          <div className="text-[10.5px] font-semibold text-muted uppercase tracking-wider mb-1">Entrega</div>
          <div className={`text-[14px] font-bold nums ${overdue ? 'text-zred' : ''}`}>
            {overdue ? `−${Math.abs(days)}d` : project.status === 'done' ? 'Entregado' : `${days}d`}
          </div>
        </div>
        <div>
          <div className="text-[10.5px] font-semibold text-muted uppercase tracking-wider mb-1">Presupuesto</div>
          <div className="text-[14px] font-bold nums">
            {project.budget > 0 ? `${Math.round(project.spent / project.budget * 100)}%` : '—'}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <AvatarStack users={team} size={26} max={4}/>
        <span className="text-[12.5px] font-semibold text-carbon inline-flex items-center gap-1">
          Ver detalle <Ic.Arrow width="12" height="12"/>
        </span>
      </div>
    </Card>
  );
}

export default function Projects({ projects, setProjects, clients, tasks, setTasks, teams, setTeams, profiles = [] }: any) {
  const router = useRouter();
  const [page, setPage] = useReducer(
    (prev: any, next: any) => ({ ...prev, ...next }),
    { filter: 'all', search: '', view: 'grid', newOpen: false, openDetail: null, confirmDel: null, toast: '' }
  );
  const toastRef = useRef(null);

  const counts = {
    all: projects.length,
    in_progress: projects.filter(p => p.status === 'in_progress').length,
    review: projects.filter(p => p.status === 'review').length,
    todo: projects.filter(p => p.status === 'todo').length,
    done: projects.filter(p => p.status === 'done').length,
  };

  const filtered = projects.filter(p =>
    (page.filter === 'all' ? true : p.status === page.filter) &&
    p.name.toLowerCase().includes(page.search.toLowerCase())
  );

  const totalBudget = projects.reduce((s,p) => s + p.budget, 0);
  const totalSpent = projects.reduce((s,p) => s + p.spent, 0);
  const avgProgress = Math.round(projects.filter(p => p.status !== 'done').reduce((s,p) => s + p.progress, 0) / Math.max(projects.filter(p => p.status !== 'done').length, 1));
  const atRisk = projects.filter(p => p.health === 'at_risk').length;

  function showToast(message) {
    setPage({ toast: message });
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = window.setTimeout(() => setPage({ toast: '' }), 2200);
  }
  async function duplicateProject(project) {
    const newProject = {
      id: crypto.randomUUID(),
      name: `${project.name} + copia`,
      client: project.client,
      kind: project.kind,
      status: 'todo' as const,
      progress: 0,
      health: 'on_track' as const,
      budget: project.budget,
      spent: 0,
      tasksDone: 0,
      tasksTotal: 0,
      start: project.start,
      due: project.due,
      team: project.team,
      accent: project.accent,
    }
    try {
      const created = await createProject(newProject)
      setProjects(prev => [created, ...prev])
      router.refresh()
      showToast('Proyecto duplicado.')
    } catch {
      setProjects(prev => [{
        ...project,
        id: 'p' + Date.now() + Math.random().toString(36).slice(2,4),
        name: `${project.name} + copia`,
        status: 'todo',
        progress: 0,
        spent: 0,
        health: 'on_track',
        tasksDone: 0,
        tasksTotal: 0,
      }, ...prev]);
      showToast('Proyecto duplicado.')
    }
  }
  async function confirmDelete() {
    const target = page.confirmDel
    setPage({ confirmDel: null })
    if (!target) return
    const snapshot = projects
    setProjects(prev => prev.filter(p => p.id !== target.id))
    if (page.openDetail?.id === target.id) setPage({ openDetail: null })
    try {
      await deleteProject(target.id)
      router.refresh()
      showToast('Proyecto eliminado.')
    } catch {
      setProjects(snapshot)
      showToast('Error al eliminar el proyecto')
    }
  }

  const tabs = [
    { id:'all',         label:'Todos',        count: counts.all },
    { id:'in_progress', label:'En progreso',  count: counts.in_progress },
    { id:'review',      label:'En revisión',  count: counts.review },
    { id:'todo',        label:'Por iniciar',  count: counts.todo },
    { id:'done',        label:'Terminados',   count: counts.done },
  ];

  return (
    <div className="px-4 md:px-8 py-4 md:py-6 space-y-4 md:space-y-6">
      {page.toast && (
        <div className="fixed right-6 bottom-6 z-[80] rounded-md bg-carbon text-white shadow-pop px-4 py-3 text-[13px] font-semibold pop-in">
          {page.toast}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Cartera total</div>
          <div className="text-[28px] font-extrabold nums leading-none">{projects.length}</div>
          <div className="text-[12px] text-muted mt-1">proyectos activos y cerrados</div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Progreso promedio</div>
          <div className="text-[28px] font-extrabold nums leading-none">{avgProgress}%</div>
          <ProgressBar value={avgProgress} color="#D72228"/>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Presupuesto ejecutado</div>
          <div className="text-[28px] font-extrabold nums leading-none">{formatMoney(totalSpent).replace('MX$','$')}</div>
          <div className="text-[12px] text-muted mt-1">de {formatMoney(totalBudget).replace('MX$','$')}</div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">En riesgo</div>
          <div className="text-[28px] font-extrabold nums leading-none text-zred">{atRisk}</div>
          <div className="text-[12px] text-muted mt-1">requiere atención</div>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-white border border-line rounded-full p-1 overflow-x-auto">
          {tabs.map(t => (
            <button type="button" key={t.id} onClick={()=>setPage({ filter: t.id })}
              className={`shrink-0 px-3 h-8 rounded-full text-[12.5px] font-semibold inline-flex items-center gap-1.5 ${page.filter===t.id?'bg-carbon text-white':'text-muted hover:text-carbon'}`}>
              {t.label}
              <span className={`px-1.5 rounded-full text-[10.5px] nums ${page.filter===t.id?'bg-white/15':'bg-soft'}`}>{t.count}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 h-9 px-3.5 rounded-full bg-white border border-line flex-1 md:flex-none min-w-0">
          <Ic.Search width="14" height="14" className="text-muted shrink-0"/>
          <input value={page.search} onChange={(e)=>setPage({ search: e.target.value })} placeholder="Buscar..." aria-label="Buscar proyectos" className="bg-transparent outline-none text-[13px] w-full min-w-0"/>
        </div>

        <div className="hidden md:block flex-1"/>

        <div className="flex items-center bg-white border border-line rounded-full p-1">
          <button type="button" onClick={()=>setPage({ view: 'grid' })} className={`px-3 h-8 rounded-full text-[12px] font-semibold ${page.view==='grid'?'bg-carbon text-white':'text-muted'}`}>Grid</button>
          <button type="button" onClick={()=>setPage({ view: 'table' })} className={`px-3 h-8 rounded-full text-[12px] font-semibold ${page.view==='table'?'bg-carbon text-white':'text-muted'}`}>Tabla</button>
        </div>

        <Button variant="primary" onClick={() => setPage({ newOpen: true })}><Ic.Plus width="15" height="15"/> Nuevo proyecto</Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="size-16 rounded-full bg-soft inline-flex items-center justify-center text-muted mb-4">
            <Ic.Folder width="28" height="28"/>
          </div>
          <h3 className="text-[18px] font-bold tracking-tight mb-1">
            {page.search || page.filter !== 'all' ? 'Sin resultados' : 'No hay proyectos aún'}
          </h3>
          <p className="text-[14px] text-muted mb-4">
            {page.search || page.filter !== 'all'
              ? 'Intenta con otros filtros o términos de búsqueda.'
              : 'Crea tu primer proyecto para empezar a gestionar tu cartera.'}
          </p>
          {!page.search && page.filter === 'all' && (
            <Button variant="primary" onClick={() => setPage({ newOpen: true })}>
              <Ic.Plus width="15" height="15"/> Nuevo proyecto
            </Button>
          )}
        </div>
      ) : page.view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <ProjectMetricCard
              key={p.id}
              project={p}
              clients={clients}
              profiles={profiles}
              onOpen={(p) => setPage({ openDetail: p })}
              onDuplicate={duplicateProject}
              onDelete={(p) => setPage({ confirmDel: p })}
              onSoon={showToast}
            />
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-[13px]">
            <thead className="bg-soft border-b border-line2">
              <tr className="text-left">
                <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted">Proyecto</th>
                <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted">Cliente</th>
                <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted">Estado</th>
                <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted">Progreso</th>
                <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted">Equipo</th>
                <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted">Entrega</th>
                <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted text-right">Presupuesto</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const c = clients.find(cl => cl.id === p.client);
                const status = STATUS_LABEL[p.status];
                const team = p.team.flatMap(id => { const u = profiles.find(t => t.id === id); return u ? [u] : [] });
                const days = daysUntil(p.due);
                return (
                  <tr key={p.id} onClick={() => setPage({ openDetail: p })} className="border-b border-line2 hover:bg-soft/50 transition-colors cursor-pointer">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="w-1.5 h-8 rounded-full" style={{background: p.accent}}/>
                        <div>
                          <div className="font-semibold text-carbon">{p.name}</div>
                          <div className="text-[11.5px] text-muted">{p.kind}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted">{c ? c.name : '— Interno'}</td>
                    <td className="px-5 py-3.5"><Badge className={status.cls}>{status.label}</Badge></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <ProgressBar value={p.progress} color={p.accent}/>
                        <span className="font-bold nums text-[12px] w-8 text-right">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><AvatarStack users={team} size={24} max={3}/></td>
                    <td className="px-5 py-3.5">
                      <div className={`font-medium nums ${days < 0 && p.status !== 'done' ? 'text-zred' : 'text-carbon'}`}>{formatDate(p.due)}</div>
                    </td>
                    <td className="px-5 py-3.5 text-right nums">
                      <div className="font-semibold">{p.budget > 0 ? formatMoney(p.budget).replace('MX$','$') : '—'}</div>
                      {p.budget > 0 && <div className="text-[11.5px] text-muted">{formatMoney(p.spent).replace('MX$','$')} usado</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </Card>
      )}

      <NewProjectModal
        open={page.newOpen}
        clients={clients}
        teams={teams}
        setTeams={setTeams}
        profiles={profiles}
        onClose={() => setPage({ newOpen: false })}
        onCreate={async (p, templateTasks) => {
          try {
            const created = await createProject({ ...p, tasksTotal: templateTasks?.length ?? 0 })
            setProjects(prev => [created, ...prev])
            if (templateTasks?.length) {
              const results = await Promise.allSettled(templateTasks.map(t => createTask(t)))
              const saved = results.flatMap(r => r.status === 'fulfilled' ? [r.value] : [])
              setTasks(prev => [...saved, ...prev])
            }
            router.refresh()
          } catch {
            setProjects(prev => [{ ...p, tasksTotal: templateTasks?.length ?? 0 }, ...prev])
            if (templateTasks?.length) setTasks(prev => [...templateTasks, ...prev])
          }
        }}
      />
      <ProjectDetailDrawer open={!!page.openDetail} project={page.openDetail} clients={clients} profiles={profiles} tasks={tasks} onClose={() => setPage({ openDetail: null })}/>
      <ConfirmDialog
        open={!!page.confirmDel}
        title="¿Eliminar este proyecto?"
        message={page.confirmDel ? `Estás a punto de eliminar ${page.confirmDel.name}. Esta acción no se puede deshacer.` : ''}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setPage({ confirmDel: null })}
      />
    </div>
  );
}
