'use client'

import { Ic } from '@/components/icons'
import { Avatar, IconButton } from '@/components/ui'
import { TEAM } from '@/lib/data'
import { useRole } from '@/lib/supabase/useRole'

export function Logo({ collapsed }: any) {
  return (
    <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
      <img src="/logos/zivelo-compact-dark.svg" alt="Zivelo" className="block dark:hidden h-9 w-auto" />
      <img src="/logos/zivelo-compact-white.svg" alt="Zivelo" className="hidden dark:block h-9 w-auto" />
      {!collapsed && (
        <div className="leading-tight">
          <div className="font-bold text-[15px] tracking-tight">Zivelo</div>
          <div className="text-[11px] text-muted -mt-0.5">Panel de control</div>
        </div>
      )}
    </div>
  )
}

export function NavItem({ icon, label, active, badge, onClick, collapsed }: any) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`btn-press group w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} h-10 rounded-md text-[13.5px] font-medium transition-colors relative
        ${active ? 'bg-carbon text-white' : 'text-carbon hover:bg-soft'}`}
    >
      <span className={`${active ? 'text-white' : 'text-muted group-hover:text-carbon'}`}>{icon}</span>
      {!collapsed && (
        <>
          <span className="flex-1 text-left">{label}</span>
          {badge != null && (
            <span className={`px-1.5 h-5 min-w-[20px] rounded-full text-[11px] font-bold flex items-center justify-center
              ${active ? 'bg-zred text-white' : 'bg-tint text-zred'}`}>{badge}</span>
          )}
        </>
      )}
      {collapsed && badge != null && badge > 0 && (
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-zred" />
      )}
    </button>
  )
}

export function Sidebar({ view, setView, counts, collapsed, onToggle, onInvite, onSettings }: any) {
  const role = useRole()
  const hideClients = role === 'editor' || role === 'viewer'
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: <Ic.Dashboard width="18" height="18" /> },
    { id: 'kanban', label: 'Pendientes', icon: <Ic.Kanban width="18" height="18" />, badge: counts.tasks },
    { id: 'learning', label: 'Aprendizaje', icon: <Ic.BookOpen width="18" height="18" /> },
    { id: 'projects', label: 'Proyectos', icon: <Ic.Folder width="18" height="18" />, badge: counts.activeProjects },
    !hideClients ? { id: 'clients', label: 'Clientes', icon: <Ic.Briefcase width="18" height="18" />, badge: counts.clients } : null,
    { id: 'users', label: 'Usuarios', icon: <Ic.Users width="18" height="18" />, badge: counts.users },
  ].filter(Boolean)

  return (
    <aside
      className={`shrink-0 bg-white border-r border-line2 h-screen sticky top-0 flex flex-col transition-[width] duration-300 ease-out
        ${collapsed ? 'w-[72px]' : 'w-[252px]'}`}
    >
      <div className={`flex items-center ${collapsed ? 'px-3 justify-center' : 'px-5 justify-between'} py-5 border-b border-line2 relative`}>
        <Logo collapsed={collapsed} />
        {!collapsed && (
          <button
            onClick={onToggle}
            title="Colapsar"
            className="btn-press w-7 h-7 rounded-md hover:bg-soft inline-flex items-center justify-center text-muted hover:text-carbon transition-colors"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /><path d="m15 9-3 3 3 3" />
            </svg>
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={onToggle}
          title="Expandir"
          className="btn-press absolute right-[-14px] top-[68px] z-30 w-7 h-7 rounded-full bg-white border border-line2 shadow-soft text-muted hover:text-zred hover:border-zred/40 inline-flex items-center justify-center transition-colors"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>
        </button>
      )}

      <nav className={`flex-1 ${collapsed ? 'px-2' : 'px-3'} py-4 space-y-0.5 overflow-y-auto scroll-thin`}>
        {!collapsed && <div className="px-3 pb-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted">Workspace</div>}
        {items.map(it => (
          <NavItem
            key={it.id}
            icon={it.icon}
            label={it.label}
            active={view === it.id}
            badge={it.badge}
            collapsed={collapsed}
            onClick={() => setView(it.id)}
          />
        ))}

        {!collapsed && (
          <>
            <div className="px-3 pt-6 pb-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted">Equipo</div>
            <div className="px-3 space-y-2">
              {TEAM.slice(0, 5).map(u => (
                <div key={u.id} className="flex items-center gap-2.5 py-1">
                  <div className="relative">
                    <Avatar user={u} size={26} />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#3CB371] ring-2 ring-white dark:ring-[#1A1A18]" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[12.5px] font-medium">{u.name}</div>
                    <div className="text-[10.5px] text-muted">{u.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {collapsed && (
          <div className="pt-6 flex flex-col items-center gap-2">
            <div className="w-6 h-px bg-line2" />
            {TEAM.slice(0, 4).map(u => (
              <div key={u.id} className="relative" title={`${u.name} · ${u.role}`}>
                <Avatar user={u} size={28} />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#3CB371] ring-2 ring-white dark:ring-[#1A1A18]" />
              </div>
            ))}
          </div>
        )}
      </nav>

      <div className={`${collapsed ? 'px-2' : 'px-3'} py-3 border-t border-line2 space-y-0.5`}>
        <NavItem icon={<Ic.Settings width="18" height="18" />} label="Configuración" collapsed={collapsed} active={view === 'settings'} onClick={() => setView('settings')} />
        {!collapsed ? (
          <button onClick={onInvite} className="btn-press mt-3 mx-1 w-[calc(100%-8px)] p-3 rounded-md bg-tint border border-tint hover:border-zred/40 transition-colors text-left relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-zred/15 group-hover:bg-zred/25 transition-colors" />
            <div className="relative flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-zred text-white flex items-center justify-center shrink-0">
                <Ic.Plus width="14" height="14" />
              </div>
              <div>
                <div className="text-[12.5px] font-bold text-carbon leading-tight">Invitar al equipo</div>
                <div className="text-[11px] text-muted leading-snug mt-0.5">Suma colaboradores al workspace</div>
              </div>
            </div>
          </button>
        ) : (
          <button onClick={onInvite} title="Invitar al equipo" className="btn-press mt-2 w-full h-10 rounded-md bg-zred text-white inline-flex items-center justify-center hover:bg-zred2 transition-colors">
            <Ic.Plus width="16" height="16" />
          </button>
        )}
      </div>
    </aside>
  )
}

export function Topbar({ view, onOpenCommand, onOpenNotifs, onOpenUserMenu, userMenuRef }: any) {
  const titles: Record<string, { t: string; s: string }> = {
    dashboard:   { t: 'Dashboard',      s: 'Resumen del workspace y métricas en vivo' },
    kanban:      { t: 'Pendientes',     s: 'Tablero kanban — arrastra tarjetas entre columnas' },
    projects:    { t: 'Proyectos',      s: 'Seguimiento de todos los proyectos activos' },
    clients:     { t: 'Clientes',       s: 'Cartera de clientes y prospectos' },
    users:       { t: 'Usuarios',       s: 'Equipo, permisos y miembros del workspace' },
    settings:    { t: 'Configuración',  s: 'Gestiona tu cuenta, apariencia y equipo' },
    profile:     { t: 'Mi perfil',      s: 'Información de tu cuenta' },
    learning:    { t: 'Aprendizaje',    s: 'Materiales de estudio y desarrollo del equipo' },
  }
  const cur = titles[view] ?? { t: view, s: '' }

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-line2">
      <div className="flex items-center gap-4 px-8 h-[72px]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[12px] text-muted mb-0.5">
            <span>Zivelo</span>
            <span>›</span>
            <span className="text-carbon font-medium">{cur.t}</span>
          </div>
          <h1 className="text-[20px] font-bold tracking-tight leading-tight">{cur.t}</h1>
        </div>

        <button onClick={onOpenCommand}
          className="hidden md:flex items-center gap-2 h-10 px-4 rounded-full bg-soft border border-transparent hover:border-line transition-colors min-w-[280px] text-left">
          <Ic.Search width="16" height="16" className="text-muted" />
          <span className="text-[13.5px] text-muted flex-1">Buscar tarea, proyecto o cliente...</span>
          <kbd className="text-[10px] font-mono text-muted bg-white border border-line2 rounded px-1.5 py-0.5">⌘ K</kbd>
        </button>

        <IconButton onClick={onOpenNotifs}>
          <div className="relative">
            <Ic.Bell width="18" height="18" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-zred" />
          </div>
        </IconButton>

        <button ref={userMenuRef} onClick={onOpenUserMenu} className="btn-press rounded-full hover:ring-2 hover:ring-line transition-[box-shadow]">
          <Avatar user={TEAM[0]} size={36} />
        </button>
      </div>
    </header>
  )
}
