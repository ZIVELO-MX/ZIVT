'use client'

import { useState, useEffect, useRef, useReducer, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Ic } from '@/components/icons'
import { Input, Select, Button, Card, Badge, AvatarStack, Drawer, Modal, Avatar } from './ui'
import { ConfirmDialog, NewProjectModal } from './modals'
import { STATUS_LABEL, TAG_STYLES, formatDate, formatMoney, daysUntil } from '@/lib/constants'
import { createClient, createProject, updateClient, deleteClient } from '@/lib/supabase/queries'
import { useRole } from '@/lib/supabase/useRole'
import { exportToCSV } from '@/lib/utils'

const INDUSTRIES = ['Restaurante','Retail','Construcción','Salud','Logística','SaaS','Educación','Servicios','Otro']
const CLIENT_COLORS = ['#D72228','#1D1D1B','#2F4858','#6B6B6B','#B91C22']
const CLIENT_FORM_EMPTY = { id:'', name:'', industry:'Restaurante', contact:'', email:'', phone:'', city:'', since: new Date().toISOString().slice(0,10), status:'lead', projects:0, mrr:0 }

function ClientForm({ client, onChange }: any) {
  const set = (k, v) => onChange({ ...client, [k]: v })
  return (
    <div className="space-y-4">
      <Input label="Empresa" placeholder="Nombre del negocio" value={client.name} onChange={(e)=>set('name', e.target.value)}/>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Industria" value={client.industry} onChange={(e)=>set('industry', e.target.value)}
          options={INDUSTRIES.map(i => ({ value: i, label: i }))}/>
        <Select label="Estado" value={client.status} onChange={(e)=>set('status', e.target.value)}
          options={[{value:'active',label:'Activo'},{value:'lead',label:'Prospecto'},{value:'paused',label:'Pausado'}]}/>
      </div>
      <Input label="Persona de contacto" placeholder="Ej. Lucía Romano" value={client.contact} onChange={(e)=>set('contact', e.target.value)}/>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Email" type="email" placeholder="contacto@empresa.com" value={client.email} onChange={(e)=>set('email', e.target.value)}/>
        <Input label="Teléfono" placeholder="+52 ..." value={client.phone} onChange={(e)=>set('phone', e.target.value)}/>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Ciudad" placeholder="Ej. León, GTO" value={client.city} onChange={(e)=>set('city', e.target.value)}/>
        <Input label="MRR (MXN)" type="number" placeholder="0" value={client.mrr} onChange={(e)=>set('mrr', Number(e.target.value) || 0)}/>
      </div>
    </div>
  )
}

function ClientRow({ client, onOpen, onEdit, onDelete }: any) {
  const initials = client.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
  const color = CLIENT_COLORS[Math.abs(parseInt(client.id.slice(1), 10) || 0) % CLIENT_COLORS.length]
  const status = STATUS_LABEL[client.status]

  return (
    <tr className="border-b border-line2 hover:bg-soft/50 transition-colors cursor-pointer" onClick={() => onOpen(client)}>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full flex items-center justify-center text-white font-bold text-[12px]" style={{background: color}}>
            {initials}
          </div>
          <div>
            <div className="font-semibold text-carbon">{client.name}</div>
            <div className="text-[11.5px] text-muted">{client.industry} · {client.city}</div>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="font-medium text-[13px]">{client.contact}</div>
        <div className="text-[11.5px] text-muted">{client.email}</div>
      </td>
      <td className="px-5 py-3.5"><Badge className={status.cls}>{status.label}</Badge></td>
      <td className="px-5 py-3.5 nums text-[13px]">{client.projects}</td>
      <td className="px-5 py-3.5 nums font-semibold text-[13px]">
        {client.mrr > 0 ? formatMoney(client.mrr).replace('MX$','$') : <span className="text-muted font-normal">-</span>}
      </td>
      <td className="px-5 py-3.5 text-[12px] text-muted nums">{formatDate(client.since)}</td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1 justify-end" onClick={(e)=>e.stopPropagation()}>
          <button type="button" onClick={() => onEdit(client)} className="size-8 rounded-full hover:bg-tint hover:text-zred flex items-center justify-center text-muted transition-colors">
            <Ic.Edit width="15" height="15"/>
          </button>
          <button type="button" onClick={() => onDelete(client.id)} className="size-8 rounded-full hover:bg-tint hover:text-zred flex items-center justify-center text-muted transition-colors">
            <Ic.Trash width="15" height="15"/>
          </button>
        </div>
      </td>
    </tr>
  )
}

function ClientDetailDrawer({ client, projects, onClose, onEdit, onNewProject }: any) {
  const clientAge = !client ? '...' : `${Math.max(1, Math.floor((Date.now() - new Date(client.since).getTime()) / (30*86400000)))}m`
  if (!client) return null
  const clientProjects = projects.filter(p => p.client === client.id)
  const initials = client.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
  const status = STATUS_LABEL[client.status]

  return (
    <Drawer open onClose={onClose} title="Detalle del cliente" width={520}
      footer={
        <div className="flex justify-between gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>Cerrar</Button>
          <Button variant="primary" size="sm" onClick={() => onEdit(client)}>
            <Ic.Edit width="14" height="14"/> Editar cliente
          </Button>
        </div>
      }>
      <div className="p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="size-14 rounded-md bg-carbon text-white flex items-center justify-center font-extrabold text-[18px]">
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="text-[20px] font-bold tracking-tight">{client.name}</h2>
            <div className="text-[13px] text-muted mb-2">{client.industry} · {client.city}</div>
            <Badge className={status.cls}>{status.label}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-md bg-soft">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted mb-1">Proyectos</div>
            <div className="text-[20px] font-extrabold nums">{client.projects}</div>
          </div>
          <div className="p-3 rounded-md bg-soft">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted mb-1">MRR</div>
            <div className="text-[20px] font-extrabold nums">{formatMoney(client.mrr).replace('MX$','$')}</div>
          </div>
          <div className="p-3 rounded-md bg-soft">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted mb-1">Antigüedad</div>
            <div className="text-[20px] font-extrabold nums">
              {clientAge}
            </div>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Contacto</div>
          <div className="rounded-md border border-line2 divide-y divide-line2">
            <div className="flex items-center gap-3 px-4 py-3">
              <Ic.Users width="16" height="16" className="text-muted"/>
              <span className="text-[13.5px] font-medium">{client.contact}</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <Ic.Mail width="16" height="16" className="text-muted"/>
              <a href={`mailto:${client.email}`} className="text-[13.5px] hover:text-zred">{client.email}</a>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <Ic.Phone width="16" height="16" className="text-muted"/>
              <span className="text-[13.5px]">{client.phone}</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <Ic.Calendar width="16" height="16" className="text-muted"/>
              <span className="text-[13.5px]">Cliente desde {formatDate(client.since)}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider">Proyectos asociados</div>
            <button type="button" onClick={() => onNewProject?.(client)} className="text-[12px] font-semibold text-zred hover:underline">+ Nuevo</button>
          </div>
          {clientProjects.length === 0 ? (
            <div className="rounded-md border border-dashed border-line p-4 text-center text-[13px] text-muted">
              Aún no hay proyectos vinculados a este cliente.
            </div>
          ) : (
            <div className="space-y-2">
              {clientProjects.map(p => {
                const status = STATUS_LABEL[p.status]
                return (
                  <div key={p.id} className="rounded-md border border-line2 p-3.5 flex items-center gap-3">
                    <span className="w-1.5 h-10 rounded-full shrink-0" style={{background: p.accent}}/>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[13.5px] truncate">{p.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className={status.cls}>{status.label}</Badge>
                        <span className="text-[11.5px] text-muted">{p.tasksDone}/{p.tasksTotal} tareas</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[14px] font-bold nums">{p.progress}%</div>
                    </div>
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

function ClientFormModal({ open, mode, initial, onClose, onSave }: any) {
  const [form, setForm] = useState(CLIENT_FORM_EMPTY)
  const formKey = open ? (initial?.id || '__new__') : '__closed__'
  const prevFormKey = useRef(formKey)
  if (formKey !== prevFormKey.current) {
    prevFormKey.current = formKey
    setForm(initial ? { ...initial } : { ...CLIENT_FORM_EMPTY })
  }

  function submit() {
    if (!form.name.trim()) return
    onSave({ ...form, id: form.id || crypto.randomUUID() })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={mode === 'edit' ? 'Editar cliente' : 'Nuevo cliente'}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={submit}>
          {mode === 'edit' ? <><Ic.Check width="14" height="14"/> Guardar cambios</> : <><Ic.Plus width="14" height="14"/> Crear cliente</>}
        </Button>
      </>}>
      <ClientForm client={form} onChange={setForm}/>
    </Modal>
  )
}

export default function Clients({ clients, setClients, projects, setProjects }) {
  const router = useRouter()
  const role = useRole()
  const [page, setPage] = useReducer(
    (prev: any, next: any) => ({ ...prev, ...next }),
    { search: '', filter: 'all', openDetail: null, formOpen: false, formMode: 'new', editing: null, confirmDel: null, newProjectClient: null }
  )
  const canAccessClients = role === 'founder' || role === 'admin'

  if (role === null) {
    return (
      <div className="px-8 py-6">
        <Card className="p-8">
          <div className="max-w-xl">
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Clientes</div>
            <h2 className="text-[24px] font-extrabold tracking-tight mb-2">Cargando...</h2>
            <p className="text-[13.5px] text-muted leading-relaxed">
              Verificando permisos de acceso.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  if (!canAccessClients) {
    return (
      <div className="px-8 py-6">
        <Card className="p-8">
          <div className="max-w-xl">
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Clientes</div>
            <h2 className="text-[24px] font-extrabold tracking-tight mb-2">Acceso denegado</h2>
            <p className="text-[13.5px] text-muted leading-relaxed">
              Esta vista está disponible solo para usuarios founder o admin.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  const filtered = clients.filter(c => {
    if (page.filter !== 'all' && c.status !== page.filter) return false
    const q = page.search.toLowerCase()
    return !q || c.name.toLowerCase().includes(q) || c.contact.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  })

  function openNew()        { setPage({ editing: null, formMode: 'new', formOpen: true }) }
  function openEdit(client) { setPage({ editing: client, formMode: 'edit', formOpen: true, openDetail: null }) }
  async function handleSave(c) {
    const isNew = !clients.find(x => x.id === c.id)
    if (isNew) {
      setClients(prev => [...prev, c])
      try {
        const saved = await createClient(c)
        setClients(prev => prev.map(x => x.id === c.id ? saved : x))
        router.refresh()
      } catch {
        setClients(prev => prev.filter(x => x.id !== c.id))
      }
    } else {
      setClients(prev => prev.map(x => x.id === c.id ? c : x))
      updateClient(c.id, c)
        .then(saved => { setClients(prev => prev.map(x => x.id === saved.id ? saved : x)); router.refresh() })
        .catch(() => { setClients(prev => prev.map(x => x.id === c.id ? (clients.find(o => o.id === c.id) ?? x) : x)) })
    }
  }
  function handleDelete(id) { setPage({ confirmDel: clients.find(c => c.id === id) }) }
  function confirmDelete() {
    if (!page.confirmDel) return
    const snapshot = page.confirmDel
    setClients(prev => prev.filter(x => x.id !== snapshot.id))
    setPage({ confirmDel: null })
    deleteClient(snapshot.id).catch(() => {
      setClients(prev => [...prev, snapshot])
    })
  }
  function handleExportCSV() {
    exportToCSV(filtered.map(c => ({
      Empresa: c.name,
      Industria: c.industry,
      Contacto: c.contact,
      Email: c.email,
      Telefono: c.phone,
      Ciudad: c.city,
      Estado: STATUS_LABEL[c.status]?.label || c.status,
      Proyectos: c.projects,
      MRR: c.mrr,
      Cliente_desde: c.since,
    })), 'clientes-zivelo.csv')
  }

  const counts = {
    all: clients.length,
    active: clients.filter(c=>c.status==='active').length,
    lead: clients.filter(c=>c.status==='lead').length,
    paused: clients.filter(c=>c.status==='paused').length,
  }

  return (
    <div className="px-4 md:px-8 py-4 md:py-6 space-y-4 md:space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Cartera total</div>
          <div className="text-[28px] font-extrabold nums leading-none">{clients.length}</div>
          <div className="text-[12px] text-muted mt-1">cuentas registradas</div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Activos</div>
          <div className="text-[28px] font-extrabold nums leading-none text-[#1E6B3C]">{counts.active}</div>
          <div className="text-[12px] text-muted mt-1">facturando este mes</div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Prospectos</div>
          <div className="text-[28px] font-extrabold nums leading-none text-zred">{counts.lead}</div>
          <div className="text-[12px] text-muted mt-1">en pipeline</div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">MRR total</div>
          <div className="text-[28px] font-extrabold nums leading-none">
            {formatMoney(clients.reduce((s,c)=>s+c.mrr,0)).replace('MX$','$')}
          </div>
          <div className="text-[12px] text-muted mt-1">recurrente mensual</div>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-white border border-line rounded-full p-1">
          {[
            {id:'all',label:'Todos', n: counts.all},
            {id:'active',label:'Activos', n: counts.active},
            {id:'lead',label:'Prospectos', n: counts.lead},
            {id:'paused',label:'Pausados', n: counts.paused},
          ].map(t => (
            <button type="button" key={t.id} onClick={()=>setPage({ filter: t.id })}
              className={`px-3 h-8 rounded-full text-[12.5px] font-semibold inline-flex items-center gap-1.5 ${page.filter===t.id?'bg-carbon text-white':'text-muted hover:text-carbon'}`}>
              {t.label}
              <span className={`px-1.5 rounded-full text-[10.5px] nums ${page.filter===t.id?'bg-white/15':'bg-soft'}`}>{t.n}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 h-9 px-3.5 rounded-full bg-white border border-line">
          <Ic.Search width="14" height="14" className="text-muted"/>
          <input value={page.search} onChange={(e)=>setPage({ search: e.target.value })} placeholder="Buscar por nombre, contacto o email..." aria-label="Buscar clientes" className="bg-transparent outline-none text-[13px] w-72"/>
        </div>
        <div className="flex-1"/>
        <Button variant="secondary" onClick={handleExportCSV}><Ic.Filter width="14" height="14"/> Exportar CSV</Button>
        <Button variant="primary" onClick={openNew}><Ic.Plus width="15" height="15"/> Nuevo cliente</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-[13px]">
          <thead className="bg-soft border-b border-line2">
            <tr className="text-left">
              <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted">Cliente</th>
              <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted">Contacto</th>
              <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted">Estado</th>
              <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted">Proyectos</th>
              <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted">MRR</th>
              <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted">Cliente desde</th>
               <th className="px-5 py-3 text-right" aria-label="Acciones"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <ClientRow
                key={c.id}
                client={c}
                onOpen={(c) => setPage({ openDetail: c })}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-muted">
            <div className="text-[14px] font-medium mb-1">Sin resultados</div>
            <div className="text-[12.5px]">Ajusta el filtro o crea un nuevo cliente.</div>
          </div>
        )}
      </Card>

      <ClientDetailDrawer client={page.openDetail} projects={projects} onClose={()=>setPage({ openDetail: null })} onEdit={openEdit}
        onNewProject={(c) => { setPage({ openDetail: null, newProjectClient: c }); }} />
      <ClientFormModal open={page.formOpen} mode={page.formMode} initial={page.editing} onClose={()=>setPage({ formOpen: false })} onSave={handleSave}/>
      <ConfirmDialog
        open={!!page.confirmDel}
        title="¿Eliminar este cliente?"
        message={page.confirmDel ? `Estás a punto de eliminar a ${page.confirmDel.name}. Los proyectos asociados quedarán sin cliente. Esta acción no se puede deshacer.` : ''}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setPage({ confirmDel: null })}
      />
      <NewProjectModal open={!!page.newProjectClient} clients={clients} presetClient={page.newProjectClient}
        onClose={() => setPage({ newProjectClient: null })}
        onCreate={async (p) => {
          try {
            const created = await createProject(p)
            setProjects(prev => [created, ...prev])
          } catch {
            setProjects(prev => [p, ...prev])
          }
          setPage({ newProjectClient: null })
        }} />
    </div>
  )
}
