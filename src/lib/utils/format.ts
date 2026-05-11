/**
 * Format a cent amount as "€55,00" (KILLERCLO house format: symbol-first, comma decimal).
 * Standard es-ES puts the symbol after (55,00 €), so we compose manually.
 */
export function formatPriceEUR(cents: number): string {
  const amount = (cents / 100).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `€${amount}`
}

/**
 * Format a cent amount as a plain number string "55,00" — for use inside compound labels.
 */
export function formatAmountEUR(cents: number): string {
  return (cents / 100).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Format a Date (or ISO string) in Spanish locale.
 * Default: "11 de mayo de 2026"
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  },
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-ES', options)
}

/**
 * Format a Date as short: "11 may 2026"
 */
export function formatDateShort(date: Date | string): string {
  return formatDate(date, { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * Format a Date as datetime: "11 may 2026, 14:30"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  })
}

/**
 * Relative time: "hace 3 días", "en 2 horas"
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diffMs = d.getTime() - Date.now()
  const diffSecs = Math.round(diffMs / 1000)
  const diffMins = Math.round(diffSecs / 60)
  const diffHours = Math.round(diffMins / 60)
  const diffDays = Math.round(diffHours / 24)

  const rtf = new Intl.RelativeTimeFormat('es-ES', { numeric: 'auto' })

  if (Math.abs(diffSecs) < 60) return rtf.format(diffSecs, 'second')
  if (Math.abs(diffMins) < 60) return rtf.format(diffMins, 'minute')
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour')
  return rtf.format(diffDays, 'day')
}

/**
 * Format a countdown as "HH:MM:SS"
 */
export function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

/**
 * Uppercase + trim for UI labels (all KILLERCLO labels are uppercase).
 */
export function labelify(str: string): string {
  return str.trim().toUpperCase()
}

/**
 * Slugify a string: "HOODIE Blood Wash" → "hoodie-blood-wash"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
