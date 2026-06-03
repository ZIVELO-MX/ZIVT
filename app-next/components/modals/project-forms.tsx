'use client'

import { useState } from 'react'
import { Ic } from '@/components/icons'
import { Avatar, Modal, Button, Input, Select } from '@/components/ui'
import { TAG_STYLES, TASK_TEMPLATES } from '@/lib/constants'
import { CustomDatePicker } from '@/components/controls'

const PROJECT_ACCENTS = ['#D72228', '#1D1D1B', '#2F4858', '#6B6B6B', '#B91C22', '#7A5A12', '#1E6B3C', '#3A47B5']
const EMPTY_TEAMS: any[] = []

export function NewProjectModal({ open, onClose, onCreate, clients, presetClient, teams = EMPTY_TEAMS, setTeams, profiles = [] }: any) {
  if (!open) return null
  return <NewProjectForm key={'np-' + (presetClient?.id || 'new')} onClose={onClose} onCreate={onCreate} clients={clients} presetClient={presetClient} teams={teams} setTeams={setTeams} profiles={profiles} />
}

function NewProjectForm({ onClose, onCreate, clients, presetClient, teams, setTeams, profiles = [] }: any) {
  const [form, setForm] = useState({
    id: '', name: '', description: '', kind: 'Web development',
    client: presetClient?.id || '',
    status: 'todo',
    start: new Date().toISOString().slice(0, 10), due: '',
    budget: 0, team: [], accent: '#D72228',
  })
  const [useTemplate, setUseTemplate] = useState(true)

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  const template = TASK_TEMPLATES[form.kind] ?? []

  function toggleMember(id: string) {
    set('team', form.team.includes(id) ? form.team.filter(x => x !== id) : [...form.team, id])
  }

  function applyTeam(wt: any) {
    const allIn = wt.members.every(m => form.team.includes(m))
    if (allIn) {
      set('team', form.team.filter(m => !wt.members.includes(m)))
    } else {
      set('team', Array.from(new Set([...form.team, ...wt.members])))
    }
  }

  function submit() {
    if (!form.name.trim()) return
    const pid = 'p' + Date.now()
    const templateTasks = useTemplate && template.length > 0
      ? template.map((t, i) => ({
          id: 'tt' + Date.now() + i,
          col: 'todo',
          project: pid,
          title: t.title,
          tag: t.tag,
          priority: t.priority,
          due: null,
          assignee: form.team.slice(0, 1),
          subtasks: [],
          comments: 0,
          progress: {},
        }))
      : []
    onCreate({
      id: pid,
      name: form.name.trim(),
      description: form.description.trim(),
      client: form.client || null,
      kind: form.kind,
      status: form.status,
      progress: form.status === 'done' ? 100 : form.status === 'review' ? 80 : 0,
      start: form.start, due: form.due || form.start,
      team: form.team,
      health: 'on_track',
      budget: Number(form.budget) || 0,
      spent: 0,
      tasksDone: 0, tasksTotal: 0,
      accent: form.accent,
    }, templateTasks)
    onClose()
  }

  return (
    <Modal open={true} onClose={onClose} title="Nuevo proyecto" width={600}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={submit} disabled={!form.name.trim()}>
          <Ic.Plus width="14" height="14" /> Crear proyecto
        </Button>
      </>}>
      <div className="space-y-5">

        <Input label="Nombre del proyecto" placeholder="Ej. Café Bruma — Web + reservas" value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus />

        <div>
          <label htmlFor="proj-desc" className="block text-[12px] font-semibold text-carbon mb-1.5 uppercase tracking-wider">
            Descripción <span className="text-muted font-normal normal-case tracking-normal">(opcional)</span>
          </label>
          <textarea
            id="proj-desc"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Contexto, objetivos, tecnologías, notas iniciales..."
            className="w-full rounded-md border border-line2 px-3 py-2.5 text-[13.5px] leading-relaxed resize-none outline-none focus:border-zred/50 focus:ring-2 focus:ring-zred/10 placeholder:text-muted transition-all"
            style={{ height: '72px' }}
            aria-label="Descripción del proyecto"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Tipo" value={form.kind} onChange={(e) => set('kind', e.target.value)}
            options={['Web development', 'Point of sale', 'Restaurant solutions', 'Web app', 'Producto interno', 'Consultoría', 'Otro'].map(v => ({ value: v, label: v }))} />
          <Select label="Cliente (opcional)" value={form.client} onChange={(e) => set('client', e.target.value)}
            options={[{ value: '', label: '— Proyecto interno —' }, ...clients.map(c => ({ value: c.id, label: c.name }))]} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <CustomDatePicker label="Inicio" value={form.start} onChange={(e) => set('start', e.target.value)} />
          <CustomDatePicker label="Entrega" value={form.due} onChange={(e) => set('due', e.target.value)} />
          <Input label="Presupuesto (MXN)" type="number" placeholder="0" value={form.budget} onChange={(e) => set('budget', e.target.value)} />
        </div>

        <Select label="Estado inicial" value={form.status} onChange={(e) => set('status', e.target.value)}
          options={[
            { value: 'todo',        label: 'Por iniciar' },
            { value: 'in_progress', label: 'En progreso' },
            { value: 'review',      label: 'En revisión' },
            { value: 'done',        label: 'Terminado' },
          ]} />

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[12px] font-semibold text-carbon uppercase tracking-wider">Equipo asignado</div>
            {teams.length === 0 && (
              <span className="text-[11.5px] text-muted">Crea grupos en Usuarios → Grupos</span>
            )}
          </div>

          {teams.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {teams.map((wt: any) => {
                const allIn = wt.members.every(m => form.team.includes(m))
                return (
                  <button key={wt.id} type="button" onClick={() => applyTeam(wt)}
                    className={`inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full border text-[12px] font-semibold transition-all ${allIn ? 'text-white border-transparent' : 'bg-white text-carbon border-line hover:border-[var(--tc)]/60'}`}
                    style={allIn ? { background: wt.color, borderColor: wt.color } : { '--tc': wt.color } as React.CSSProperties}>
                    <span className="size-2 rounded-full" style={{ background: allIn ? 'rgba(255,255,255,0.7)' : wt.color }} />
                    {wt.name}
                    <span className="opacity-60 text-[10.5px]">·{wt.members.length}</span>
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {profiles.map(u => {
              const on = form.team.includes(u.id)
              return (
                <button key={u.id} type="button" onClick={() => toggleMember(u.id)}
                  className={`flex items-center gap-2 pl-1 pr-3 h-9 rounded-full border transition-all ${on ? 'bg-carbon text-white border-carbon' : 'bg-white text-carbon border-line hover:border-zred/40'}`}>
                  <Avatar user={u} size={26} />
                  <span className="text-[12.5px] font-semibold">{u.name.split(' ')[0]}</span>
                  {on && <Ic.Check width="13" height="13" />}
                </button>
              )
            })}
          </div>
        </div>

        {template.length > 0 && (
          <div className="rounded-md border border-line2 overflow-hidden">
            <button type="button"
              onClick={() => setUseTemplate(v => !v)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${useTemplate ? 'bg-[#E6F4EA]' : 'bg-soft/60'}`}>
              <div className="flex items-center gap-2.5">
                <span className={`size-5 rounded border flex items-center justify-center transition-colors ${useTemplate ? 'bg-[#1E6B3C] border-[#1E6B3C]' : 'border-line bg-white'}`}>
                  {useTemplate && <Ic.Check width="11" height="11" className="text-white" />}
                </span>
                <span className="text-[13px] font-semibold">Usar lista de tareas predeterminada</span>
              </div>
              <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${useTemplate ? 'bg-[#1E6B3C] text-white' : 'bg-soft text-muted'}`}>
                {template.length} tareas
              </span>
            </button>

            {useTemplate && (
              <div className="px-4 py-3 space-y-1.5 border-t border-line2 max-h-48 overflow-y-auto scroll-thin">
                {template.map(t => {
                  const tagMeta = TAG_STYLES[t.tag]
                  return (
                    <div key={t.title} className="flex items-center gap-2.5 py-1">
                      <span className="size-4 rounded-full border border-line flex items-center justify-center shrink-0">
                        <span className="size-1.5 rounded-full bg-muted" />
                      </span>
                      <span className="flex-1 text-[12.5px] text-carbon">{t.title}</span>
                      {tagMeta && (
                        <span className={`text-[10.5px] font-semibold px-1.5 py-0.5 rounded ${tagMeta.cls}`}>{tagMeta.label}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div>
          <div className="text-[12px] font-semibold text-carbon mb-2 uppercase tracking-wider">Color de acento</div>
          <div className="flex gap-2">
            {PROJECT_ACCENTS.map(c => (
              <button key={c} type="button" onClick={() => set('accent', c)} aria-label={`Color ${c}`}
                className={`size-8 rounded-md transition-transform ${form.accent === c ? 'ring-2 ring-offset-2 ring-carbon scale-110' : 'hover:scale-105'}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>

      </div>
    </Modal>
  )
}
