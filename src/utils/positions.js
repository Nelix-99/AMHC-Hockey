// All positions as % of the SVG viewBox (300 × 500).
// Field occupies x: 10–290, y: 20–480.

export const POSITIONS_8 = [
  { id: 'gk', label: 'GK', x: 50,   y: 86 },
  { id: 'd1', label: 'D',  x: 20,   y: 71 },
  { id: 'd2', label: 'D',  x: 50,   y: 71 },
  { id: 'd3', label: 'D',  x: 80,   y: 71 },
  { id: 'm1', label: 'M',  x: 50,   y: 51 },
  { id: 'f1', label: 'V',  x: 20,   y: 27 },
  { id: 'f2', label: 'V',  x: 50,   y: 27 },
  { id: 'f3', label: 'V',  x: 80,   y: 27 },
]

export const POSITIONS_7 = [
  { id: 'gk', label: 'GK', x: 50,   y: 86 },
  { id: 'd1', label: 'D',  x: 28,   y: 71 },
  { id: 'd2', label: 'D',  x: 72,   y: 71 },
  { id: 'm1', label: 'M',  x: 28,   y: 51 },
  { id: 'm2', label: 'M',  x: 72,   y: 51 },
  { id: 'f1', label: 'V',  x: 28,   y: 27 },
  { id: 'f2', label: 'V',  x: 72,   y: 27 },
]

export const POSITIONS_6 = [
  { id: 'gk', label: 'GK', x: 50,   y: 86 },
  { id: 'd1', label: 'D',  x: 28,   y: 69 },
  { id: 'd2', label: 'D',  x: 72,   y: 69 },
  { id: 'm1', label: 'M',  x: 50,   y: 51 },
  { id: 'f1', label: 'V',  x: 28,   y: 30 },
  { id: 'f2', label: 'V',  x: 72,   y: 30 },
]

export const POSITIONS_5 = [
  { id: 'gk', label: 'GK', x: 50,   y: 86 },
  { id: 'd1', label: 'D',  x: 28,   y: 67 },
  { id: 'd2', label: 'D',  x: 72,   y: 67 },
  { id: 'f1', label: 'V',  x: 28,   y: 33 },
  { id: 'f2', label: 'V',  x: 72,   y: 33 },
]

const MAP = { 5: POSITIONS_5, 6: POSITIONS_6, 7: POSITIONS_7, 8: POSITIONS_8 }

export function getPositions(format) {
  const base = MAP[format] ?? POSITIONS_8
  return base.map(p => ({ ...p, playerId: null }))
}

export const FORMAT_OPTIONS = [
  { value: 8, label: '8 v 8' },
  { value: 7, label: '7 v 7' },
  { value: 6, label: '6 v 6' },
  { value: 5, label: '5 v 5' },
]

export function formatTime(ms) {
  if (!ms || ms < 0) return '0:00'
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function getInitials(name = '') {
  return name.split(' ').filter(Boolean).map(w => w[0].toUpperCase()).slice(0, 2).join('')
}

export const HALF_DURATION_MS = 30 * 60 * 1000 // 30 minutes

export const TEAM_NAME = 'MO10-Wit'
