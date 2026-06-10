export function toCSV(rows: any[]): string {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : []
  const escapeCell = (value: any) => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'object') return escapeCell(JSON.stringify(value))
    const text = String(value)
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }

  return [
    headers.join(','),
    ...rows.map(row => headers.map(header => escapeCell(row[header])).join(',')),
  ].join('\n')
}

export function exportToCSV(rows: any[], filename: string) {
  if (typeof window === 'undefined') return

  const blob = new Blob([`\uFEFF${toCSV(rows)}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function toJSON(rows: any[]): string {
  return JSON.stringify(rows, null, 2)
}

export function exportToJSON(rows: any[], filename: string) {
  if (typeof window === 'undefined') return

  const blob = new Blob([toJSON(rows)], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.json') ? filename : `${filename}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export type ValidationResult = { ok: boolean; msg: string }

export function validateImportText(text: string): ValidationResult {
  const trimmed = text.trim()
  if (!trimmed) return { ok: false, msg: 'Pega el contenido CSV o JSON primero.' }

  try {
    const parsed = JSON.parse(trimmed)
    if (!Array.isArray(parsed)) return { ok: false, msg: 'JSON válido pero no es un arreglo. Se espera un arreglo de objetos.' }
    if (parsed.length === 0) return { ok: false, msg: 'El arreglo está vacío. No hay datos para importar.' }
    return { ok: true, msg: `JSON válido: ${parsed.length} registro(s) detectado(s).` }
  } catch {
    const lines = trimmed.split('\n').filter(l => l.trim())
    if (lines.length < 2) return { ok: false, msg: 'CSV debe tener al menos un encabezado y una fila de datos.' }
    const headers = lines[0].split(',').map(h => h.trim())
    if (headers.length < 2) return { ok: false, msg: 'CSV debe tener al menos 2 columnas.' }
    const dataLines = lines.slice(1)
    let errors = 0
    dataLines.forEach((line, i) => {
      const cols = line.split(',').map(c => c.trim())
      if (cols.length !== headers.length) errors++
    })
    if (errors > 0) return { ok: false, msg: `CSV: ${dataLines.length} fila(s), ${errors} con número incorrecto de columnas. Revisa el formato.` }
    return { ok: true, msg: `CSV válido: ${dataLines.length} registro(s) con ${headers.length} columna(s).` }
  }
}

export function taskToExportRow(task: any, projects: any[], profiles: any[]): Record<string, any> {
  const project = projects.find(p => p.id === task.project)
  const assignees = (task.assignee || []).map((id: string) => {
    const u = profiles.find(p => p.id === id)
    return u?.name || id
  }).join(', ')
  return {
    title: task.title,
    project: project?.name || '—',
    status: task.col,
    tag: task.tag,
    priority: task.priority,
    assignees: assignees || '—',
    due: task.due || '—',
    subtasks: `${(task.subtasks || []).filter(s => s.d).length}/${(task.subtasks || []).length}`,
    comments: task.comments ?? 0,
    created: task.createdAt || '—',
  }
}
