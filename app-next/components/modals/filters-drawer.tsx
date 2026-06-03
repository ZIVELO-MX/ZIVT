'use client'

import { Avatar, Drawer, Button, Select } from '@/components/ui'
import { TAG_STYLES, PRIORITY } from '@/lib/constants'

function toggle<T>(arr: T[], v: T): T[] { return arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v] }

export function FiltersDrawer({ open, onClose, context = 'kanban', value, onChange, onApply, onReset, profiles = [] }: any) {
  if (!open) return null
  const tagKeys = Object.keys(TAG_STYLES)

  return (
    <Drawer open={open} onClose={onClose} title="Filtros avanzados" width={420}
      footer={
        <div className="flex justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => { onReset() }}>Limpiar</Button>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={() => { onApply(); onClose() }}>Aplicar filtros</Button>
          </div>
        </div>
      }>
      <div className="px-6 py-5 space-y-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">Asignados a</div>
          <div className="flex flex-wrap gap-2">
            {profiles.map(u => {
              const on = value.assignees.includes(u.id)
              return (
                <button type="button" key={u.id} onClick={() => onChange({ ...value, assignees: toggle(value.assignees, u.id) })}
                  className={`flex items-center gap-2 pl-1 pr-3 h-9 rounded-full border transition-all ${on ? 'bg-carbon text-white border-carbon' : 'bg-white border-line hover:border-zred/40'}`}>
                  <Avatar user={u} size={26} />
                  <span className="text-[12.5px] font-semibold">{u.name.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>
        </div>

        {context === 'kanban' && (
          <>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">Etiquetas</div>
              <div className="flex flex-wrap gap-2">
                {tagKeys.map(k => {
                  const on = value.tags.includes(k)
                  return (
                    <button type="button" key={k} onClick={() => onChange({ ...value, tags: toggle(value.tags, k) })}
                      className={`px-3 h-8 rounded-full border text-[12.5px] font-semibold transition-all ${on ? 'bg-carbon text-white border-carbon' : 'bg-white text-carbon border-line hover:border-zred/40'}`}>
                      {TAG_STYLES[k].label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">Prioridad</div>
              <div className="flex gap-2">
                {Object.keys(PRIORITY).map(k => {
                  const on = value.priorities.includes(k)
                  const p = PRIORITY[k]
                  return (
                    <button type="button" key={k} onClick={() => onChange({ ...value, priorities: toggle(value.priorities, k) })}
                      className={`inline-flex items-center gap-2 px-3 h-9 rounded-full border text-[12.5px] font-semibold transition-all ${on ? 'bg-carbon text-white border-carbon' : 'bg-white text-carbon border-line hover:border-zred/40'}`}>
                      <span className={`size-1.5 rounded-full ${p.dot}`} />
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">Vencimiento</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { k: 'all',     l: 'Cualquier fecha' },
                  { k: 'overdue', l: 'Atrasadas' },
                  { k: 'today',   l: 'Hoy' },
                  { k: 'week',    l: 'Esta semana' },
                  { k: 'none',    l: 'Sin fecha' },
                ].map(o => (
                  <button type="button" key={o.k} onClick={() => onChange({ ...value, due: o.k })}
                    className={`px-3 h-9 rounded-full border text-[12.5px] font-semibold transition-all ${value.due === o.k ? 'bg-carbon text-white border-carbon' : 'bg-white text-carbon border-line hover:border-zred/40'}`}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">Ordenar por</div>
          <Select value={value.sort} onChange={(e) => onChange({ ...value, sort: e.target.value })}
            options={[
              { value: 'recent',   label: 'Más recientes' },
              { value: 'due',      label: 'Por fecha de entrega' },
              { value: 'priority', label: 'Por prioridad' },
              { value: 'alpha',    label: 'Alfabético' },
            ]} />
        </div>
      </div>
    </Drawer>
  )
}
