import { describe, it, expect, afterEach, vi } from 'vitest'
import { getAllowedEmailDomains, isAllowedEmail } from './auth-domain'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('getAllowedEmailDomains', () => {
  it('devuelve lista vacía cuando la variable no está definida', () => {
    vi.stubEnv('NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS', '')
    expect(getAllowedEmailDomains()).toEqual([])
  })

  it('parsea dominios separados por coma, con espacios y mayúsculas', () => {
    vi.stubEnv('NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS', ' Zivelo.mx , zivelo.com ,')
    expect(getAllowedEmailDomains()).toEqual(['zivelo.mx', 'zivelo.com'])
  })
})

describe('isAllowedEmail', () => {
  it('permite cualquier email si no hay restricción configurada', () => {
    vi.stubEnv('NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS', '')
    expect(isAllowedEmail('alguien@gmail.com')).toBe(true)
  })

  it('acepta emails del dominio permitido sin importar mayúsculas', () => {
    vi.stubEnv('NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS', 'zivelo.mx')
    expect(isAllowedEmail('raul@zivelo.mx')).toBe(true)
    expect(isAllowedEmail('raul@ZIVELO.MX')).toBe(true)
  })

  it('rechaza emails de otros dominios', () => {
    vi.stubEnv('NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS', 'zivelo.mx')
    expect(isAllowedEmail('alguien@gmail.com')).toBe(false)
    expect(isAllowedEmail('alguien@zivelo.mx.evil.com')).toBe(false)
  })

  it('acepta cualquiera de los dominios cuando hay varios', () => {
    vi.stubEnv('NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS', 'zivelo.mx,zivelo.com')
    expect(isAllowedEmail('a@zivelo.mx')).toBe(true)
    expect(isAllowedEmail('a@zivelo.com')).toBe(true)
    expect(isAllowedEmail('a@otra.com')).toBe(false)
  })

  it('rechaza emails malformados, null o undefined cuando hay restricción', () => {
    vi.stubEnv('NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS', 'zivelo.mx')
    expect(isAllowedEmail('sin-arroba')).toBe(false)
    expect(isAllowedEmail('')).toBe(false)
    expect(isAllowedEmail(null)).toBe(false)
    expect(isAllowedEmail(undefined)).toBe(false)
  })
})
