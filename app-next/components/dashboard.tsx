'use client'

import { useState, useMemo } from 'react'
import { Ic } from '@/components/icons'
import { Card, Badge, Button, AvatarStack, Tag, ProgressBar, Avatar } from './ui'
import { TEAM, ACTIVITY_INIT, formatDate, formatMoney, daysUntil } from '@/lib/data'
import { useRole } from '@/lib/supabase/useRole'
import type { Client, Profile, ProfilePermission, Project, Task } from '@/lib/supabase/types'

function StatCard({ label, value, delta, trend, sub, accent = undefined }: any) {
  const isUp = trend === 'up';
  return (
    <Card className="p-5 hover:shadow-soft transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-semibold text-muted uppercase tracking-wider">{label}</span>
        {delta && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${isUp ? 'bg-[#E6F4EA] text-[#1E6B3C]' : 'bg-tint text-zred'}`}>
            {isUp ? <Ic.Up width="11" height="11"/> : <Ic.Down width="11" height="11"/>}
            {delta}
          </span>
        )}
      </div>
      <div className="text-[34px] font-extrabold tracking-tight nums leading-none mb-1.5 text-carbon" style={accent ? { color: accent } : undefined}>
        {value}
      </div>
      <div className="text-[12px] text-muted">{sub}</div>
    </Card>
  );
}

function RestrictedStatCard({ label }: { label: string }) {
  return (
    <Card className="p-5 hover:shadow-soft transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-semibold text-muted uppercase tracking-wider">{label}</span>
      </div>
      <div className="h-[34px] flex items-center text-[14px] font-bold text-muted">
        Acceso restringido
      </div>
      <div className="text-[12px] text-muted">Disponible para admins/founders</div>
    </Card>
  );
}

function MiniBarChart({ data, color = '#D72228' }: any) {
  const max = Math.max(...data.map(d => d.v), 1);
  if (!data.length) {
    return (
      <div className="h-[168px] rounded-md border border-dashed border-line bg-soft/60 flex items-center justify-center text-[13px] text-muted">
        Sin datos para este período
      </div>
    );
  }

  return (
    <div className="rounded-md border border-line2 bg-soft/50 px-3 pt-4 pb-3">
      <div className="relative h-[150px]">
        <div className="absolute inset-x-0 top-0 h-px bg-line2" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-line2/70" />
        <div className="absolute inset-x-0 bottom-7 h-px bg-carbon/20 dark:bg-white/20" />
        <div className="relative z-10 flex items-end gap-2 h-full pb-7">
          {data.map((d, i) => {
            const pct = Math.max(8, (d.v / max) * 100);
            return (
              <div key={d.l} className="flex-1 h-full flex flex-col items-center justify-end gap-2">
                <span className="text-[10.5px] font-bold nums text-carbon">{d.v}</span>
                <div
                  className="w-full max-w-[44px] rounded-t-md shadow-soft transition-all duration-700 ease-out"
                  style={{
                    height: `calc((100% - 24px) * ${pct / 100})`,
                    backgroundColor: color,
                    opacity: i === data.length - 1 ? 1 : 0.72 + (i / Math.max(data.length - 1, 1)) * 0.22,
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="absolute inset-x-0 bottom-0 grid gap-2" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
          {data.map(d => (
            <span key={d.l} className="text-center text-[10.5px] text-muted font-semibold">{d.l}</span>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
        <span>0</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-sm" style={{ backgroundColor: color }} />
          Tareas completadas
        </span>
        <span className="nums">{max}</span>
      </div>
    </div>
  );
}

function Donut({ segments, size = 140 }: any) {
  const total = segments.reduce((s, x) => s + x.v, 0) || 1;
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" className="text-[#F5F5F5] dark:text-white/10" strokeWidth="14"/>
      {segments.map((s, i) => {
        const len = (s.v / total) * c;
        const el = <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={s.color} strokeWidth="14"
          strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} strokeLinecap="butt" />;
        offset += len;
        return el;
      })}
    </svg>
  );
}

const EVENT_ICONS: Record<string, string> = {
  task_done:       '✓',
  task_created:    '+',
  comment:         '💬',
  project_created: '📁',
  file_uploaded:   '📎',
  status_changed:  '↔',
  member_joined:   '👤',
};

const EVENT_COLORS: Record<string, string> = {
  task_done:       '#1E6B3C',
  task_created:    '#D72228',
  comment:         '#6366F1',
  project_created: '#D72228',
  file_uploaded:   '#E0A800',
  status_changed:  '#6B6B6B',
  member_joined:   '#1E6B3C',
};

const MONTH_LABELS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const min  = Math.floor(diff / 60_000);
  if (min < 60)  return `hace ${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24)   return `hace ${hr}h`;
  const d = Math.floor(hr / 24);
  if (d < 7)     return `hace ${d}d`;
  return `hace ${Math.floor(d / 7)}sem`;
}

function ActivityFeed() {
  const [limit, setLimit] = useState(7);
  const events = ACTIVITY_INIT.slice(0, limit);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-[16px] mb-1">Feed de actividad</h3>
          <p className="text-[12.5px] text-muted">Últimas acciones del equipo</p>
        </div>
        {limit < ACTIVITY_INIT.length && (
          <button type="button"
            onClick={() => setLimit(l => Math.min(l + 7, ACTIVITY_INIT.length))}
            className="text-[12.5px] font-semibold text-zred hover:underline"
          >
            Ver más →
          </button>
        )}
      </div>
      <div className="space-y-0 divide-y divide-line2">
        {events.map(ev => {
          const user = TEAM.find(u => u.id === ev.userId);
          const color = EVENT_COLORS[ev.type] || '#6B6B6B';
          const icon  = EVENT_ICONS[ev.type]  || '·';
          return (
            <div key={ev.id} className="flex items-start gap-3 py-3">
              <div className="relative shrink-0">
                <div className="size-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: user?.color || '#6B6B6B' }}>
                  {user?.initials || '?'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full border border-white dark:border-carbon flex items-center justify-center text-[9px] font-bold text-white leading-none" style={{ background: color }}>
                  {icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] leading-snug">
                  <span className="font-semibold">{user?.name || 'Alguien'}</span>
                  {' '}{ev.action}
                  {ev.target && <>{' '}<span className="font-medium text-carbon dark:text-white/90">{ev.target}</span></>}
                </p>
                <span className="text-[11.5px] text-muted nums">{timeAgo(ev.ts)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

type DashboardProps = {
  projects: Project[]
  tasks: Task[]
  clients: Client[]
  permission?: ProfilePermission
  setView: (view: string) => void
  profiles?: Profile[]
}

export default function Dashboard({ projects, tasks, clients, permission, setView, profiles = [] }: DashboardProps) {
  const role = useRole()
  const [activePeriod, setActivePeriod] = useState('6M')
  const [now, setNow] = useState(new Date())
  const currentMonth = now.getMonth()
  const todayLabel = useMemo(() => new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now), [now])
  const currentPermission = role ?? permission
  const canViewRevenue = currentPermission === 'admin' || currentPermission === 'founder'
  const activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'review').length;
  const doneProjects = projects.filter(p => p.status === 'done').length;
  const inProgress = tasks.filter(t => t.col === 'progress').length;
  const review = tasks.filter(t => t.col === 'review').length;
  const overdue = tasks.filter(t => t.due && daysUntil(t.due) < 0 && t.col !== 'done').length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const totalMRR = canViewRevenue ? clients.reduce((s,c) => s + c.mrr, 0) : 0;

  const currentYear = now.getFullYear()
  const trend = MONTH_LABELS.map((l, m) => {
    const v = tasks.filter(t => {
      if (t.col !== 'done') return false
      const raw = t.updatedAt ?? t.createdAt
      if (!raw) return false
      const d = new Date(raw)
      return d.getFullYear() === currentYear && d.getMonth() === m
    }).length
    return { l, v, m }
  });
  const completedToDate = trend.filter(item => item.m <= currentMonth);
  const trendByPeriod = {
    '6M': completedToDate.slice(-6),
    YTD: completedToDate,
    '12M': trend,
  };
  const visibleTrend = trendByPeriod[activePeriod]?.length ? trendByPeriod[activePeriod] : completedToDate;
  const trendTotal = visibleTrend.reduce((sum, item) => sum + item.v, 0);
  const firstVisibleIndex = Math.max(0, trend.findIndex(item => item.m === visibleTrend[0]?.m));
  const previousTrendTotal = trend.slice(Math.max(0, firstVisibleIndex - visibleTrend.length), firstVisibleIndex).reduce((sum, item) => sum + item.v, 0);
  const trendDelta = previousTrendTotal > 0 ? Math.round(((trendTotal - previousTrendTotal) / previousTrendTotal) * 100) : (trendTotal > 0 ? 100 : 0);

  const statusSegments = [
    { name:'En progreso', v: projects.filter(p=>p.status==='in_progress').length, color:'#D72228' },
    { name:'En revisión', v: projects.filter(p=>p.status==='review').length,      color:'#E0A800' },
    { name:'Por iniciar', v: projects.filter(p=>p.status==='todo').length,        color:'#6B6B6B' },
    { name:'Terminado',   v: projects.filter(p=>p.status==='done').length,        color:'#1E6B3C' },
  ];

  const upcoming = tasks
    .filter(t => t.due && t.col !== 'done')
    .sort((a,b) => new Date(a.due).getTime() - new Date(b.due).getTime())
    .slice(0, 5);

  const teamLoad = TEAM.map(u => ({
    user: u,
    count: tasks.filter(t => t.assignee.includes(u.id) && t.col !== 'done').length,
  })).sort((a,b) => b.count - a.count);
  const maxLoad = Math.max(...teamLoad.map(t => t.count), 1);

  return (
    <div className="p-8 space-y-6">
      <div className="p-7 text-white relative overflow-hidden border border-carbon rounded-lg" style={{background:'#1D1D1B'}}>
        <div className="absolute inset-0 grid-bg opacity-[0.05]"/>
        <div className="absolute -right-8 -top-8 size-48 rounded-full bg-zred/20 blur-2xl"/>
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60 mb-2">
              {todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1)}
            </div>
            <h2 className="text-[32px] font-extrabold tracking-tight leading-tight mb-2">
              {now.getHours() < 12 ? 'Buenos días' : now.getHours() < 19 ? 'Buenas tardes' : 'Buenas noches'}, {TEAM[0]?.name.split(' ')[0] || 'Raúl'}.
            </h2>
            <p className="text-white/70 text-[15px] leading-relaxed max-w-[460px]">
              Tienes <span className="text-white font-semibold">{inProgress} tareas activas</span> y{' '}
              <span className="text-zred font-semibold">{overdue} con vencimiento atrasado</span>
              {(() => {
                const reviewProject = projects.find(p => p.status === 'review');
                return reviewProject ? <>. El proyecto <span className="text-white font-semibold">{reviewProject.name}</span> está listo para revisión.</> : '.';
              })()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/15 hover:text-white hover:border-white/30" onClick={() => setView('kanban')}>
              <Ic.Kanban width="16" height="16"/> Ver pendientes
            </Button>
            <Button variant="primary" onClick={() => setView('projects')}>
              <Ic.Arrow width="16" height="16"/> Proyectos
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Proyectos activos" value={activeProjects} delta="+2" trend="up" sub={`${doneProjects} terminados este trimestre`} />
        <StatCard label="Tareas en curso"   value={inProgress}     delta="+4" trend="up" sub={`${review} esperan revisión`} />
        {canViewRevenue ? (
          <StatCard label="Clientes activos" value={activeClients} delta="+1" trend="up" sub={`${clients.length} en cartera total`} />
        ) : (
          <RestrictedStatCard label="Clientes activos" />
        )}
        {canViewRevenue ? (
          <StatCard
            label="MRR estimado"
            value={formatMoney(totalMRR).replace('MX$','$')}
            delta="+8.2%"
            trend="up"
            sub="vs. mes anterior"
            accent="#D72228"
          />
        ) : (
          <RestrictedStatCard label="MRR estimado" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-bold text-[16px] mb-1">Tareas completadas</h3>
              <p className="text-[12.5px] text-muted">{activePeriod === '6M' ? 'Últimos 6 meses' : activePeriod === 'YTD' ? 'Año en curso' : 'Últimos 12 meses'} · entregas del equipo</p>
            </div>
            <div className="flex gap-2 text-[12px]">
              {['6M', 'YTD', '12M'].map(period => (
                <button type="button" key={period} onClick={() => setActivePeriod(period)}
                  className={`px-3 h-8 rounded-full font-semibold transition-colors ${activePeriod === period ? 'bg-carbon text-white shadow-soft' : 'text-muted hover:bg-soft hover:text-carbon'}`}>
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-4 mb-3">
            <div className="text-[40px] font-extrabold tracking-tight nums leading-none">{trendTotal}</div>
            <Badge className={`${trendDelta >= 0 ? 'bg-[#E6F4EA] text-[#1E6B3C]' : 'bg-tint text-zred'} mb-2`}>
              {trendDelta >= 0 ? '+' : ''}{trendDelta}% vs período anterior
            </Badge>
          </div>
          <MiniBarChart data={visibleTrend} />
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-[16px] mb-1">Estado de proyectos</h3>
          <p className="text-[12.5px] text-muted mb-4">{projects.length} proyectos totales</p>
          <div className="flex items-center gap-5">
            <div className="relative">
              <Donut segments={statusSegments} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[24px] font-extrabold nums leading-none">{projects.length}</div>
                <div className="text-[10.5px] text-muted uppercase tracking-wider">total</div>
              </div>
            </div>
            <div className="flex-1 space-y-2.5">
              {statusSegments.map(s => (
                <div key={s.name} className="flex items-center gap-2 text-[12.5px]">
                  <span className="size-2.5 rounded-sm" style={{background: s.color}} />
                  <span className="flex-1 text-carbon">{s.name}</span>
                  <span className="font-semibold nums">{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[16px]">Próximas entregas</h3>
              <p className="text-[12.5px] text-muted">Ordenadas por fecha de vencimiento</p>
            </div>
            <button type="button" onClick={() => setView('kanban')} className="text-[12.5px] font-semibold text-zred hover:underline">Ver todas →</button>
          </div>
          {upcoming.length === 0 ? (
            <div className="py-10 text-center text-muted">
              <div className="text-[14px] font-medium mb-1">Todo al día</div>
              <div className="text-[12.5px]">No hay tareas con vencimiento próximo.</div>
            </div>
          ) : (
            <div className="divide-y divide-line2">
              {upcoming.map(t => {
                const p = projects.find(pr => pr.id === t.project);
                const days = daysUntil(t.due);
                const overdue = days < 0;
                const soon = days >= 0 && days <= 3;
                return (
                  <div key={t.id} className="py-3 flex items-center gap-4">
                    <span className="w-2 h-12 rounded-full shrink-0" style={{background: p?.accent || '#1D1D1B'}} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[14px] truncate">{t.title}</div>
                      <div className="text-[12px] text-muted flex items-center gap-2 mt-0.5">
                        <span className="truncate">{p?.name}</span>
                        <span>·</span>
                        <Tag tag={t.tag} />
                      </div>
                    </div>
                    <AvatarStack users={t.assignee.flatMap(id => { const m = TEAM.find(u => u.id === id); return m ? [m] : [] })} size={24} max={3} />
                    <div className="text-right shrink-0 w-[110px]">
                      <div className={`text-[12.5px] font-bold nums ${overdue ? 'text-zred' : soon ? 'text-[#E0A800]' : 'text-carbon'}`}>
                        {overdue ? `−${Math.abs(days)}d` : days === 0 ? 'Hoy' : `${days} días`}
                      </div>
                      <div className="text-[11px] text-muted">{formatDate(t.due)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-[16px] mb-1">Carga del equipo</h3>
          <p className="text-[12.5px] text-muted mb-5">Tareas abiertas por miembro</p>
          <div className="space-y-4">
            {teamLoad.map(({ user, count }) => (
              <div key={user.id} className="flex items-center gap-3">
                <Avatar user={user} size={32}/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-medium truncate">{user.name}</span>
                    <span className="text-[12px] font-bold nums">{count}</span>
                  </div>
                  <div className="h-1.5 bg-soft rounded-full overflow-hidden">
                    <div className="h-full bg-zred rounded-full transition-all duration-500"
                         style={{ width: `${(count / maxLoad) * 100}%` }}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <ActivityFeed />
    </div>
  );
}
