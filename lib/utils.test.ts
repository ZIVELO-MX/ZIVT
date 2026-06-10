import { describe, it, expect } from 'vitest'
import { toCSV, validateImportText } from './utils'

describe('toCSV', () => {
  it('genera header desde las keys de la primera fila', () => {
    const csv = toCSV([{ id: 1, name: 'Ana' }])
    expect(csv).toBe('id,name\n1,Ana')
  })

  it('devuelve string vacío sin filas', () => {
    expect(toCSV([])).toBe('')
  })

  it('escapa comas, comillas y saltos de línea', () => {
    const csv = toCSV([{ a: 'hola, mundo', b: 'di "hola"', c: 'línea1\nlínea2' }])
    expect(csv.split('\n')[1] + '\n' + csv.split('\n')[2]).toBe(
      '"hola, mundo","di ""hola""","línea1\nlínea2"'
    )
  })

  it('serializa null y undefined como celda vacía', () => {
    const csv = toCSV([{ a: null, b: undefined, c: 0 }])
    expect(csv).toBe('a,b,c\n,,0')
  })

  it('serializa objetos como JSON escapado', () => {
    const csv = toCSV([{ a: { x: 1 } }])
    expect(csv).toBe('a\n"{""x"":1}"')
  })
})

describe('validateImportText', () => {
  it('rechaza texto vacío', () => {
    expect(validateImportText('')).toEqual({ ok: false, msg: 'Pega el contenido CSV o JSON primero.' })
    expect(validateImportText('   ')).toEqual({ ok: false, msg: 'Pega el contenido CSV o JSON primero.' })
  })

  it('valida JSON array correcto', () => {
    const r = validateImportText('[{"title":"T1","status":"todo"}]')
    expect(r.ok).toBe(true)
    expect(r.msg).toContain('JSON')
    expect(r.msg).toContain('1 registro')
  })

  it('rechaza JSON que no es array', () => {
    const r = validateImportText('{"title":"T1"}')
    expect(r.ok).toBe(false)
    expect(r.msg).toContain('no es un arreglo')
  })

  it('rechaza JSON array vacío', () => {
    const r = validateImportText('[]')
    expect(r.ok).toBe(false)
    expect(r.msg).toContain('vacío')
  })

  it('valida CSV correcto', () => {
    const r = validateImportText('title,project\nT1,ProjA\nT2,ProjB')
    expect(r.ok).toBe(true)
    expect(r.msg).toContain('CSV')
    expect(r.msg).toContain('2 registro')
  })

  it('rechaza CSV sin datos', () => {
    const r = validateImportText('title,project')
    expect(r.ok).toBe(false)
    expect(r.msg).toContain('al menos un encabezado')
  })

  it('rechaza CSV con columnas inconsistentes', () => {
    const r = validateImportText('title,project,status\nT1,ProjA\nT2,ProjB,done')
    expect(r.ok).toBe(false)
    expect(r.msg).toContain('incorrecto')
  })
})
