'use client'

import { useState, useEffect, useRef } from 'react'
import { Ic } from '@/components/icons'
import { Avatar, Button } from '@/components/ui'
import type { Notification } from '@/lib/supabase/types'

const EMPTY_NOTIFICATIONS: Notification[] = []

const NOTIF_ICON: Record<string, { ic: React.ReactNode; bg: string; tx: string }> = {
  mention:  { ic: <Ic.Chat  width="13" height="13" />, bg: 'bg-tint',       tx: 'text-zred' },
  assigned: { ic: <Ic.Arrow width="13" height="13" />, bg: 'bg-[#EEF2FF]',  tx: 'text-[#3A47B5]' },
  comment:  { ic: <Ic.Chat  width="13" height="13" />, bg: 'bg-soft',       tx: 'text-carbon' },
  review:   { ic: <Ic.Clock width="13" height="13" />, bg: 'bg-[#FFF4DE]',  tx: 'text-[#7A5A12]' },
  done:     { ic: <Ic.Check width="13" height="13" />, bg: 'bg-[#E6F4EA]',  tx: 'text-[#1E6B3C]' },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs} h`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'ayer'
  if (days < 30) return `hace ${days} d`
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}

export function NotificationsDrawer({ open, onClose, notifications = EMPTY_NOTIFICATIONS, onMarkRead, onMarkAllRead, profiles = [], anchorRef }: any) {
  const [tab, setTab] = useState('all')
  const popRef = useRef(null)
  const unread = notifications.filter((n: Notification) => n.unread).length

  useEffect(() => {
    function onDown(e) {
      if (!open) return
      if (popRef.current?.contains(e.target)) return
      if (anchorRef?.current?.contains(e.target)) return
      onClose()
    }
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open, onClose, anchorRef])

  if (!open) return null

  const visible = tab === 'unread' ? notifications.filter((n: Notification) => n.unread) : notifications
  const groups: Record<string, Notification[]> = {}
  visible.forEach((n: Notification) => {
    const diff = Date.now() - new Date(n.createdAt).getTime()
    const hrs = Math.floor(diff / 3600000)
    const key = hrs < 24 ? 'Hoy' : hrs < 168 ? 'Esta semana' : 'Anteriores';
    (groups[key] = groups[key] || []).push(n)
  })

  return (
    <div ref={popRef} className="absolute right-4 md:right-[56px] top-[72px] z-40 w-[360px] max-w-[calc(100vw-32px)] bg-white rounded-lg border border-line2 shadow-pop pop-in overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 100px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-line2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[14.5px]">Notificaciones</span>
          {unread > 0 && <span className="px-1.5 rounded-full bg-zred text-white text-[10.5px] nums font-semibold">{unread}</span>}
        </div>
        <button type="button" onClick={onClose} className="size-7 rounded-full hover:bg-soft flex items-center justify-center text-muted transition-colors">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-1 bg-soft rounded-full p-1 w-fit">
          <button type="button" onClick={() => setTab('all')} className={`px-3 h-8 rounded-full text-[12.5px] font-semibold transition-colors ${tab === 'all' ? 'bg-white text-carbon shadow-soft' : 'text-muted hover:text-carbon'}`}>Todas</button>
          <button type="button" onClick={() => setTab('unread')} className={`px-3 h-8 rounded-full text-[12.5px] font-semibold inline-flex items-center gap-1.5 transition-colors ${tab === 'unread' ? 'bg-white text-carbon shadow-soft' : 'text-muted hover:text-carbon'}`}>
            Sin leer
            {unread > 0 && <span className="px-1.5 rounded-full bg-zred text-white text-[10.5px] nums">{unread}</span>}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1 px-3 pb-3">
        {Object.entries(groups).map(([label, arr]) => (
          <div key={label} className="mb-3">
            <div className="px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted">{label}</div>
            <div>
              {arr.map((n: Notification) => {
                const user = profiles.find(u => u.id === n.userId)
                const meta = NOTIF_ICON[n.type] || { ic: <Ic.Bell width="13" height="13" />, bg: 'bg-soft', tx: 'text-carbon' }
                return (
                  <button type="button" key={n.id} onClick={() => onMarkRead?.(n.id)}
                    className="group w-full text-left p-3 rounded-md hover:bg-soft transition-colors flex items-start gap-3 relative">
                    {n.unread && <span className="absolute left-1 top-5 size-1.5 rounded-full bg-zred" />}
                    <div className="relative shrink-0">
                      <Avatar user={user} size={36} />
                      <span className={`absolute -bottom-1 -right-1 size-5 rounded-full ring-2 ring-white inline-flex items-center justify-center ${meta.bg} ${meta.tx}`}>
                        {meta.ic}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] leading-snug text-carbon">{n.title}</div>
                      {n.body && <div className="text-[12px] text-muted mt-0.5">{n.body}</div>}
                      <div className="text-[11.5px] text-muted mt-1">{timeAgo(n.createdAt)}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-12 rounded-full bg-soft inline-flex items-center justify-center text-muted mb-3">
              <Ic.Check width="20" height="20" />
            </div>
            <div className="text-[14px] font-semibold mb-1">Todo al día</div>
            <div className="text-[12.5px] text-muted">No tienes notificaciones nuevas.</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-line2 flex items-center justify-between shrink-0">
        <span className="text-[12px] text-muted">{unread} sin leer · {notifications.length} totales</span>
        <Button variant="secondary" size="sm" onClick={() => onMarkAllRead?.()} disabled={unread === 0}>
          <Ic.Check width="14" height="14" /> Marcar todas leídas
        </Button>
      </div>
    </div>
  )
}
