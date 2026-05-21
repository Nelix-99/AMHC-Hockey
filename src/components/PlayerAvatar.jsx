import { getInitials } from '../utils/positions'

const COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f97316', // orange
  '#14b8a6', // teal
  '#ef4444', // red
  '#a855f7', // purple
  '#06b6d4', // cyan
  '#f59e0b', // amber
  '#10b981', // emerald
  '#6366f1', // indigo
  '#f43f5e', // rose
  '#0ea5e9', // sky
  '#d946ef', // fuchsia
  '#84cc16', // lime
  '#fb923c', // amber-orange
]

function colorFor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

export default function PlayerAvatar({ player, size = 'md' }) {
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-base' : 'w-10 h-10 text-sm'

  if (player?.photo) {
    return (
      <img
        src={player.photo}
        alt={player.name}
        className={`${sz} rounded-full object-cover flex-shrink-0 border-2 border-white/50`}
      />
    )
  }
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: colorFor(player?.name) }}
    >
      {getInitials(player?.name)}
    </div>
  )
}
