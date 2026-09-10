// Dates are stored as ISO (YYYY-MM-DD) and always displayed day-before-month,
// never the American month-first order.

const MONTHS_SHORT = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']

// '2026-09-12' → '12-09'
export function formatDayMonth(iso) {
  const [, m, d] = iso.split('-')
  return `${d}-${m}`
}

// '2026-09-12' → '12-09-2026'
export function formatFullDate(iso) {
  const [y, m, d] = iso.split('-')
  return `${d}-${m}-${y}`
}

// '2026-09-12' → '12 sep'
export function formatShortDate(iso) {
  const [, m, d] = iso.split('-')
  return `${Number(d)} ${MONTHS_SHORT[Number(m) - 1]}`
}
