'use client'

import { useEffect } from 'react'
import { TAG_STYLES } from '@/lib/constants'
import { Ic } from '@/components/icons'

export function Avatar({ user, size = 28, ring = false }: any) {
  if (!user) return null
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white select-none ${ring ? 'ring-2 ring-white dark:ring-[#1A1A18]' : ''}`}
      style={{ width: size, height: size, background: user.color, fontSize: size * 0.4 }}
      title={user.name}
    >
      {user.initials}
    </div>
  )
}

export function AvatarStack({ users, max = 4, size = 26 }: any) {
  const visible = users.slice(0, max)
  const extra = users.length - visible.length
  return (
    <div className="flex gap-0">
      {visible.map((u, i) => (
        <div key={u.id} className={i > 0 ? '-ml-2' : ''}>
          <Avatar user={u} size={size} ring />
        </div>
      ))}
      {extra > 0 && (
        <div
          className="inline-flex items-center justify-center rounded-full bg-soft text-carbon font-semibold ring-2 ring-white dark:ring-[#1A1A18] -ml-2"
          style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
          +{extra}
        </div>
      )}
    </div>
  )
}

export function Badge({ children, className = '' }: any) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-tight ${className}`}>
      {children}
    </span>
  )
}

const BUTTON_SIZES = { sm: 'h-8 px-3 text-[13px]', md: 'h-10 px-4 text-[14px]', lg: 'h-12 px-5 text-[15px]' }
const BUTTON_VARIANTS = {
  primary: 'bg-zred text-white hover:shadow-red hover:-translate-y-px',
  secondary: 'bg-white text-carbon border border-line hover:border-zred hover:text-zred',
  ghost: 'bg-transparent text-carbon hover:bg-soft',
  dark: 'bg-carbon text-white hover:bg-black',
  danger: 'bg-white text-zred border border-tint hover:bg-tint',
}

export function Button({ children, variant = 'primary', size = 'md', className = '', ...rest }: any) {
  return (
    <button type="button"
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 ${BUTTON_SIZES[size]} ${BUTTON_VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function IconButton({ children, className = '', ...rest }: any) {
  return (
    <button type="button"
      {...rest}
      className={`inline-flex items-center justify-center size-9 rounded-full border border-line bg-white text-carbon hover:border-zred hover:text-zred transition-colors ${className}`}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '', hover = false, ...rest }: any) {
  return (
    <div {...rest} className={`bg-white border border-line rounded-lg ${hover ? 'transition-all hover:-translate-y-0.5 hover:shadow-card hover:border-zred/30' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function Input({ label, hint, error, className = '', ...rest }: any) {
  return (
    <label className="block">
      {label && <span className="block text-[12px] font-semibold text-carbon mb-1.5 uppercase tracking-wider">{label}</span>}
      <input
        {...rest}
        className={`w-full h-11 px-4 rounded-md border border-line bg-white text-[14px] placeholder:text-muted/70 transition-all ${className}`}
      />
      {hint && !error && <span className="block text-[12px] text-muted mt-1">{hint}</span>}
      {error && <span className="block text-[12px] text-zred mt-1 font-medium">{error}</span>}
    </label>
  )
}

export function Textarea({ label, ...rest }: any) {
  return (
    <label className="block">
      {label && <span className="block text-[12px] font-semibold text-carbon mb-1.5 uppercase tracking-wider">{label}</span>}
      <textarea
        {...rest}
        className="w-full px-4 py-3 rounded-md border border-line bg-white text-[14px] placeholder:text-muted/70 transition-all resize-none"
      />
    </label>
  )
}

export function Select({ label, options, ...rest }: any) {
  return (
    <label className="block">
      {label && <span className="block text-[12px] font-semibold text-carbon mb-1.5 uppercase tracking-wider">{label}</span>}
      <select
        {...rest}
        className="w-full h-11 px-4 rounded-md border border-line bg-white text-[14px] transition-all appearance-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%231D1D1B\' stroke-width=\'2\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )
}

export function Drawer({ open, onClose, title, children, footer, width = 460 }: any) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-carbon/30 fade-in cursor-default" onClick={onClose} aria-label="Cerrar" onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') onClose() }} />
      <div
        className="absolute right-0 top-0 h-full w-full bg-white border-l border-line shadow-pop flex flex-col"
        style={{ maxWidth: width, animation: 'drawer-in 280ms cubic-bezier(.2,.8,.2,1)' }}
      >
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-line2 shrink-0">
          <h3 className="font-semibold text-[16px]">{title}</h3>
          <button type="button" onClick={onClose} className="size-8 rounded-full hover:bg-soft inline-flex items-center justify-center">
            <Ic.X width="18" height="18" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scroll-thin min-h-0">{children}</div>
        {footer && <div className="px-4 md:px-6 py-4 border-t border-line2 bg-white shrink-0">{footer}</div>}
      </div>
    </div>
  )
}

export function Modal({ open, onClose, title, children, footer, width = 520 }: any) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button type="button" className="absolute inset-0 bg-carbon/30 fade-in cursor-default" onClick={onClose} aria-label="Cerrar" onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') onClose() }} />
      <div className="relative bg-white rounded-t-xl sm:rounded-lg shadow-pop border border-line2 pop-in flex flex-col w-full max-h-[92vh] sm:max-h-[88vh]" style={{ maxWidth: width }}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-line2 shrink-0">
          <h3 className="font-semibold text-[16px]">{title}</h3>
          <button type="button" onClick={onClose} className="size-8 rounded-full hover:bg-soft inline-flex items-center justify-center">
            <Ic.X width="18" height="18" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scroll-thin px-4 sm:px-6 py-5 min-h-0">{children}</div>
        {footer && <div className="px-4 sm:px-6 py-4 border-t border-line2 flex justify-end gap-2 shrink-0">{footer}</div>}
      </div>
    </div>
  )
}

export function ProgressBar({ value, color = '#D72228' }: any) {
  return (
    <div className="h-1.5 bg-soft rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: color }} />
    </div>
  )
}

export function Tag({ tag }: any) {
  const s = TAG_STYLES[tag] || { label: tag, cls: 'bg-soft text-carbon' }
  return <Badge className={s.cls}>{s.label}</Badge>
}
