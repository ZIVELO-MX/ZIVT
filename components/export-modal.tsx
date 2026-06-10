'use client'

import { useState } from 'react'
import { Ic } from '@/components/icons'
import { Button } from './ui'
import { exportToCSV, exportToJSON, toCSV, toJSON, taskToExportRow, validateImportText } from '@/lib/utils'

export function ExportButton({ data, projects, profiles, filename = 'export', viewName = 'tareas' }: any) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<'csv' | 'json' | 'prompt' | null>(null)
  const [instruction, setInstruction] = useState('genera un resumen ejecutivo agrupado por proyecto')
  const [tab, setTab] = useState<'export' | 'import' | 'prompt'>('export')
  const [importText, setImportText] = useState('')
  const [importResult, setImportResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | null>(null)

  const rows = data.map((t: any) => taskToExportRow(t, projects, profiles))

  function getContent(format: 'csv' | 'json'): string {
    return format === 'csv' ? toCSV(rows) : toJSON(rows)
  }

  function handleDownload(format: 'csv' | 'json') {
    const fname = `${filename}-${new Date().toISOString().split('T')[0]}`
    if (format === 'csv') exportToCSV(rows, fname)
    else exportToJSON(rows, fname)
    setCopied(format)
    setTimeout(() => setCopied(null), 2000)
  }

  function handleCopy(format: 'csv' | 'json') {
    navigator.clipboard.writeText(getContent(format)).then(() => {
      setCopied(format)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  function handleValidateImport() {
    setImportResult(validateImportText(importText))
  }

  const SCHEMA_FIELDS = [
    { name: 'title', type: 'string', desc: 'Título de la tarea' },
    { name: 'project', type: 'string', desc: 'Nombre del proyecto' },
    { name: 'status', type: 'string', desc: 'Estado (todo, progress, review, done, blocked)' },
    { name: 'tag', type: 'string', desc: 'Etiqueta (feature, backend, frontend, design, qa, planning, idea, bug)' },
    { name: 'priority', type: 'string', desc: 'Prioridad (low, med, high)' },
    { name: 'assignees', type: 'string', desc: 'Nombres de asignados (separados por coma)' },
    { name: 'due', type: 'string', desc: 'Fecha de vencimiento (YYYY-MM-DD) o —' },
    { name: 'subtasks', type: 'string', desc: 'Progreso de subtareas (ej: 2/5)' },
    { name: 'comments', type: 'number', desc: 'Número de comentarios' },
    { name: 'created', type: 'string', desc: 'Fecha de creación' },
  ]

  function schemaToMarkdown() {
    return SCHEMA_FIELDS.map(f => `- \`${f.name}\` (${f.type}): ${f.desc}`).join('\n')
  }

  function generatePrompt() {
    const sample = rows.slice(0, 2)
    return [
      `Eres un asistente que genera datos de prueba para un panel de tareas.`,
      ``,
      `## Schema de los datos`,
      ``,
      `Cada registro debe tener estos campos:`,
      schemaToMarkdown(),
      ``,
      `## Formato de salida`,
      `Debes devolver ÚNICAMENTE el contenido en el formato solicitado, sin explicaciones ni markdown alrededor.`,
      ``,
      `## Instrucción`,
      instruction,
      ``,
      `## Ejemplo de una fila válida`,
      JSON.stringify(sample[0] || SCHEMA_FIELDS.reduce((acc, f) => ({ ...acc, [f.name]: f.type === 'number' ? 0 : '—' }), {}), null, 2),
    ].join('\n')
  }

  function handleCopyPrompt() {
    navigator.clipboard.writeText(generatePrompt()).then(() => {
      setCopied('prompt')
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <>
      <button type="button" onClick={() => { setOpen(true); setExportFormat(null); setImportResult(null); setImportText('') }}
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

            <div className="flex border-b border-line2 px-4 sm:px-6">
              {[
                { k: 'export', l: 'Exportar' },
                { k: 'import', l: 'Importar' },
                { k: 'prompt', l: 'Prompt IA' },
              ].map(t => (
                <button key={t.k} type="button" onClick={() => { setTab(t.k as any); if (t.k === 'export') setExportFormat('csv'); else setExportFormat(null); setImportResult(null) }}
                  className={`px-4 h-10 text-[13px] font-semibold border-b-2 transition-colors ${tab === t.k ? 'border-zred text-carbon' : 'border-transparent text-muted hover:text-carbon'}`}>
                  {t.l}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
              {tab === 'export' && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] text-muted">{data.length} registros de {viewName}</div>
                    <div className="flex bg-soft rounded-lg p-0.5 border border-line2">
                      {(['csv', 'json'] as const).map(f => (
                        <button key={f} type="button" onClick={() => setExportFormat(f)}
                          className={`px-4 h-8 rounded-md text-[12.5px] font-semibold transition-all ${exportFormat === f ? 'bg-white text-carbon shadow-sm' : 'text-muted hover:text-carbon'}`}>
                          {f.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border border-line2 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 h-9 bg-soft/70 border-b border-line2">
                      <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                        {exportFormat === 'csv' ? 'CSV' : 'JSON'} — primeras {Math.min(10, data.length)} fila(s)
                      </span>
                      <span className="text-[11px] font-mono text-muted">
                        {new Blob([getContent(exportFormat || 'csv')]).size.toLocaleString()} bytes
                      </span>
                    </div>
                    <pre className="p-3 text-[11px] font-mono leading-relaxed text-carbon overflow-x-auto max-h-48 bg-white">
                      {exportFormat === 'csv'
                        ? toCSV(rows.slice(0, 10))
                        : toJSON(rows.slice(0, 10))}
                    </pre>
                  </div>

                  <div className="flex gap-3 justify-center pt-2">
                    <Button variant="primary" size="md" onClick={() => handleDownload(exportFormat || 'csv')}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M8 11l4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
                      Descargar todo
                    </Button>
                    <Button variant="secondary" size="md" onClick={() => handleCopy(exportFormat || 'csv')}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      Copiar todo
                    </Button>
                  </div>
                  {copied && ['csv', 'json'].includes(copied) && (
                    <div className="text-[12px] text-zred font-medium text-center">✓ Copiado al portapapeles</div>
                  )}
                </>
              )}

              {tab === 'import' && (
                <>
                  <div className="text-[13px] text-muted">
                    Pega el contenido CSV o JSON para validar antes de importar.
                  </div>
                  <textarea value={importText} onChange={(e) => setImportText(e.target.value)}
                    placeholder={`Ejemplo CSV:\ntitle,project,status\nMi tarea,Proyecto A,todo\n\nEjemplo JSON:\n[{"title":"Mi tarea","project":"Proyecto A","status":"todo"}]`}
                    className="w-full h-44 px-4 py-3 rounded-md border border-line2 text-[12.5px] font-mono bg-white outline-none focus:border-zred resize-none" />
                  <Button variant="primary" size="md" onClick={handleValidateImport} className="w-full">
                    Validar formato
                  </Button>
                  {importResult && (
                    <div className={`rounded-md p-3 text-[13px] font-medium ${importResult.ok ? 'bg-[#ECFDF3] text-[#1E6B3C]' : 'bg-[#FFE8E8] text-[#B53A3A]'}`}>
                      {importResult.ok ? '✓ ' : '✗ '}{importResult.msg}
                    </div>
                  )}
                </>
              )}

              {tab === 'prompt' && (
                <>
                  <div className="text-[13px] text-muted space-y-2">
                    <p>Pide a la IA que genere datos en CSV o JSON siguiendo el schema de abajo.</p>
                    <p className="text-[12px] bg-[#EEF0FF] rounded-md p-3 text-[#3A47B5]">
                      <strong>Flujo:</strong> Copia el prompt → pégalo en la IA → ella responde con datos → copia esa respuesta en la pestaña <strong>Importar</strong> para validar.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(['csv', 'json'] as const).map(format => (
                      <button key={format} type="button" onClick={() => {
                        const fmt = format === 'csv' ? 'CSV' : 'JSON'
                        const base = generatePrompt()
                        const extra = `\n\nDevuélveme los datos en formato ${fmt} con las columnas exactas del schema. Solo el contenido ${fmt}, sin markdown.`
                        navigator.clipboard.writeText(base + extra).then(() => {
                          setCopied('prompt')
                          setTimeout(() => setCopied(null), 2000)
                        })
                      }}
                        className="flex flex-col items-center justify-center gap-2 p-5 rounded-lg border border-line2 hover:border-zred/40 hover:bg-tint/30 transition-all text-center">
                        <div className="font-semibold text-[14px] text-carbon">
                          {format === 'csv' ? 'CSV' : 'JSON'}
                        </div>
                        <div className="text-[11px] text-muted">Prompt para generar {format.toUpperCase()}</div>
                        {copied === 'prompt' && <div className="text-[11px] text-zred font-medium">✓ Copiado</div>}
                      </button>
                    ))}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">¿Qué datos quieres que genere?</div>
                    <input value={instruction} onChange={(e) => setInstruction(e.target.value)}
                      placeholder="Ej: 5 tareas de ejemplo para un proyecto de e-commerce..."
                      className="w-full h-10 px-3 rounded-md border border-line text-[13px] outline-none focus:border-zred" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">Schema que se incluye en el prompt</div>
                    <pre className="bg-soft rounded-md p-3 text-[11px] font-mono text-muted overflow-x-auto max-h-36">
                      {SCHEMA_FIELDS.map(f => `${f.name} (${f.type}): ${f.desc}`).join('\n')}
                    </pre>
                  </div>
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
