'use client'

import { useState, useEffect } from 'react'
import { Ic } from '@/components/icons'
import { Avatar, Button } from '@/components/ui'
import { ConfirmDialog } from '@/components/modals'
import { useCurrentProfile } from '@/lib/supabase/useCurrentProfile'
import type { Profile } from '@/lib/supabase/types'

// ─── Shared helpers ────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: string }) {
  return <h2 className="text-[18px] font-bold tracking-tight mb-5">{children}</h2>
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-line2 last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-carbon">{label}</div>
        {description && <div className="text-[12.5px] text-muted mt-0.5 leading-snug">{description}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`inline-flex items-center w-11 h-6 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-zred ${
        checked ? 'bg-zred' : 'bg-soft border border-line'
      }`}
    >
      <span className={`size-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  )
}

// ─── Section: Cuenta ────────────────────────────────────────────────────────────

function AccountSection({ toast }: { toast: (msg: string) => void }) {
  const user = useCurrentProfile()

  if (!user) {
    return (
      <div>
        <SectionHeading>Cuenta</SectionHeading>
        <div className="bg-white border border-line2 rounded-lg overflow-hidden p-8 text-center text-muted">
          Cargando información de la cuenta...
        </div>
      </div>
    )
  }

  return (
    <div>
      <SectionHeading>Cuenta</SectionHeading>
      <div className="bg-white border border-line2 rounded-lg overflow-hidden">
        <div className="p-5 flex items-center gap-4 border-b border-line2">
          <Avatar user={user} size={56} />
          <div>
            <div className="font-bold text-[16px]">{user.name}</div>
            <div className="text-[13px] text-muted">{user.email}</div>
            <div className="text-[12px] text-muted mt-0.5">{user.role} · {user.permission}</div>
          </div>
        </div>
        <SettingRow label="Nombre completo" description="Visible para todos los miembros del workspace">
          <Button variant="secondary" size="sm" onClick={() => toast('Próximamente disponible')}>Editar</Button>
        </SettingRow>
        <SettingRow label="Correo electrónico" description="Tu dirección de inicio de sesión">
          <span className="text-[13px] text-muted font-mono">{user.email}</span>
        </SettingRow>
        <SettingRow label="Contraseña" description="Actualiza tu contraseña de acceso">
          <Button variant="secondary" size="sm" onClick={() => toast('Próximamente disponible')}>Cambiar</Button>
        </SettingRow>
      </div>
    </div>
  )
}

// ─── Section: Apariencia ────────────────────────────────────────────────────────

const DENSITIES = [
  { value: 'compact' as const, label: 'Compacto', description: 'Más contenido en pantalla' },
  { value: 'default' as const, label: 'Normal', description: 'Balance recomendado' },
  { value: 'relaxed' as const, label: 'Amplio', description: 'Más espacio entre elementos' },
]

function AppearanceSection({
  dark, onToggleDark, density, setDensity,
}: {
  dark: boolean; onToggleDark: () => void
  density: string; setDensity: (d: 'compact' | 'default' | 'relaxed') => void
}) {
  return (
    <div>
      <SectionHeading>Apariencia</SectionHeading>
      <div className="bg-white border border-line2 rounded-lg overflow-hidden">
        <SettingRow label="Tema de color" description={dark ? 'Modo oscuro activo' : 'Modo claro activo'}>
          <Toggle checked={dark} onChange={onToggleDark} label="Activar modo oscuro" />
        </SettingRow>
        <SettingRow label="Densidad de UI" description="Ajusta el espaciado global de todos los elementos">
          <div className="flex items-center gap-1.5">
            {DENSITIES.map(d => (
              <button type="button" key={d.value} onClick={() => setDensity(d.value)} title={d.description}
                className={`px-3 h-8 rounded-full text-[12.5px] font-semibold border transition-all ${
                  density === d.value
                    ? 'bg-carbon text-white border-carbon'
                    : 'bg-white text-carbon border-line hover:border-zred/40'
                }`}>
                {d.label}
              </button>
            ))}
          </div>
        </SettingRow>
      </div>
    </div>
  )
}

// ─── Section: Notificaciones ────────────────────────────────────────────────────

const NOTIF_ROWS = [
  { key: 'mentions', label: 'Menciones', description: 'Cuando alguien te menciona en una tarea' },
  { key: 'assignments', label: 'Asignaciones', description: 'Cuando te asignan una tarea nueva' },
  { key: 'comments', label: 'Comentarios', description: 'Comentarios en tareas donde participas' },
  { key: 'reviews', label: 'Revisiones', description: 'Cuando marcan una tarea para revisión' },
  { key: 'done', label: 'Completadas', description: 'Cuando se completan tus tareas asignadas' },
]

function NotificationsSection({ toast }: { toast: (msg: string) => void }) {
  const [prefs, setPrefs] = useState({ mentions: true, assignments: true, comments: true, reviews: false, done: false })
  function toggle(key: string) {
    setPrefs(p => ({ ...p, [key]: !p[key] }))
    toast('Preferencias guardadas')
  }
  return (
    <div>
      <SectionHeading>Notificaciones</SectionHeading>
      <div className="bg-white border border-line2 rounded-lg overflow-hidden">
        {NOTIF_ROWS.map(row => (
          <SettingRow key={row.key} label={row.label} description={row.description}>
            <Toggle checked={prefs[row.key]} onChange={() => toggle(row.key)} label={row.label} />
          </SettingRow>
        ))}
      </div>
    </div>
  )
}

// ─── Section: Equipo ────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  active: '#3CB371', invited: '#E0B84A', suspended: '#9B9B98',
}
const STATUS_LABEL: Record<string, string> = {
  active: 'Activo', invited: 'Invitado', suspended: 'Suspendido',
}

function TeamSection({ toast, profiles = [] }: { toast: (msg: string) => void; profiles?: Profile[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <SectionHeading>Equipo</SectionHeading>
        <Button variant="secondary" size="sm" onClick={() => toast('Invitación — próximamente')}>
          <Ic.Plus width="14" height="14" /> Invitar
        </Button>
      </div>
      <div className="bg-white border border-line2 rounded-lg overflow-hidden divide-y divide-line2">
        {profiles.map(u => (
          <div key={u.id} className="flex items-center gap-3 px-5 py-3.5">
            <div className="relative">
              <Avatar user={u} size={38} />
              <span
                className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-white dark:ring-[#1A1A18]"
                style={{ background: STATUS_COLOR[u.status] }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold truncate">{u.name}</div>
              <div className="text-[12px] text-muted">{u.role} · {u.email}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11.5px] text-muted bg-soft px-2.5 py-1 rounded-full font-medium capitalize">{u.permission}</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                u.status === 'active' ? 'bg-[#E6F4EA] text-[#1E6B3C]' :
                u.status === 'invited' ? 'bg-[#FFF4DE] text-[#7A5A12]' :
                'bg-soft text-muted'
              }`}>{STATUS_LABEL[u.status]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Section: Peligro ────────────────────────────────────────────────────────────

function DangerSection({ onDeleteAccount }: { onDeleteAccount: () => void }) {
  return (
    <div>
      <SectionHeading>Zona de peligro</SectionHeading>
      <div className="bg-white border border-tint rounded-lg overflow-hidden">
        <SettingRow
          label="Eliminar cuenta"
          description="Esta acción es irreversible. Perderás todo el acceso y tus datos serán eliminados permanentemente."
        >
          <Button variant="danger" size="sm" onClick={onDeleteAccount}>
            <Ic.Trash width="14" height="14" /> Eliminar cuenta
          </Button>
        </SettingRow>
      </div>
    </div>
  )
}

// ─── Nav sections ────────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: 'account', label: 'Cuenta', icon: <Ic.Users width="16" height="16" /> },
  { id: 'appearance', label: 'Apariencia', icon: <Ic.Sparkle width="16" height="16" /> },
  { id: 'notifications', label: 'Notificaciones', icon: <Ic.Bell width="16" height="16" /> },
  { id: 'team', label: 'Equipo', icon: <Ic.Users width="16" height="16" /> },
  { id: 'danger', label: 'Peligro', icon: <Ic.Trash width="16" height="16" /> },
]

// ─── Main export ─────────────────────────────────────────────────────────────────

export function SettingsView({ dark, onToggleDark, density, setDensity, profiles = [] }: {
  dark: boolean; onToggleDark: () => void
  density: string; setDensity: (d: 'compact' | 'default' | 'relaxed') => void
  profiles?: Profile[]
}) {
  const [section, setSection] = useState('appearance')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!toastMsg) return
    const t = setTimeout(() => setToastMsg(null), 2500)
    return () => clearTimeout(t)
  }, [toastMsg])

  return (
    <div className="p-4 md:p-8 max-w-[960px] mx-auto">
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">

        {/* Nav — horizontal scroll on mobile, vertical on desktop */}
        <nav className="md:w-[200px] md:shrink-0" aria-label="Secciones de configuración">
          <div className="flex md:flex-col gap-1 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {NAV_SECTIONS.map(s => (
            <button type="button" key={s.id} onClick={() => setSection(s.id)}
              className={`shrink-0 flex items-center gap-2 md:gap-3 px-3 h-9 rounded-md text-[13px] md:text-[13.5px] font-medium transition-colors text-left whitespace-nowrap
                ${section === s.id ? 'bg-carbon text-white' : 'text-carbon hover:bg-soft'}`}>
              <span className={section === s.id ? 'text-white' : 'text-muted'}>{s.icon}</span>
              {s.label}
            </button>
          ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 pop-in" key={section}>
          {section === 'account'       && <AccountSection toast={setToastMsg} />}
          {section === 'appearance'    && <AppearanceSection dark={dark} onToggleDark={onToggleDark} density={density} setDensity={setDensity} />}
          {section === 'notifications' && <NotificationsSection toast={setToastMsg} />}
          {section === 'team'          && <TeamSection toast={setToastMsg} profiles={profiles} />}
          {section === 'danger'        && <DangerSection onDeleteAccount={() => setConfirmDelete(true)} />}
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] bg-carbon text-white px-5 py-2.5 rounded-full shadow-pop text-[13px] font-semibold pop-in pointer-events-none">
          {toastMsg}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="¿Eliminar cuenta?"
        message="Esta acción es permanente e irreversible. Se eliminarán todos tus datos, proyectos y acceso al workspace."
        confirmLabel="Sí, eliminar"
        tone="danger"
        onConfirm={() => { setConfirmDelete(false); setToastMsg('Función no disponible en modo demo') }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
