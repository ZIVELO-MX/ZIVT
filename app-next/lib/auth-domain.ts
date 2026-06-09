// Restricción de acceso por dominio de email corporativo (cuentas Zoho de Zivelo).
// Si NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS está vacío, no se aplica restricción.

export function getAllowedEmailDomains(): string[] {
  return (process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS ?? '')
    .split(',')
    .map(d => d.trim().toLowerCase())
    .filter(Boolean)
}

export function isAllowedEmail(email: string | undefined | null): boolean {
  const domains = getAllowedEmailDomains()
  if (domains.length === 0) return true
  const domain = email?.split('@')[1]?.toLowerCase()
  return !!domain && domains.includes(domain)
}
