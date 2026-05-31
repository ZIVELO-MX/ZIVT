'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'

function parseIsoDate(iso) {
  if (!iso) return null
  const cleaned = iso.includes('T') ? iso.split('T')[0] : iso
  const [y, m, d] = cleaned.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function fmtIso(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function fmtPretty(d) {
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function sameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const WEEKDAYS_ES = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export function CustomSelect({ label, options, value, onChange, placeholder = 'Seleccionar...', disabled = undefined }: any) {
  const [open, setOpen] = useState(false)
  const [focusIdx, setFocusIdx] = useState(-1)
  const [coords, setCoords] = useState(null)
  const triggerRef = useRef(null)
  const panelRef = useRef(null)

  const selected = useMemo(() => options.find(o => o.value === value), [options, value])

  const updateCoords = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect()
    if (!r) return
    const needed = Math.min(280, options.length * 36 + 16)
    const spaceBelow = window.innerHeight - r.bottom
    const dropUp = spaceBelow < needed && r.top > needed
    setCoords({ left: r.left, top: dropUp ? r.top - 6 : r.bottom + 6, width: r.width, dropUp })
  }, [options.length])

  useEffect(() => {
    function onDoc(e) {
      if (!open) return
      if (triggerRef.current?.contains(e.target)) return
      if (panelRef.current?.contains(e.target)) return
      setOpen(false)
    }
    function onResize() { if (open) updateCoords() }
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
    }
  }, [open, updateCoords])

  function commit(idx) {
    const opt = options[idx]
    if (!opt) return
    onChange({ target: { value: opt.value } })
    setOpen(false)
  }

  function onKey(e) {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown'].includes(e.key)) { e.preventDefault(); setOpen(true) }
      return
    }
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false) }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setFocusIdx(i => Math.min(i + 1, options.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusIdx(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); commit(focusIdx) }
  }

  return (
    <div className="relative">
      {label && <span className="block text-[12px] font-semibold text-carbon mb-1.5 uppercase tracking-wider">{label}</span>}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => { const next = !open; setOpen(next); if (next) { updateCoords(); setFocusIdx(options.findIndex(o2 => o2.value === value)) } }}
        onKeyDown={onKey}
        className={`group relative w-full h-11 px-4 pr-10 rounded-md border border-line bg-white text-[14px] text-left flex items-center transition-all
          ${open ? 'border-zred shadow-[0_0_0_4px_rgba(215,34,40,0.12)]' : 'hover:border-zred/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className={`flex-1 truncate ${selected ? 'text-carbon' : 'text-muted'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <span className={`absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${open ? 'rotate-180' : ''}`}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && coords && createPortal(
        <div
          ref={panelRef}
          className="fixed z-[100] bg-white rounded-md border border-line2 shadow-pop py-1.5 max-h-[260px] overflow-y-auto scroll-thin"
          style={{
            left: coords.left,
            width: coords.width,
            ...(coords.dropUp ? { bottom: window.innerHeight - coords.top } : { top: coords.top }),
            animation: 'pop-in 180ms cubic-bezier(.2,.8,.2,1) both',
          }}
          role="listbox"
        >
          {options.map((o, i) => {
            const isSel = o.value === value
            const isFoc = i === focusIdx
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={isSel}
                onMouseEnter={() => setFocusIdx(i)}
                onClick={() => commit(i)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13.5px] text-left transition-colors
                  ${isFoc ? 'bg-tint' : ''}
                  ${isSel ? 'font-semibold text-carbon' : 'text-carbon'}`}
              >
                {o.swatch && <span className="size-2 rounded-full shrink-0" style={{ background: o.swatch }} />}
                <span className="flex-1 truncate">{o.label}</span>
                {isSel && (
                  <span className="text-zred">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m4 12 5 5L20 6" />
                    </svg>
                  </span>
                )}
              </button>
            )
          })}
        </div>,
        document.body
      )}
    </div>
  )
}

export function CustomDatePicker({ label, value, onChange, placeholder = 'Seleccionar fecha' }: any) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState(null)
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const sel = parseIsoDate(value)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const [view, setView] = useState(() => sel || today)

  function updateCoords() {
    const r = triggerRef.current?.getBoundingClientRect()
    if (!r) return
    const needed = 350
    const spaceBelow = window.innerHeight - r.bottom
    const dropUp = spaceBelow < needed && r.top > needed
    setCoords({ left: r.left, top: dropUp ? r.top - 6 : r.bottom + 6, width: r.width, dropUp })
  }

  useEffect(() => {
    function onDoc(e) {
      if (!open) return
      if (triggerRef.current?.contains(e.target)) return
      if (panelRef.current?.contains(e.target)) return
      setOpen(false)
    }
    function onKey(e) { if (e.key === 'Escape') setOpen(false) }
    function onResize() { if (open) updateCoords() }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
    }
  }, [open])

  function commit(d) {
    onChange({ target: { value: fmtIso(d) } })
    setOpen(false)
  }

  function clear() {
    onChange({ target: { value: '' } })
    setOpen(false)
  }

  const year = view.getFullYear()
  const month = view.getMonth()
  const firstDay = new Date(year, month, 1)
  const startWeekday = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()

  const cells = []
  for (let i = startWeekday - 1; i >= 0; i--) cells.push({ d: new Date(year, month - 1, daysInPrev - i), outside: true })
  for (let i = 1; i <= daysInMonth; i++) cells.push({ d: new Date(year, month, i), outside: false })
  while (cells.length < 42) {
    const last = cells[cells.length - 1].d
    const next = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1)
    cells.push({ d: next, outside: next.getMonth() !== month })
  }

  return (
    <div className="relative">
      {label && <span className="block text-[12px] font-semibold text-carbon mb-1.5 uppercase tracking-wider">{label}</span>}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => { const next = !open; setOpen(next); if (next) { updateCoords(); setView(sel || today) } }}
        className={`group relative w-full h-11 pl-10 pr-4 rounded-md border border-line bg-white text-[14px] text-left transition-all
          ${open ? 'border-zred shadow-[0_0_0_4px_rgba(215,34,40,0.12)]' : 'hover:border-zred/50'}`}
      >
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" />
          </svg>
        </span>
        <span className={`${sel ? 'text-carbon' : 'text-muted'}`}>
          {sel ? fmtPretty(sel) : placeholder}
        </span>
      </button>

      {open && coords && createPortal(
        <div
          ref={panelRef}
          className="fixed z-[100] w-[308px] bg-white rounded-md border border-line2 shadow-pop p-3"
          style={{
            left: coords.left,
            ...(coords.dropUp ? { bottom: window.innerHeight - coords.top } : { top: coords.top }),
            animation: 'pop-in 180ms cubic-bezier(.2,.8,.2,1) both',
          }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <button type="button" onClick={() => setView(new Date(year, month - 1, 1))}
              className="size-8 rounded-md text-muted hover:text-zred inline-flex items-center justify-center" aria-label="Anterior">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6" /></svg>
            </button>
            <div className="text-[13px] font-bold tracking-tight">
              {MONTHS_ES[month]} <span className="text-muted nums font-semibold">{year}</span>
            </div>
            <button type="button" onClick={() => setView(new Date(year, month + 1, 1))}
              className="size-8 rounded-md text-muted hover:text-zred inline-flex items-center justify-center" aria-label="Siguiente">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS_ES.map((w, i) => (
              <div key={`${w}-${i}`} className="text-center text-[10.5px] font-bold uppercase tracking-wider text-muted py-1.5">{w}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map(({ d, outside }) => {
              const isToday = sameDay(d, today)
              const isSel = sel && sameDay(d, sel)
              return (
                <button
                  key={fmtIso(d)}
                  type="button"
                  onClick={() => commit(d)}
                  className={`relative h-9 rounded-md text-[12.5px] font-medium nums transition-colors
                    ${outside ? 'text-muted/50' : 'text-carbon'}
                    ${isSel ? 'bg-zred text-white font-bold' : 'hover:bg-tint hover:text-zred'}
                    ${isToday && !isSel ? 'ring-1 ring-zred/40' : ''}`}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-line2">
            <button type="button" onClick={clear} className="text-[12px] font-semibold text-muted hover:text-zred">Limpiar</button>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setView(today); commit(today) }}
                className="px-3 h-8 rounded-full bg-soft text-[12.5px] font-semibold hover:bg-tint hover:text-zred transition-colors">
                Hoy
              </button>
              <button type="button" onClick={() => setOpen(false)}
                className="px-3 h-8 rounded-full bg-carbon text-white text-[12.5px] font-semibold hover:bg-[#1a1a1a] transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
