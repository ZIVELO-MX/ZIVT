export function exportToCSV(rows: any[], filename: string) {
  if (typeof window === 'undefined') return

  const headers = rows.length > 0 ? Object.keys(rows[0]) : []
  const escapeCell = (value: any) => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'object') return escapeCell(JSON.stringify(value))
    const text = String(value)
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }

  const csv = [
    headers.join(','),
    ...rows.map(row => headers.map(header => escapeCell(row[header])).join(',')),
  ].join('\n')

  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
