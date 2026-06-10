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
