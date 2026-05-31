'use client'

import { useState, useEffect, useRef, useReducer, useMemo } from 'react'
import { Ic } from '@/components/icons'
import { Avatar, Badge, Button, Card, Input, Select, Drawer, Modal, Tag } from './ui'
import { ConfirmDialog } from './modals'
import { TASKS_INIT, PROJECTS_INIT, WORK_TEAMS_INIT, USER_STATUS, PERMISSIONS, formatDate } from '@/lib/data'
import type { WorkTeam } from '@/lib/data'
import type { Profile } from '@/lib/supabase/types'
import { updateProfile } from '@/lib/supabase/queries'
import { AvatarStack } from './ui'

const ROLES_OPTIONS = ['Founder','Frontend','Backend','Diseño','QA','Marketing','Developer','Project Manager','Otro']
const USER_COLORS = ['#D72228','#1D1D1B','#6B6B6B','#B91C22','#2F4858','#7A5A12','#3A47B5','#1E6B3C']

function UserAvatarLarge({ user, size = 56 }: any) {
  return (
    <div
      className="rounded-md flex items-center justify-center text-white font-extrabold shrink-0"
      style={{ width:size, height:size, background:user.color, fontSize: size*0.34 }}
    >
      {user.initials}
    </div>
  )
}

function UserRow({ user, onOpen, onEdit, onDelete, onSuspend }: any) {
  const status = USER_STATUS[user.status]
  const perm = PERMISSIONS[user.permission]
  return (
    <tr className="border-b border-line2 hover:bg-soft/50 transition-colors cursor-pointer" onClick={() => onOpen(user)}>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar user={user} size={38}/>
            {user.status === 'active' && user.lastActive === 'En línea' && (
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-[#3CB371] ring-2 ring-white dark:ring-[#1A1A18]"/>
            )}
          </div>
          <div>
            <div className="font-semibold text-carbon">{user.name}</div>
            <div className="text-[11.5px] text-muted">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5 text-[13px] text-carbon">{user.role}</td>
      <td className="px-5 py-3.5"><Badge className={perm.cls}>{perm.label}</Badge></td>
      <td className="px-5 py-3.5"><Badge className={status.cls}>{status.label}</Badge></td>
      <td className="px-5 py-3.5 text-[12.5px] text-muted nums">{user.lastActive}</td>
      <td className="px-5 py-3.5 text-[12.5px] text-muted nums">{formatDate(user.joined)}</td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1 justify-end" onClick={(e)=>e.stopPropagation()}>
          <button type="button" onClick={() => onEdit(user)} title="Editar"
            className="size-8 rounded-full hover:bg-tint hover:text-zred flex items-center justify-center text-muted transition-colors">
            <Ic.Edit width="15" height="15"/>
          </button>
          <button type="button" onClick={() => onSuspend(user)} title={user.status === 'suspended' ? 'Reactivar' : 'Suspender'}
            className="size-8 rounded-full hover:bg-soft flex items-center justify-center text-muted transition-colors">
            <Ic.Clock width="15" height="15"/>
          </button>
          <button type="button" onClick={() => onDelete(user)} title="Eliminar"
            className="size-8 rounded-full hover:bg-tint hover:text-zred flex items-center justify-center text-muted transition-colors">
            <Ic.Trash width="15" height="15"/>
          </button>
        </div>
      </td>
    </tr>
  )
}

function UserDetailDrawer({ user, onClose, onEdit, tasks: contextTasks, projects: contextProjects }: any) {
  const userAge = !user ? '...' : `${Math.max(1, Math.floor((Date.now() - new Date(user.joined).getTime()) / (30*86400000)))}m`
  if (!user) return null
  const tasksAssigned = (contextTasks || TASKS_INIT).filter((t: any) => t.assignee.includes(user.id) && t.col !== 'done')
  const projectsCount = (contextProjects || PROJECTS_INIT).filter((p: any) => p.team.includes(user.id)).length
  const status = USER_STATUS[user.status]
  const perm = PERMISSIONS[user.permission]

  return (
    <Drawer open onClose={onClose} title="Detalle del usuario" width={520}
      footer={
        <div className="flex justify-between gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>Cerrar</Button>
          <Button variant="primary" size="sm" onClick={() => onEdit(user)}>
            <Ic.Edit width="14" height="14"/> Editar usuario
          </Button>
        </div>
      }>
      <div className="p-6 space-y-6">
        <div className="flex items-start gap-4">
          <UserAvatarLarge user={user}/>
          <div className="flex-1">
            <h2 className="text-[20px] font-bold tracking-tight">{user.name}</h2>
            <div className="text-[13px] text-muted mb-2">{user.role}</div>
            <div className="flex items-center gap-2">
              <Badge className={status.cls}>{status.label}</Badge>
              <Badge className={perm.cls}>{perm.label}</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-md bg-soft">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted mb-1">Tareas abiertas</div>
            <div className="text-[20px] font-extrabold nums">{tasksAssigned.length}</div>
          </div>
          <div className="p-3 rounded-md bg-soft">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted mb-1">Proyectos</div>
            <div className="text-[20px] font-extrabold nums">{projectsCount}</div>
          </div>
          <div className="p-3 rounded-md bg-soft">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted mb-1">Antigüedad</div>
            <div className="text-[20px] font-extrabold nums">
              {userAge}
            </div>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Información</div>
          <div className="rounded-md border border-line2 divide-y divide-line2">
            <div className="flex items-center gap-3 px-4 py-3">
              <Ic.Mail width="16" height="16" className="text-muted"/>
              <a href={`mailto:${user.email}`} className="text-[13.5px] hover:text-zred">{user.email}</a>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <Ic.Phone width="16" height="16" className="text-muted"/>
              <span className="text-[13.5px]">{user.phone}</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <Ic.Calendar width="16" height="16" className="text-muted"/>
              <span className="text-[13.5px]">Miembro desde {formatDate(user.joined)}</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <Ic.Clock width="16" height="16" className="text-muted"/>
              <span className="text-[13.5px]">Última actividad: {user.lastActive}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Nivel de acceso</div>
          <div className="rounded-md border border-line2 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge className={perm.cls}>{perm.label}</Badge>
            </div>
            <div className="text-[13px] text-muted leading-relaxed">{perm.desc}</div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider">Tareas asignadas</div>
            <span className="text-[11.5px] text-muted">{tasksAssigned.length} abiertas</span>
          </div>
          {tasksAssigned.length === 0 ? (
            <div className="rounded-md border border-dashed border-line p-4 text-center text-[13px] text-muted">
              Sin tareas abiertas.
            </div>
          ) : (
            <div className="space-y-1.5">
              {tasksAssigned.slice(0, 5).map(t => {
                const p = PROJECTS_INIT.find(pr => pr.id === t.project)
                return (
                  <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-soft transition-colors">
                    <span className="w-1.5 h-8 rounded-full shrink-0" style={{background:p?.accent}}/>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium truncate">{t.title}</div>
                      <div className="text-[11.5px] text-muted truncate">{p?.name}</div>
                    </div>
                    <Tag tag={t.tag}/>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  )
}

function UserFormModal({ open, mode, initial, onClose, onSave }: any) {
  const [form, setForm] = useState(USER_FORM_EMPTY)
  const formKey = open ? (initial?.id || '__new__') : '__closed__'
  const prevFormKey = useRef(formKey)
  if (formKey !== prevFormKey.current) {
    prevFormKey.current = formKey
    setForm(initial ? { ...initial } : { ...USER_FORM_EMPTY })
  }

  function handleSet(k: string, v: string) {
    setForm(f => {
      const next = { ...f, [k]: v }
      if (k === 'name') {
        next.initials = v.split(' ').flatMap(w => w[0] || []).slice(0,2).join('').toUpperCase() || 'XX'
      }
      return next
    })
  }

  function submit() {
    if (!form.name.trim() || !form.email.trim()) return
    onSave({ ...form, id: form.id || ('u' + Date.now()) })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={mode === 'edit' ? 'Editar usuario' : 'Invitar nuevo miembro'} width={560}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={submit}>
          {mode === 'edit' ? <><Ic.Check width="14" height="14"/> Guardar cambios</> : <><Ic.Mail width="14" height="14"/> Enviar invitación</>}
        </Button>
      </>}>
      <div className="space-y-5">
        <div className="flex items-center gap-4 p-4 rounded-md bg-soft">
          <UserAvatarLarge user={form} size={56}/>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[15px] truncate">{form.name || 'Nombre del miembro'}</div>
            <div className="text-[12.5px] text-muted truncate">{form.email || 'email@zivelo.dev'}</div>
          </div>
          <div className="flex gap-1.5">
            {USER_COLORS.map(c => (
              <button key={c} type="button" onClick={() => handleSet('color', c)}
                aria-label={`Color ${c}`}
                className={`size-6 rounded-full transition-transform ${form.color === c ? 'ring-2 ring-offset-2 ring-carbon scale-110' : 'hover:scale-110'}`}
                style={{ background: c }}/>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Nombre completo" placeholder="Ej. Ana Ruiz" value={form.name} onChange={(e)=>handleSet('name', e.target.value)} autoFocus/>
          <Select label="Rol" value={form.role} onChange={(e)=>handleSet('role', e.target.value)}
            options={ROLES_OPTIONS.map(r => ({ value:r, label:r }))}/>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Email corporativo" type="email" placeholder="nombre@zivelo.dev" value={form.email} onChange={(e)=>handleSet('email', e.target.value)}/>
          <Input label="Teléfono" placeholder="+52 ..." value={form.phone} onChange={(e)=>handleSet('phone', e.target.value)}/>
        </div>

        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wider text-carbon mb-2">Nivel de acceso</div>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(PERMISSIONS).map(k => {
              const p = PERMISSIONS[k]
              const on = form.permission === k
              return (
                <button key={k} type="button" onClick={() => handleSet('permission', k)}
                  className={`p-3 rounded-md border text-left transition-all ${on ? 'border-zred bg-tint' : 'border-line hover:border-zred/40'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[13px]">{p.label}</span>
                    {on && <span className="size-5 rounded-full bg-zred text-white inline-flex items-center justify-center"><Ic.Check width="11" height="11"/></span>}
                  </div>
                  <div className="text-[11.5px] text-muted leading-snug">{p.desc}</div>
                </button>
              )
            })}
          </div>
        </div>

        {mode === 'edit' && (
          <Select label="Estado" value={form.status} onChange={(e)=>handleSet('status', e.target.value)}
            options={[
              {value:'active', label:'Activo'},
              {value:'invited', label:'Invitación enviada'},
              {value:'suspended', label:'Suspendido'},
            ]}/>
        )}

        {mode === 'new' && (
          <div className="rounded-md bg-tint border border-zred/15 p-3.5 flex items-start gap-3">
            <div className="size-8 rounded-full bg-zred text-white flex items-center justify-center shrink-0">
              <Ic.Mail width="15" height="15"/>
            </div>
            <div className="text-[12.5px] text-carbon leading-snug">
              <div className="font-bold mb-0.5">Se enviará una invitación por email</div>
              <div className="text-muted">El usuario recibirá un correo para crear su contraseña. Por seguridad, no se permiten registros públicos.</div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

const TEAM_COLORS = ['#D72228','#1D1D1B','#3A47B5','#1E6B3C','#7A5A12','#6B6B6B','#B91C22','#2F4858']

const TEAM_FORM_EMPTY = { id: '', name: '', color: '#3A47B5', members: [] as string[] }

const USER_FORM_EMPTY = {
  id:'', name:'', initials:'XX', color: USER_COLORS[0],
  email:'', phone:'', role:'Developer',
  status: 'invited', permission: 'editor',
  joined: new Date().toISOString().slice(0,10), lastActive: '—',
}

function TeamFormModal({ open, initial, onClose, onSave, users }: any) {
  const [form, setForm] = useState<{ id: string; name: string; color: string; members: string[] }>(TEAM_FORM_EMPTY)
  const prevFormKey = useRef<string | null>(null)
  const formKey = open ? (initial?.id || '__new__') : '__closed__'
  if (formKey !== prevFormKey.current) {
    prevFormKey.current = formKey
    setForm(initial ? { ...initial } : TEAM_FORM_EMPTY)
  }

  function toggleMember(id: string) {
    setForm(f => ({
      ...f,
      members: f.members.includes(id) ? f.members.filter(x => x !== id) : [...f.members, id],
    }))
  }

  function submit() {
    if (!form.name.trim() || form.members.length === 0) return
    onSave({ ...form, id: form.id || ('wt' + Date.now()) })
    onClose()
  }

  const isEdit = !!initial?.id

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar grupo' : 'Nuevo grupo'} width={520}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={submit} disabled={!form.name.trim() || form.members.length === 0}>
          {isEdit ? <><Ic.Check width="14" height="14"/> Guardar cambios</> : <><Ic.Plus width="14" height="14"/> Crear grupo</>}
        </Button>
      </>}>
      <div className="space-y-5">

        <div className="flex items-center gap-4 p-4 rounded-md bg-soft">
          <div className="size-14 rounded-md flex items-center justify-center shrink-0 transition-colors"
            style={{ background: form.color + '20' }}>
            <span className="text-[22px] font-extrabold tracking-tight" style={{ color: form.color }}>
              {form.name ? form.name.slice(0, 2).toUpperCase() : '??'}
            </span>
          </div>
          <div className="flex-1">
            <div className="font-bold text-[15px]">{form.name || 'Nombre del grupo'}</div>
            <div className="text-[12.5px] text-muted">{form.members.length} miembro{form.members.length !== 1 ? 's' : ''}</div>
          </div>
        </div>

        <Input label="Nombre del grupo" placeholder="Ej. Frontend, Backend, QA, Design..." value={form.name}
          onChange={(e: any) => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />

        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wider text-carbon mb-2">Color de grupo</div>
          <div className="flex gap-2">
            {TEAM_COLORS.map(c => (
              <button key={c} type="button" aria-label={`Color ${c}`} onClick={() => setForm(f => ({ ...f, color: c }))}
                className={`size-8 rounded-md transition-transform ${form.color === c ? 'ring-2 ring-offset-2 ring-carbon scale-110' : 'hover:scale-105'}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>

        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wider text-carbon mb-2">
            Miembros <span className="font-normal text-muted normal-case tracking-normal">(selecciona al menos uno)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {users.reduce((acc: any[], u: any) => {
              if (u.status === 'suspended') return acc
              const on = form.members.includes(u.id)
              acc.push(
                <button key={u.id} type="button" onClick={() => toggleMember(u.id)}
                  className={`flex items-center gap-2 pl-1 pr-3 h-9 rounded-full border transition-all ${on ? 'bg-carbon text-white border-carbon' : 'bg-white text-carbon border-line hover:border-zred/40'}`}>
                  <Avatar user={u} size={26} />
                  <span className="text-[12.5px] font-semibold">{u.name.split(' ')[0]}</span>
                  <span className="text-[11px] opacity-60">{u.role}</span>
                  {on && <Ic.Check width="13" height="13" />}
                </button>
              )
              return acc
            }, [])}
          </div>
        </div>

      </div>
    </Modal>
  )
}

export default function Users({ tasks, projects, teams: teamsProp, setTeams: setTeamsProp, users, setUsers }: any) {
  const usersRef = useRef(users);
  useEffect(() => { usersRef.current = users; }, [users]);
  const [teams, setTeams] = useState<WorkTeam[]>(teamsProp ?? WORK_TEAMS_INIT)
  const [page, setPage] = useReducer(
    (prev: any, next: any) => ({ ...prev, ...next }),
    { tab: 'members' as 'members' | 'teams', toast: '', search: '', filter: 'all', openDetail: null, formOpen: false, formMode: 'new', editing: null, confirmDel: null, teamFormOpen: false, editingTeam: null as WorkTeam | null, confirmDelTeam: null as WorkTeam | null }
  );
  const toastRef = useRef<number | undefined>(undefined);

  function saveTeam(wt: WorkTeam) {
    const updated = teams.find(t => t.id === wt.id)
      ? teams.map(t => t.id === wt.id ? wt : t)
      : [...teams, wt]
    setTeams(updated)
    setTeamsProp?.(updated)
  }

  function deleteTeam(wt: WorkTeam) {
    const updated = teams.filter(t => t.id !== wt.id)
    setTeams(updated)
    setTeamsProp?.(updated)
    setPage({ confirmDelTeam: null })
  }

  const counts = {
    all: users.length,
    active: users.filter(u => u.status === 'active').length,
    invited: users.filter(u => u.status === 'invited').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    admins: users.filter(u => u.permission === 'admin').length,
  }

  const filtered = users.filter(u => {
    if (page.filter !== 'all' && u.status !== page.filter) return false
    const q = page.search.toLowerCase()
    return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
  })

  function showToast(message: string) {
    setPage({ toast: message });
    if (toastRef.current) window.clearTimeout(toastRef.current);
    toastRef.current = window.setTimeout(() => setPage({ toast: '' }), 2200);
  }
  function openNew()       { setPage({ editing: null, formMode: 'new', formOpen: true }) }
  function openEdit(u)     { setPage({ editing: u, formMode: 'edit', formOpen: true, openDetail: null }) }
  function handleSave(u)   {
    const snapshot = usersRef.current;
    setUsers(prev => {
      const exists = prev.find(x => x.id === u.id)
      return exists ? prev.map(x => x.id === u.id ? u : x) : [...prev, u]
    })
    if (u.id) {
      updateProfile(u.id, {
        name: u.name,
        initials: u.initials,
        color: u.color,
        role: u.role,
        permission: u.permission,
        status: u.status,
        phone: u.phone,
      } as Partial<Profile>).catch(() => {
        setUsers(snapshot);
        showToast('Error al guardar el usuario');
      })
    }
  }
  function handleDelete(u) { setPage({ confirmDel: u }) }
  function confirmDelete() {
    const target = page.confirmDel;
    setPage({ confirmDel: null });
    if (!target) return;
    const snapshot = usersRef.current;
    setUsers(prev => prev.filter(x => x.id !== target.id));
    // No Supabase delete for profiles — auth user must be removed separately
  }
  function toggleSuspend(u) {
    const next = u.status === 'suspended' ? 'active' : 'suspended'
    const snapshot = usersRef.current;
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: next } : x));
    updateProfile(u.id, { status: next } as Partial<Profile>).catch(() => {
      setUsers(snapshot);
      showToast('Error al cambiar el estado');
    })
  }

  return (
    <div className="px-8 py-6 space-y-5">
      {page.toast && (
        <div className="fixed right-6 bottom-6 z-[80] rounded-md bg-carbon text-white shadow-pop px-4 py-3 text-[13px] font-semibold pop-in">
          {page.toast}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-line rounded-full p-1 w-fit">
        <button type="button" onClick={() => setPage({ tab: 'members' })}
          className={`px-4 h-8 rounded-full text-[12.5px] font-semibold inline-flex items-center gap-1.5 transition-all ${page.tab === 'members' ? 'bg-carbon text-white' : 'text-muted hover:text-carbon'}`}>
          Miembros
          <span className={`px-1.5 rounded-full text-[10.5px] nums ${page.tab === 'members' ? 'bg-white/15' : 'bg-soft'}`}>{users.length}</span>
        </button>
        <button type="button" onClick={() => setPage({ tab: 'teams' })}
          className={`px-4 h-8 rounded-full text-[12.5px] font-semibold inline-flex items-center gap-1.5 transition-all ${page.tab === 'teams' ? 'bg-carbon text-white' : 'text-muted hover:text-carbon'}`}>
          Grupos
          <span className={`px-1.5 rounded-full text-[10.5px] nums ${page.tab === 'teams' ? 'bg-white/15' : 'bg-soft'}`}>{teams.length}</span>
        </button>
      </div>

      {/* ── GRUPOS ── */}
      {page.tab === 'teams' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-bold tracking-tight">Grupos de trabajo</h2>
              <p className="text-[13px] text-muted">Los grupos permiten asignar equipos completos a nuevos proyectos con un solo clic.</p>
            </div>
            <Button variant="primary" onClick={() => { setPage({ editingTeam: null, teamFormOpen: true }) }}>
              <Ic.Plus width="15" height="15" /> Nuevo grupo
            </Button>
          </div>

          {teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="size-16 rounded-full bg-soft flex items-center justify-center text-muted mb-4">
                <Ic.Users width="28" height="28" />
              </div>
              <h3 className="text-[18px] font-bold tracking-tight mb-1">Sin grupos aún</h3>
              <p className="text-[14px] text-muted mb-4">Crea grupos para asignar equipos completos a proyectos de forma rápida.</p>
            <Button variant="primary" onClick={() => { setPage({ editingTeam: null, teamFormOpen: true }) }}>
                <Ic.Plus width="15" height="15" /> Crear primer grupo
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {teams.map(wt => {
                const members = wt.members.flatMap(id => { const u = users.find(u => u.id === id); return u ? [u] : [] })
                return (
                  <Card key={wt.id} hover className="p-5 relative overflow-hidden">
                    <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: wt.color }} />
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-md flex items-center justify-center shrink-0"
                          style={{ background: wt.color + '18' }}>
                          <span className="text-[13px] font-extrabold" style={{ color: wt.color }}>
                            {wt.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-[15px] leading-tight">{wt.name}</div>
                          <div className="text-[12px] text-muted">{members.length} miembro{members.length !== 1 ? 's' : ''}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => { setPage({ editingTeam: wt, teamFormOpen: true }) }}
                          className="size-8 rounded-full hover:bg-soft flex items-center justify-center text-muted transition-colors">
                          <Ic.Edit width="14" height="14" />
                        </button>
                        <button type="button" onClick={() => setPage({ confirmDelTeam: wt })}
                          className="size-8 rounded-full hover:bg-tint hover:text-zred flex items-center justify-center text-muted transition-colors">
                          <Ic.Trash width="14" height="14" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {members.map((u: any) => (
                        <div key={u.id} className="flex items-center gap-1.5 pl-1 pr-2.5 h-7 rounded-full bg-soft border border-line2">
                          <Avatar user={u} size={20} />
                          <span className="text-[11.5px] font-semibold">{u.name.split(' ')[0]}</span>
                          <span className="text-[10.5px] text-muted">{u.role}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-line2 pt-3">
                      <AvatarStack users={members} size={24} max={5} />
                      <button type="button" onClick={() => { setPage({ editingTeam: wt, teamFormOpen: true }) }}
                        className="text-[12px] font-semibold text-carbon inline-flex items-center gap-1 hover:text-zred transition-colors">
                        Editar grupo <Ic.Arrow width="11" height="11" />
                      </button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          <TeamFormModal
            open={page.teamFormOpen}
            initial={page.editingTeam}
            users={users}
            onClose={() => setPage({ teamFormOpen: false })}
            onSave={saveTeam}
          />
          <ConfirmDialog
            open={!!page.confirmDelTeam}
            title="¿Eliminar este grupo?"
            message={page.confirmDelTeam ? `Estás a punto de eliminar el grupo "${page.confirmDelTeam.name}". Los proyectos que ya lo usaron no se verán afectados.` : ''}
            confirmLabel="Sí, eliminar"
            cancelLabel="Cancelar"
            onConfirm={() => page.confirmDelTeam && deleteTeam(page.confirmDelTeam)}
            onCancel={() => setPage({ confirmDelTeam: null })}
          />
        </div>
      )}

      {/* ── MIEMBROS ── */}
      {page.tab === 'members' && <>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Miembros</div>
          <div className="text-[28px] font-extrabold nums leading-none">{users.length}</div>
          <div className="text-[12px] text-muted mt-1">en el workspace</div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Activos</div>
          <div className="text-[28px] font-extrabold nums leading-none text-[#1E6B3C]">{counts.active}</div>
          <div className="text-[12px] text-muted mt-1">con sesión disponible</div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Invitaciones</div>
          <div className="text-[28px] font-extrabold nums leading-none text-[#7A5A12]">{counts.invited}</div>
          <div className="text-[12px] text-muted mt-1">pendientes de aceptar</div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Administradores</div>
          <div className="text-[28px] font-extrabold nums leading-none text-zred">{counts.admins}</div>
          <div className="text-[12px] text-muted mt-1">con acceso total</div>
        </Card>
      </div>

      <div className="flex items-start gap-3 rounded-md border border-line2 bg-soft/50 px-4 py-3">
        <div className="size-8 rounded-full bg-carbon text-white flex items-center justify-center shrink-0">
          <Ic.Settings width="15" height="15"/>
        </div>
        <div className="flex-1 text-[12.5px] leading-relaxed">
          <span className="font-bold">Workspace privado.</span>{' '}
          <span className="text-muted">Los nuevos miembros solo pueden ingresar por invitación. El registro público está deshabilitado por seguridad.</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-white border border-line rounded-full p-1">
          {[
            {id:'all',       label:'Todos',       n: counts.all},
            {id:'active',    label:'Activos',     n: counts.active},
            {id:'invited',   label:'Invitados',   n: counts.invited},
            {id:'suspended', label:'Suspendidos', n: counts.suspended},
          ].map(t => (
            <button key={t.id} type="button" onClick={()=>setPage({ filter: t.id })}
              className={`px-3 h-8 rounded-full text-[12.5px] font-semibold inline-flex items-center gap-1.5 ${page.filter===t.id?'bg-carbon text-white':'text-muted hover:text-carbon'}`}>
              {t.label}
              <span className={`px-1.5 rounded-full text-[10.5px] nums ${page.filter===t.id?'bg-white/15':'bg-soft'}`}>{t.n}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 h-9 px-3.5 rounded-full bg-white border border-line">
          <Ic.Search width="14" height="14" className="text-muted"/>
          <input value={page.search} onChange={(e)=>setPage({ search: e.target.value })} placeholder="Buscar por nombre, email o rol..." aria-label="Buscar miembros" className="bg-transparent outline-none text-[13px] w-72"/>
        </div>
        <div className="flex-1"/>
        <Button variant="primary" onClick={openNew}><Ic.Plus width="15" height="15"/> Invitar miembro</Button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-[13px]">
          <thead className="bg-soft border-b border-line2">
            <tr className="text-left">
              <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted">Miembro</th>
              <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted">Rol</th>
              <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted">Acceso</th>
              <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted">Estado</th>
              <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted">Actividad</th>
              <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted">Ingreso</th>
              <th className="px-5 py-3 text-right" aria-label="Acciones"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <UserRow key={u.id} user={u}
                onOpen={(u) => setPage({ openDetail: u })} onEdit={openEdit}
                onDelete={handleDelete} onSuspend={toggleSuspend}/>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-muted">
            <div className="text-[14px] font-medium mb-1">Sin resultados</div>
            <div className="text-[12.5px]">Ajusta el filtro o invita a un nuevo miembro.</div>
          </div>
        )}
      </Card>

      <UserDetailDrawer user={page.openDetail} onClose={()=>setPage({ openDetail: null })} onEdit={openEdit} tasks={tasks} projects={projects}/>
      <UserFormModal open={page.formOpen} mode={page.formMode} initial={page.editing} onClose={()=>setPage({ formOpen: false })} onSave={handleSave}/>
      <ConfirmDialog
        open={!!page.confirmDel}
        title="¿Eliminar este miembro?"
        message={page.confirmDel ? `Estás a punto de remover a ${page.confirmDel.name} del workspace. Perderá acceso inmediatamente y sus tareas asignadas quedarán sin responsable.` : ''}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setPage({ confirmDel: null })}
      />

      </>}
    </div>
  )
}
