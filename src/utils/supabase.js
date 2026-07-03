import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Convert DB row → app object
export const fromDb = {
  player: (row) => ({
    id: row.id,
    name: row.name,
    photo: row.photo || null,
    archived: row.archived || false,
  }),
  match: (row) => ({
    id: row.id,
    date: row.date,
    opponent: row.opponent,
    isHome: row.is_home,
    location: row.location || '',
    scoreHome: row.score_home ?? null,
    scoreAway: row.score_away ?? null,
    lineup: row.lineup || [],
    attendees: row.attendees || [],
    attendance: row.attendance || [],
    lineupSnapshot: row.lineup_snapshot || {},
  }),
}

// Convert app object → DB row
export const toDb = {
  player: (p) => ({
    id: p.id,
    name: p.name,
    photo: p.photo || null,
    archived: p.archived || false,
  }),
  match: (m) => ({
    id: m.id,
    date: m.date,
    opponent: m.opponent,
    is_home: m.isHome,
    location: m.location || '',
    score_home: m.scoreHome ?? null,
    score_away: m.scoreAway ?? null,
    lineup: m.lineup || [],
    attendees: m.attendees || [],
    attendance: m.attendance || [],
  }),
  // Only maps keys that are actually present, so a partial update never
  // wipes fields the caller didn't touch (score, lineup, attendance, …)
  matchPartial: (m) => {
    const row = {}
    if ('date' in m) row.date = m.date
    if ('opponent' in m) row.opponent = m.opponent
    if ('isHome' in m) row.is_home = m.isHome
    if ('location' in m) row.location = m.location || ''
    if ('scoreHome' in m) row.score_home = m.scoreHome ?? null
    if ('scoreAway' in m) row.score_away = m.scoreAway ?? null
    if ('lineup' in m) row.lineup = m.lineup || []
    if ('attendees' in m) row.attendees = m.attendees || []
    if ('attendance' in m) row.attendance = m.attendance || []
    return row
  },
}
