'use client'

import { useState, useMemo } from 'react'
import { Ic } from '@/components/icons'
import { Avatar, Button, Badge, Tag } from '@/components/ui'
import { formatDate, daysUntil } from '@/lib/constants'
import { MOCK_EVENTS, MOCK_PROFILES } from '@/lib/mock-roadmap'
import type { Task } from '@/lib/supabase/types'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAYS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

function getMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startPad = first.getDay()
  const totalDays = last.getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < startPad; i++) cells.push(null)
  for (let d = 1; d <= totalDays; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function getEventsForDay(events: typeof MOCK_EVENTS, year: number, month: number, day: number) {
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return events.filter(e => e.due === dateStr || e.start.startsWith(dateStr))
}

const COLORS_BY_TAG: Record<string, string> = {
  frontend: '#3A47B5', backend: '#1D1D1B', design: '#7A5A12',
  qa: '#B91C22', planning: '#6B6B6B', feature: '#D72228',
}

export default function Calendar({ tasks: _tasks, setView }: any) {
  const today = new Date()
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState<{ year: number; month: number; day: number } | null>(null)

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const grid = useMemo(() => getMonthGrid(year, month), [year, month])

  const events = MOCK_EVENTS

  const selectedEvents = selectedDay
    ? getEventsForDay(events, selectedDay.year, selectedDay.month, selectedDay.day)
    : []

  function prev() { setCursor(new Date(year, month - 1, 1)); setSelectedDay(null) }
  function next() { setCursor(new Date(year, month + 1, 1)); setSelectedDay(null) }
  function goToday() { setCursor(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDay(null) }

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const isSelected = (d: number) =>
    selectedDay?.day === d && selectedDay?.month === month && selectedDay?.year === year

  return (
    <div className="flex flex-col h-[calc(100vh-72px)]">
      <div className="px-8 pt-6 pb-4 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-[20px] font-bold tracking-tight">{MONTHS[month]} {year}</h1>
          <div className="flex items-center gap-1">
            <button type="button" onClick={prev}
              className="size-8 rounded-md border border-line hover:bg-soft inline-flex items-center justify-center text-muted transition-colors">
              <Ic.Up width="14" height="14" className="rotate-[-90deg]" />
            </button>
            <button type="button" onClick={next}
              className="size-8 rounded-md border border-line hover:bg-soft inline-flex items-center justify-center text-muted transition-colors">
              <Ic.Up width="14" height="14" className="rotate-90" />
            </button>
            <Button variant="ghost" size="sm" onClick={goToday}>Hoy</Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-soft rounded-lg p-0.5">
            <button type="button" onClick={() => setViewMode('month')}
              className={`px-3 h-8 rounded-md text-[12.5px] font-semibold transition-all ${
                viewMode === 'month' ? 'bg-white text-carbon shadow-soft' : 'text-muted hover:text-carbon'}`}>
              Mes
            </button>
            <button type="button" onClick={() => setViewMode('week')}
              className={`px-3 h-8 rounded-md text-[12.5px] font-semibold transition-all ${
                viewMode === 'week' ? 'bg-white text-carbon shadow-soft' : 'text-muted hover:text-carbon'}`}>
              Semana
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-0 min-h-0">
        <div className="flex-1 min-w-0 px-8 pb-6 flex flex-col">
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-[11px] font-semibold text-muted uppercase tracking-wider text-center py-2">{d}</div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 auto-rows-fr gap-px bg-line2 rounded-lg overflow-hidden">
            {grid.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} className="bg-soft/50 min-h-[90px]" />
              const dayEvents = getEventsForDay(events, year, month, day)
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => setSelectedDay({ year, month, day })}
                  className={`bg-white p-1.5 text-left transition-all hover:bg-soft/60 min-h-[90px] flex flex-col ${
                    isSelected(day) ? 'ring-2 ring-zred ring-inset z-10' : ''
                  } ${isToday(day) ? 'bg-tint/30' : ''}`}
                >
                  <span className={`inline-flex items-center justify-center size-6 rounded-full text-[12px] font-semibold mb-1 ${
                    isToday(day) ? 'bg-zred text-white' : 'text-carbon'
                  }`}>
                    {day}
                  </span>
                  <div className="flex-1 space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, 3).map(e => (
                      <div key={e.id}
                        className="text-[10px] font-semibold truncate rounded px-1 py-0.5 text-white leading-tight"
                        style={{ background: COLORS_BY_TAG[e.tag] || '#6B6B6B' }}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-muted font-medium pl-1">+{dayEvents.length - 3} más</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {selectedDay && (
          <div className="w-[320px] shrink-0 border-l border-line2 px-5 py-5 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[15px]">
                {selectedDay.day} de {MONTHS[selectedDay.month]}
              </h3>
              <button type="button" onClick={() => setSelectedDay(null)}
                className="size-7 rounded-md hover:bg-soft inline-flex items-center justify-center text-muted">
                <Ic.X width="14" height="14" />
              </button>
            </div>
            {selectedEvents.length === 0 ? (
              <div className="text-[13px] text-muted text-center py-8">Sin eventos este día</div>
            ) : (
              selectedEvents.map(e => (
                <div key={e.id} className="rounded-md border border-line2 p-3 space-y-2 hover:shadow-soft transition-shadow">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full" style={{ background: COLORS_BY_TAG[e.tag] || '#6B6B6B' }} />
                    <Tag tag={e.tag} />
                  </div>
                  <p className="text-[13px] font-semibold leading-snug">{e.title}</p>
                  <div className="flex items-center gap-2 text-[11px] text-muted">
                    <Ic.Clock width="12" height="12" />
                    {new Date(e.start).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    {' - '}
                    {new Date(e.end).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {e.assignee.length > 0 && (
                    <div className="flex items-center gap-1">
                      {e.assignee.map((uid: string) => {
                        const u = MOCK_PROFILES.find(p => p.id === uid)
                        return u ? <Avatar key={u.id} user={u} size={22} /> : null
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
