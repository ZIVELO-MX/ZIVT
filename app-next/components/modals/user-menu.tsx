'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Ic } from '@/components/icons'
import { Avatar } from '@/components/ui'

export function UserMenu({ open, anchorRef, onClose, user, dark, onToggleDark, onNavigate, onOpenNotifs, onOpenShortcuts, onOpenPrefs }: any) {
  const router = useRouter()
  const popRef = useRef(null)

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
  if (!user) return null

  return (
    <div ref={popRef} className="absolute right-8 top-[68px] z-40 w-[300px] bg-white rounded-lg border border-line2 shadow-pop pop-in overflow-hidden">
      <div className="p-4 border-b border-line2 flex items-center gap-3">
        <Avatar user={user} size={44} />
        <div className="min-w-0">
          <div className="font-bold text-[14px] truncate">{user.name}</div>
          <div className="text-[12px] text-muted truncate">{user.email}</div>
        </div>
      </div>

      <div className="p-2">
        {[
          { ic: <Ic.Users width="15" height="15" />,   l: 'Mi perfil',          k: '⌘P', onClick: () => { onClose(); onNavigate?.('profile') } },
          { ic: <Ic.Settings width="15" height="15" />, l: 'Preferencias',       k: '⌘,', onClick: () => { onClose(); onOpenPrefs?.() } },
          { ic: <Ic.Bell width="15" height="15" />,    l: 'Notificaciones',      k: '',   onClick: () => { onClose(); onOpenNotifs?.() } },
          { ic: <Ic.Sparkle width="15" height="15" />, l: 'Atajos de teclado',   k: '?',  onClick: () => { onClose(); onOpenShortcuts?.() } },
        ].map(it => (
          <button type="button" key={it.l} onClick={it.onClick} className="w-full flex items-center gap-3 px-3 h-9 rounded-md hover:bg-soft text-[13px] text-left">
            <span className="text-muted">{it.ic}</span>
            <span className="flex-1">{it.l}</span>
            {it.k && <kbd className="font-mono text-[10.5px] text-muted bg-soft border border-line2 rounded px-1.5 py-0.5">{it.k}</kbd>}
          </button>
        ))}

        <button type="button" onClick={onToggleDark} className="w-full flex items-center gap-3 px-3 h-9 rounded-md hover:bg-soft text-[13px] text-left">
          <span className="text-muted">
            {dark ? (
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
            )}
          </span>
          <span className="flex-1">{dark ? 'Modo claro' : 'Modo oscuro'}</span>
          <span className={`inline-flex items-center w-9 h-5 rounded-full transition-colors ${dark ? 'bg-zred' : 'bg-soft border border-line'}`}>
            <span className={`size-4 rounded-full bg-white transition-transform shadow ${dark ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
          </span>
        </button>
      </div>

      <div className="p-2 border-t border-line2">
        <button type="button"
          onClick={async () => {
            try {
              localStorage.removeItem('zivelo-dark')
              localStorage.removeItem('zivelo-sidebar')
              localStorage.removeItem('zivelo-density')
              localStorage.removeItem('zivelo-remember')
            } catch {}
            await createClient().auth.signOut()
            router.push('/login')
          }}
          className="w-full flex items-center gap-3 px-3 h-9 rounded-md hover:bg-tint text-[13px] text-left text-zred font-semibold cursor-pointer">
          <Ic.Arrow width="15" height="15" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
