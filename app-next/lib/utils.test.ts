import { describe, it, expect } from 'vitest'
import { toCSV } from './utils'

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
