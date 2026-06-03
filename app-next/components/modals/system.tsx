'use client'

import { useState, useEffect, useRef } from 'react'
import { Ic } from '@/components/icons'
import { Drawer, Modal, Button, Input, Select } from '@/components/ui'

const DENSITIES = [
  { id: 'compact', label: 'Compacto', desc: 'Menos espacio, más contenido' },
  { id: 'default', label: 'Normal',   desc: 'Espaciado predeterminado' },
  { id: 'relaxed', label: 'Cómodo',   desc: 'Más espacio para respirar' },
]

const KEYBOARD_SHORTCUTS = [
  {
    title: 'Navegación',
    items: [
      { keys: ['⌘', 'K'], label: 'Abrir búsqueda rápida' },
      { keys: ['⌘', '/'], label: 'Mostrar atajos de teclado' },
      { keys: ['?'],       label: 'Mostrar atajos de teclado' },
      { keys: ['Esc'],     label: 'Cerrar modal o panel lateral' },
    ],
  },
  {
    title: 'General',
    items: [
      { keys: ['⌘', ','], label: 'Abrir preferencias' },
      { keys: ['⌘', 'P'], label: 'Ver mi perfil' },
    ],
  },
  {
    title: 'Kanban',
    items: [
      { keys: ['↑', '↓'], label: 'Navegar entre tareas' },
      { keys: ['↵'],       label: 'Abrir detalle de tarea' },
      { keys: ['Esc'],     label: 'Cerrar detalle de tarea' },
    ],
  },
  {
    title: 'Búsqueda',
    items: [
      { keys: ['↑', '↓'], label: 'Navegar resultados' },
      { keys: ['↵'],       label: 'Ir al resultado seleccionado' },
      { keys: ['Esc'],     label: 'Cerrar búsqueda' },
    ],
  },
]

export function InviteModal({ open, onClose, onSave }: any) {
  if (!open) return null
  return <InviteForm key="invite" onClose={onClose} onSave={onSave} />
}

function InviteForm({ onClose, onSave }: any) {
  const [form, setForm] = useState({ email: '', role: 'editor' })
  const [sent, setSent] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const timerRef = useRef(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  function submit() {
    const email = form.email.trim()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    const user = {
      id: 'u' + Date.now(),
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      initials: email.charAt(0).toUpperCase() + email.charAt(1).toUpperCase(),
      color: ['#D72228','#1D1D1B','#2F4858','#6B6B6B','#B91C22','#7A5A12','#3A47B5','#1E6B3C'][Math.floor(Math.random() * 8)],
      email, phone: '', role: 'Developer',
      status: 'invited', permission: form.role,
      joined: new Date().toISOString().slice(0, 10), lastActive: '—',
    }
    setSent(true)
    timerRef.current = setTimeout(() => { setSent(false); setForm({ email: '', role: 'editor' }); onSave?.(user); onClose() }, 800)
  }

  return (
    <Modal open={true} onClose={onClose} title="Invitar al equipo" width={480}
      footer={
        sent ? (
          <span className="flex items-center gap-2 text-[13px] font-semibold text-[#1E6B3C]"><Ic.Check width="16" height="16"/> Invitación enviada a {form.email}</span>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" onClick={submit} disabled={!form.email.trim()}>
              <Ic.Mail width="14" height="14"/> Enviar invitación
            </Button>
          </>
        )
      }>
      <div className="space-y-4">
        <p className="text-[13.5px] text-muted leading-relaxed">
          Enviaremos un correo de invitación al usuario para que se una al workspace.
        </p>
        <Input label="Email corporativo" type="email" placeholder="nombre@zivelo.dev" value={form.email} onChange={(e) => set('email', e.target.value)} autoFocus />
        <Select label="Rol de acceso" value={form.role} onChange={(e) => set('role', e.target.value)}
          options={[
            { value: 'admin',  label: 'Admin — Control total del workspace' },
            { value: 'editor', label: 'Editor — Crear y editar contenido' },
            { value: 'viewer', label: 'Lectura — Solo visualizar' },
          ]} />
        <div className="rounded-md bg-tint border border-zred/15 p-3.5 flex items-start gap-3">
          <div className="size-8 rounded-full bg-zred text-white flex items-center justify-center shrink-0">
            <Ic.Mail width="15" height="15"/>
          </div>
          <div className="text-[12.5px] text-carbon leading-snug">
            <div className="font-bold mb-0.5">Invitación por email</div>
            <div className="text-muted">El usuario recibirá un correo para crear su contraseña. El registro público está deshabilitado.</div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export function PreferencesDrawer({ open, onClose, dark, onToggleDark }: any) {
  if (!open) return null
  return <PreferencesContent key="prefs" onClose={onClose} dark={dark} onToggleDark={onToggleDark} />
}

function PreferencesContent({ onClose, dark, onToggleDark }: any) {
  const [density, setDensity] = useState(() => {
    try { return localStorage.getItem('zivelo-density') || 'default' } catch { return 'default' }
  })

  function changeDensity(v) {
    setDensity(v)
    try { localStorage.setItem('zivelo-density', v) } catch {}
    document.documentElement.setAttribute('data-density', v)
  }

  return (
    <Drawer open={true} onClose={onClose} title="Preferencias" width={420}
      footer={<Button variant="ghost" size="sm" onClick={onClose}>Cerrar</Button>}>
      <div className="px-6 py-5 space-y-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-3">Apariencia</div>
          <div className="rounded-md border border-line2 p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="font-semibold text-[13.5px]">Tema oscuro</div>
              <button type="button" onClick={onToggleDark} aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                className={`inline-flex items-center w-10 h-6 rounded-full transition-colors ${dark ? 'bg-zred' : 'bg-soft border border-line'}`}>
                <span className={`size-5 rounded-full bg-white transition-transform shadow-sm ${dark ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <p className="text-[12px] text-muted">{dark ? 'Modo oscuro activo' : 'Modo claro activo'}</p>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-3">Densidad de interfaz</div>
          <div className="space-y-2">
            {DENSITIES.map(d => (
              <button type="button" key={d.id} onClick={() => changeDensity(d.id)}
                className={`w-full text-left p-3.5 rounded-md border transition-all ${density === d.id ? 'border-zred bg-tint' : 'border-line hover:border-zred/40'}`}>
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-[13.5px]">{d.label}</div>
                  {density === d.id && <span className="size-5 rounded-full bg-zred text-white inline-flex items-center justify-center"><Ic.Check width="11" height="11"/></span>}
                </div>
                <div className="text-[12px] text-muted mt-0.5">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  )
}

export function KeyboardShortcutsModal({ open, onClose }: any) {
  return (
    <Modal open={open} onClose={onClose} title="Atajos de teclado" width={560}>
      <div className="space-y-5">
        {KEYBOARD_SHORTCUTS.map(section => (
          <div key={section.title}>
            <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted mb-2 px-1">{section.title}</div>
            <div className="bg-soft/50 rounded-lg overflow-hidden divide-y divide-line2">
              {section.items.map(item => (
                <div key={item.label} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[13.5px] text-carbon">{item.label}</span>
                  <div className="flex items-center gap-1">
                    {item.keys.map(k => (
                      <kbd key={k} className="font-mono text-[11px] text-carbon bg-white border border-line2 shadow-soft rounded px-2 py-0.5 min-w-[28px] text-center">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-line2 text-[12px] text-muted text-center">
        Más atajos disponibles próximamente
      </div>
    </Modal>
  )
}
