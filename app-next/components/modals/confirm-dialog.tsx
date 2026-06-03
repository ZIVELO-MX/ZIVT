'use client'

import { useEffect } from 'react'
import { Ic } from '@/components/icons'
import { Button } from '@/components/ui'

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', tone = 'danger', onConfirm, onCancel }: any) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onCancel() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])
  if (!open) return null
  const isDanger = tone === 'danger'
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-carbon/35 fade-in cursor-default" onClick={onCancel} aria-label="Cerrar" />
      <div className="relative bg-white rounded-lg shadow-pop border border-line2 pop-in w-[440px] overflow-hidden">
        <div className="p-6">
          <div className={`size-12 rounded-full mb-4 inline-flex items-center justify-center ${isDanger ? 'bg-tint text-zred' : 'bg-soft text-carbon'}`}>
            {isDanger ? <Ic.Trash width="22" height="22" /> : <Ic.Check width="22" height="22" />}
          </div>
          <h3 className="text-[18px] font-bold tracking-tight mb-2">{title}</h3>
          <p className="text-[13.5px] text-muted leading-relaxed">{message}</p>
        </div>
        <div className="px-6 py-4 bg-soft/60 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={isDanger ? 'primary' : 'dark'} size="sm" onClick={onConfirm}>
            {isDanger && <Ic.Trash width="14" height="14" />}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
