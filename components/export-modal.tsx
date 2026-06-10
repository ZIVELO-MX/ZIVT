'use client'

import { useState } from 'react'
import { Ic } from '@/components/icons'
import { Button } from './ui'
import { exportToCSV, exportToJSON, taskToExportRow } from '@/lib/utils'
import type { Task, Project, Profile } from '@/lib/supabase/types'

type Exportable = Record<string, any>

function toggle<T>(arr: T[], v: T): T[] { return arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v] }

export function ExportButton({ data, projects, profiles, filename = 'export', viewName = 'tareas' }: any) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<'csv' | 'json' | 'prompt' | null>(null)
  const [instruction, setInstruction] = useState('genera un resumen ejecutivo agrupado por proyecto')
  const [selected, setSelected] = useState<string[]>([])
  const [tab, setTab] = useState<'export' | 'import' | 'prompt'>('export')

  function handleExport(format: 'csv' | 'json') {
    const rows = data.map((t: any) => taskToExportRow(t, projects, profiles))
    const fname = `${filename}-${new Date().toISOString().split('T')[0]}`
    if (format === 'csv') exportToCSV(rows, fname)
    else exportToJSON(rows, fname)
    setCopied(format)
    setTimeout(() => setCopied(null), 2000)
  }

  function generatePrompt() {
    const sample = data.slice(0, 2).map((t: any) => taskToExportRow(t, projects, profiles))
    const fields = Object.keys(sample[0] || {}).map(k => `${k}: ${typeof (sample[0]?.[k] ?? '') === 'number' ? 'number' : 'string'}`).join(', ')
    return [
      `Exporté ${data.length} registros de ${viewName} desde Zivelo Panel en formato JSON.`,
      `Campos: ${fields}`,
      ``,
      `Ejemplo de datos:`,
      JSON.stringify(sample, null, 2),
      ``,
      `Instrucción: ${instruction}`,
      ``,
      `Devuelve solo el resultado listo para usar, sin explicaciones adicionales.`,
    ].join('\n')
  }

  function handleCopyPrompt() {
    navigator.clipboard.writeText(generatePrompt()).then(() => {
      setCopied('prompt')
      setTimeout(() => setCopied(null), 2000)
    })
  }

  function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.json'
    input.onchange = (e: any) => {
      const file = e.target.files?.[0]
      if (!file) return
    }
    input.click()
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="btn-press h-10 px-4 rounded-full border border-line bg-white text-carbon text-[13px] font-semibold hover:border-zred hover:text-zred inline-flex items-center gap-2 transition-all">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M8 11l4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
        Exportar / Importar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <button type="button" className="absolute inset-0 bg-carbon/30 fade-in cursor-default" onClick={() => setOpen(false)} aria-label="Cerrar" />
          <div className="relative bg-white rounded-t-xl sm:rounded-lg shadow-pop border border-line2 pop-in flex flex-col w-full max-h-[90vh] sm:max-h-[80vh]" style={{ maxWidth: 520 }}>
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-line2 shrink-0">
              <h3 className="font-semibold text-[16px]">Exportar / Importar datos</h3>
              <button type="button" onClick={() => setOpen(false)} className="size-8 rounded-full hover:bg-soft inline-flex items-center justify-center">
                <Ic.X width="18" height="18" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-line2 px-4 sm:px-6">
              {[
                { k: 'export', l: 'Exportar' },
                { k: 'import', l: 'Importar' },
                { k: 'prompt', l: 'Prompt IA' },
              ].map(t => (
                <button key={t.k} type="button" onClick={() => setTab(t.k as any)}
                  className={`px-4 h-10 text-[13px] font-semibold border-b-2 transition-colors ${tab === t.k ? 'border-zred text-carbon' : 'border-transparent text-muted hover:text-carbon'}`}>
                  {t.l}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5">
              {tab === 'export' && (
                <>
                  <div className="text-[13px] text-muted">
                    {data.length} registros de {viewName} visibles actualmente.
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => handleExport('csv')}
                      className="flex flex-col items-center justify-center gap-2 p-6 rounded-lg border border-line2 hover:border-zred/40 hover:bg-tint/30 transition-all text-center">
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>
                      <div className="font-semibold text-[14px] text-carbon">CSV</div>
                      <div className="text-[11px] text-muted">Compatible con Excel, Sheets</div>
                    </button>
                    <button type="button" onClick={() => handleExport('json')}
                      className="flex flex-col items-center justify-center gap-2 p-6 rounded-lg border border-line2 hover:border-zred/40 hover:bg-tint/30 transition-all text-center">
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><path d="M7 4a2 2 0 0 0-2 2v4l-1 2 1 2v4a2 2 0 0 0 2 2"/><path d="M17 4a2 2 0 0 1 2 2v4l1 2-1 2v4a2 2 0 0 1-2 2"/><circle cx="12" cy="12" r="1.5"/></svg>
                      <div className="font-semibold text-[14px] text-carbon">JSON</div>
                      <div className="text-[11px] text-muted">Estructura anidada, programática</div>
                    </button>
                  </div>
                  {copied === 'csv' && <div className="text-[12px] text-zred font-medium text-center">✓ CSV exportado</div>}
                  {copied === 'json' && <div className="text-[12px] text-zred font-medium text-center">✓ JSON exportado</div>}
                </>
              )}

              {tab === 'import' && (
                <>
                  <div className="text-[13px] text-muted">
                    Importa tareas desde un archivo CSV o JSON. El formato debe coincidir con el de exportación.
                  </div>
                  <div className="flex flex-col items-center gap-4 py-6">
                    <button type="button" onClick={handleImport}
                      className="flex flex-col items-center gap-3 p-8 rounded-lg border-2 border-dashed border-line2 hover:border-zred/40 hover:bg-tint/30 transition-all w-full text-center">
                      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><path d="M12 3v12M8 11l4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
                      <div className="font-semibold text-[14px] text-carbon">Seleccionar archivo</div>
                      <div className="text-[11px] text-muted">CSV o JSON — hasta 500 filas</div>
                    </button>
                    <div className="text-[11px] text-muted">
                      ⚠️ Disponible próximamente con validación y preview.
                    </div>
                  </div>
                </>
              )}

              {tab === 'prompt' && (
                <>
                  <div className="text-[13px] text-muted">
                    Genera un prompt describiendo el formato de tus datos para que una IA los procese.
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">¿Qué debe hacer la IA?</div>
                    <input value={instruction} onChange={(e) => setInstruction(e.target.value)}
                      placeholder="Ej: calcula totales por proyecto, genera un gráfico..."
                      className="w-full h-10 px-3 rounded-md border border-line text-[13px] outline-none focus:border-zred" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">Schema ({data.length} registros)</div>
                    <pre className="bg-soft rounded-md p-3 text-[11px] font-mono text-muted overflow-x-auto max-h-36">
                      {JSON.stringify(taskToExportRow(data[0] || {}, projects, profiles), null, 2)}
                    </pre>
                  </div>
                  <Button variant="primary" size="md" onClick={handleCopyPrompt} className="w-full">
                    {copied === 'prompt' ? '✓ Copiado al portapapeles' : 'Copiar prompt al portapapeles'}
                  </Button>
                </>
              )}
            </div>

            <div className="px-4 sm:px-6 py-4 border-t border-line2 flex justify-end gap-2 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
