'use client'

import { useMemo } from 'react'
import { useCurrentProfile } from '@/lib/supabase/useCurrentProfile'
import { Ic } from '@/components/icons'
import { Avatar, Card, Badge } from '@/components/ui'
import { formatDate } from '@/lib/data'
import type { Task, Project } from '@/lib/data'

// ─── Level system ─────────────────────────────────────────────────────────────

const LEVELS = [
  { name: 'Trainee',   min: 0,    max: 100,  color: '#9B9B98', bg: 'bg-soft',            tx: 'text-muted' },
  { name: 'Junior',    min: 100,  max: 400,  color: '#6B6B6B', bg: 'bg-soft',            tx: 'text-carbon' },
  { name: 'Mid',       min: 400,  max: 800,  color: '#3A47B5', bg: 'bg-[#EEF2FF]',       tx: 'text-[#3A47B5]' },
  { name: 'Senior',    min: 800,  max: 1400, color: '#E0A800', bg: 'bg-[#FFF4DE]',       tx: 'text-[#7A5A12]' },
  { name: 'Lead',      min: 1400, max: 2000, color: '#D72228', bg: 'bg-tint',            tx: 'text-zred' },
  { name: 'Principal', min: 2000, max: 2800, color: '#7A3FCB', bg: 'bg-[#F2EAFE]',       tx: 'text-[#5A2EA6]' },
  { name: 'Architect', min: 2800, max: 99999,color: '#1E6B3C', bg: 'bg-[#E6F4EA]',       tx: 'text-[#1E6B3C]' },
]

function getLevel(xp: number) {
  return LEVELS.find(l => xp >= l.min && xp < l.max) ?? LEVELS[LEVELS.length - 1]
}

function computeXP(userId: string, tasks: Task[], projects: Project[], joinDate: string) {
  const days = Math.floor((Date.now() - new Date(joinDate).getTime()) / 86400000)
  let xp = Math.min(days, 200)

  const userProjects = projects.filter(p => p.team.includes(userId))
  xp += userProjects.length * 50
  xp += userProjects.filter(p => p.status === 'done').length * 100

  userProjects.forEach(p => {
    xp += Math.floor(p.tasksDone / Math.max(p.team.length, 1) * 15)
  })

  tasks.forEach(t => {
    if (!t.assignee.includes(userId)) return
    if (t.col === 'done') xp += 20
    t.subtasks.forEach(s => { if (s.d) xp += 5 })
  })

  return xp
}

// ─── Achievements ─────────────────────────────────────────────────────────────

type Stats = {
  tasksDone: number; projectsCount: number; projectsDone: number
  daysInWorkspace: number; subtasksDone: number; overdueCount: number
}

type AchievementDef = {
  id: string; label: string; desc: string
  category: 'execution' | 'collaboration' | 'speed' | 'milestone'
  xpReward: number; icon: React.ReactNode
  check: (s: Stats) => boolean
}

const iconCls = 'size-full'
const ACHIEVEMENTS: AchievementDef[] = [
  // Ejecución
  {
    id: 'first_task', label: 'Primera tarea', desc: 'Completaste tu primera tarea asignada',
    category: 'execution', xpReward: 50,
    icon: <Ic.Check className={iconCls} width="18" height="18" />,
    check: s => s.tasksDone >= 1,
  },
  {
    id: 'tasks_10', label: 'Decena', desc: '10 tareas completadas',
    category: 'execution', xpReward: 100,
    icon: <Ic.Kanban className={iconCls} width="18" height="18" />,
    check: s => s.tasksDone >= 10,
  },
  {
    id: 'tasks_50', label: 'Cincuentena', desc: '50 tareas completadas en total',
    category: 'execution', xpReward: 300,
    icon: <Ic.Sparkle className={iconCls} width="18" height="18" />,
    check: s => s.tasksDone >= 50,
  },
  // Colaboración
  {
    id: 'multi_project', label: 'Multi-proyecto', desc: 'Participando en 3 o más proyectos',
    category: 'collaboration', xpReward: 80,
    icon: <Ic.Folder className={iconCls} width="18" height="18" />,
    check: s => s.projectsCount >= 3,
  },
  {
    id: 'team_player', label: 'Team player', desc: 'Participando en 5 o más proyectos',
    category: 'collaboration', xpReward: 150,
    icon: <Ic.Users className={iconCls} width="18" height="18" />,
    check: s => s.projectsCount >= 5,
  },
  {
    id: 'subtask_master', label: 'Detallista', desc: '10 subtareas completadas',
    category: 'collaboration', xpReward: 60,
    icon: <Ic.Check className={iconCls} width="18" height="18" />,
    check: s => s.subtasksDone >= 10,
  },
  // Velocidad
  {
    id: 'no_overdue', label: 'Sin atrasos', desc: 'Sin ninguna tarea vencida actualmente',
    category: 'speed', xpReward: 60,
    icon: <Ic.Clock className={iconCls} width="18" height="18" />,
    check: s => s.overdueCount === 0,
  },
  {
    id: 'sprint_hero', label: 'Sprint hero', desc: '5 tareas completadas en menos de una semana',
    category: 'speed', xpReward: 120,
    icon: <Ic.Arrow className={iconCls} width="18" height="18" />,
    check: s => s.tasksDone >= 5,
  },
  // Hitos
  {
    id: 'project_done', label: 'Entrega exitosa', desc: 'Participaste en un proyecto completado al 100%',
    category: 'milestone', xpReward: 200,
    icon: <Ic.Folder className={iconCls} width="18" height="18" />,
    check: s => s.projectsDone >= 1,
  },
  {
    id: 'veteran_30', label: 'Mes completo', desc: '30 días activo en el workspace',
    category: 'milestone', xpReward: 80,
    icon: <Ic.Calendar className={iconCls} width="18" height="18" />,
    check: s => s.daysInWorkspace >= 30,
  },
  {
    id: 'veteran_90', label: 'Veterano', desc: '90 días activo en el workspace',
    category: 'milestone', xpReward: 150,
    icon: <Ic.Sparkle className={iconCls} width="18" height="18" />,
    check: s => s.daysInWorkspace >= 90,
  },
]

const CATEGORIES = [
  { id: 'execution',     label: 'Ejecución',     color: '#D72228', bg: 'bg-tint',      tx: 'text-zred' },
  { id: 'collaboration', label: 'Colaboración',  color: '#3A47B5', bg: 'bg-[#EEF2FF]', tx: 'text-[#3A47B5]' },
  { id: 'speed',         label: 'Velocidad',     color: '#E0A800', bg: 'bg-[#FFF4DE]', tx: 'text-[#7A5A12]' },
  { id: 'milestone',     label: 'Hitos',         color: '#1E6B3C', bg: 'bg-[#E6F4EA]', tx: 'text-[#1E6B3C]' },
] as const

// ─── Activity feed ─────────────────────────────────────────────────────────────

function buildActivity(userId: string, tasks: Task[], projects: Project[]) {
  const items: { icon: React.ReactNode; text: string; sub: string; date: string }[] = []

  tasks.forEach(t => {
    if (t.col !== 'done' || !t.assignee.includes(userId)) return
    const p = projects.find(pr => pr.id === t.project)
    items.push({
      icon: <Ic.Check width="14" height="14" />,
      text: `Completaste "${t.title}"`,
      sub: p?.name ?? 'Proyecto interno',
      date: t.due ?? '2026-04-30',
    })
  })

  projects.forEach(p => {
    if (!p.team.includes(userId) || p.status !== 'done') return
    items.push({
      icon: <Ic.Folder width="14" height="14" />,
      text: `Proyecto entregado al 100%`,
      sub: p.name,
      date: p.due,
    })
  })

  projects.forEach(p => {
    if (!p.team.includes(userId) || p.status !== 'review') return
    items.push({
      icon: <Ic.Clock width="14" height="14" />,
      text: `Proyecto enviado a revisión`,
      sub: p.name,
      date: p.due,
    })
  })

  tasks.forEach(t => {
    if (t.col !== 'progress' || !t.assignee.includes(userId)) return
    const p = projects.find(pr => pr.id === t.project)
    items.push({
      icon: <Ic.Arrow width="14" height="14" />,
      text: `Trabajando en "${t.title}"`,
      sub: p?.name ?? 'Proyecto interno',
      date: t.due ?? '',
    })
  })

  return items.slice(0, 8)
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub: string; accent?: string }) {
  return (
    <Card className="p-5">
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">{label}</div>
      <div className="text-[32px] font-extrabold tracking-tight nums leading-none mb-1" style={accent ? { color: accent } : undefined}>{value}</div>
      <div className="text-[12px] text-muted">{sub}</div>
    </Card>
  )
}

function AchievementBadge({ def, unlocked, catColor, catBg, catTx }: {
  def: AchievementDef; unlocked: boolean
  catColor: string; catBg: string; catTx: string
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
      unlocked
        ? 'border-line2 bg-white hover:border-zred/20 hover:shadow-soft'
        : 'border-line2 bg-soft/50 opacity-50'
    }`}>
      <div
        className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${unlocked ? catBg : 'bg-soft'} ${unlocked ? catTx : 'text-muted'}`}
      >
        {def.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-[13px] font-semibold leading-tight ${unlocked ? 'text-carbon' : 'text-muted'}`}>{def.label}</div>
        <div className="text-[11.5px] text-muted leading-snug mt-0.5 truncate">{def.desc}</div>
      </div>
      {unlocked && (
        <span className="text-[11px] font-bold text-muted shrink-0">+{def.xpReward} XP</span>
      )}
      {!unlocked && (
        <Ic.X width="13" height="13" className="text-muted/50 shrink-0" />
      )}
    </div>
  )
}

// ─── Main export ───────────────────────────────────────────────────────────────

export default function ProfileView({ tasks, projects }: { tasks: Task[]; projects: Project[] }) {
  const user = useCurrentProfile()

  const xp = useMemo(() => user ? computeXP(user.id, tasks, projects, user.joined) : 0, [tasks, projects, user])
  const level = getLevel(xp)
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1]
  const levelProgress = nextLevel
    ? Math.round(((xp - level.min) / (level.max - level.min)) * 100)
    : 100

  const days = user ? Math.floor((Date.now() - new Date(user.joined).getTime()) / 86400000) : 0
  const userProjects = user ? projects.filter(p => p.team.includes(user.id)) : []
  const doneTasks = user ? tasks.filter(t => t.col === 'done' && t.assignee.includes(user.id)) : []
  const overdueTasks = user ? tasks.filter(t =>
    t.due && t.col !== 'done' && t.assignee.includes(user.id) &&
    new Date(t.due) < new Date()
  ) : []
  const subtasksDone = user ? tasks.reduce((count, t) => {
    if (!t.assignee.includes(user.id)) return count
    return count + t.subtasks.filter(s => s.d).length
  }, 0) : 0

  const stats: Stats = {
    tasksDone: doneTasks.length + Math.floor(userProjects.reduce((s, p) => s + p.tasksDone / Math.max(p.team.length, 1), 0)),
    projectsCount: userProjects.length,
    projectsDone: userProjects.filter(p => p.status === 'done').length,
    daysInWorkspace: days,
    subtasksDone,
    overdueCount: overdueTasks.length,
  }

  const unlockedIds = new Set(ACHIEVEMENTS.flatMap(a => a.check(stats) ? [a.id] : []))
  const activity = useMemo(() => user ? buildActivity(user.id, tasks, projects) : [], [tasks, projects, user])

  if (!user) return (
    <div className="p-8 flex items-center justify-center h-64 text-muted text-[14px]">Cargando perfil…</div>
  )

  return (
    <div className="p-4 md:p-8 max-w-[1100px] mx-auto space-y-4 md:space-y-6">

      {/* Hero */}
      <div className="relative rounded-lg overflow-hidden border border-carbon p-7 text-white" style={{ background: '#1D1D1B' }}>
        <div className="absolute inset-0 grid-bg opacity-[0.05]" />
        <div className="absolute -right-12 -top-12 size-64 rounded-full bg-zred/20 blur-3xl" />

        <div className="relative flex flex-wrap items-center gap-6">
          <Avatar user={user} size={72} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[26px] font-extrabold tracking-tight leading-none">{user.name}</h1>
              <span className={`px-2.5 py-1 rounded-full text-[11.5px] font-bold ${level.bg} ${level.tx}`}>
                {level.name}
              </span>
            </div>
            <div className="text-white/60 text-[13.5px] mb-1">{user.role} · {user.email}</div>
            <div className="text-white/40 text-[12px]">Miembro desde {formatDate(user.joined)} · {days} días en el workspace</div>
          </div>

          {/* XP block */}
          <div className="w-full md:w-[260px] md:shrink-0">
            <div className="flex items-end justify-between mb-2">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-0.5">Experiencia</div>
                <div className="text-[28px] font-extrabold nums leading-none">{xp.toLocaleString('es-MX')} XP</div>
              </div>
              {nextLevel && (
                <div className="text-right">
                  <div className="text-[11px] text-white/40 mb-0.5">Siguiente</div>
                  <div className="text-[13px] font-bold" style={{ color: nextLevel.color }}>{nextLevel.name}</div>
                </div>
              )}
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${levelProgress}%`, background: level.color }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[11px] text-white/30">{level.min.toLocaleString()} XP</span>
              {nextLevel && <span className="text-[11px] text-white/30">{nextLevel.min.toLocaleString()} XP</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tareas completadas"
          value={stats.tasksDone}
          sub={`${doneTasks.length} asignadas directamente`}
        />
        <StatCard
          label="Proyectos activos"
          value={userProjects.filter(p => p.status !== 'done').length}
          sub={`${userProjects.length} proyectos en total`}
        />
        <StatCard
          label="Proyectos entregados"
          value={stats.projectsDone}
          sub="Completados al 100%"
          accent="#1E6B3C"
        />
        <StatCard
          label="Días en workspace"
          value={days}
          sub={`Desde ${formatDate(user.joined)}`}
          accent={level.color}
        />
      </div>

      {/* Achievements + Activity */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* Achievements */}
        <div className="flex-1 min-w-0 space-y-5">
          <h2 className="text-[17px] font-bold tracking-tight">Logros</h2>
          {CATEGORIES.map(cat => {
            const catDefs = ACHIEVEMENTS.filter(a => a.category === cat.id)
            const catUnlocked = catDefs.filter(a => unlockedIds.has(a.id)).length
            return (
              <div key={cat.id}>
                <div className="flex items-center gap-2 mb-2.5">
                  <div className={`size-5 rounded flex items-center justify-center ${cat.bg} ${cat.tx}`}>
                    {cat.id === 'execution'     && <Ic.Check width="12" height="12" />}
                    {cat.id === 'collaboration' && <Ic.Users width="12" height="12" />}
                    {cat.id === 'speed'         && <Ic.Clock width="12" height="12" />}
                    {cat.id === 'milestone'     && <Ic.Sparkle width="12" height="12" />}
                  </div>
                  <span className="text-[12px] font-bold uppercase tracking-wider text-muted">{cat.label}</span>
                  <span className="text-[11.5px] text-muted ml-auto">{catUnlocked}/{catDefs.length}</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {catDefs.map(def => (
                    <AchievementBadge
                      key={def.id}
                      def={def}
                      unlocked={unlockedIds.has(def.id)}
                      catColor={cat.color}
                      catBg={cat.bg}
                      catTx={cat.tx}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Activity feed */}
        <div className="w-full lg:w-[300px] lg:shrink-0">
          <h2 className="text-[17px] font-bold tracking-tight mb-4">Actividad reciente</h2>
          <div className="relative">
            <div className="absolute left-[18px] top-0 bottom-0 w-px bg-line2" />
            <div className="space-y-1">
              {activity.map((item, i) => (
                <div key={`${item.text}-${i}`} className="flex items-start gap-3 pb-4">
                  <div className="relative z-10 size-9 rounded-full bg-white border border-line2 flex items-center justify-center text-muted shrink-0">
                    {item.icon}
                  </div>
                  <div className="pt-1 min-w-0">
                    <div className="text-[13px] font-medium text-carbon leading-snug">{item.text}</div>
                    <div className="text-[11.5px] text-muted mt-0.5 truncate">{item.sub}</div>
                    {item.date && (
                      <div className="text-[11px] text-muted/70 mt-0.5">{formatDate(item.date)}</div>
                    )}
                  </div>
                </div>
              ))}
              {activity.length === 0 && (
                <div className="text-[13px] text-muted text-center py-8">Sin actividad registrada.</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
